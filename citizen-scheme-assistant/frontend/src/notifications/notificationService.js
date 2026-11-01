import { apiClient } from '../services/apiClient';
import { profileToAnswers } from '../profile/profileToAnswers';
import { mockAdapter } from '../mock/mockAdapter';

/**
 * Scan citizen profile answers across all schemes.
 * Reuses the existing backend evaluation endpoint or falls back gracefully if engine is offline.
 */
export const scanProfileEligibility = async (answers, language = 'en') => {
  try {
    const res = await apiClient.post('/api/v1/eligibility/scan', {
      answers,
      language,
    });
    if (res?.items && Array.isArray(res.items)) {
      return res.items;
    }
  } catch (error) {
    // If backend endpoint is unavailable or engine is offline, fall back to mockAdapter evaluation
    try {
      const mockRes = await mockAdapter.getSchemes({ search: '' });
      if (mockRes?.schemes) {
        return mockRes.schemes.map((s) => {
          let status = 'NEEDS_VERIFICATION';
          // Check matching criteria against profile answers
          if (s.applicable_states && answers.state && !s.applicable_states.includes('ALL') && !s.applicable_states.includes(answers.state)) {
            status = 'NOT_ELIGIBLE_UNDER_SCREENED_RULES';
          } else if (s.category === 'women-child' && answers.gender && answers.gender !== 'female') {
            status = 'NOT_ELIGIBLE_UNDER_SCREENED_RULES';
          } else {
            status = 'POTENTIALLY_ELIGIBLE';
          }
          return {
            scheme_id: s.id || s.code,
            status,
            scheme_name: s.name,
          };
        });
      }
    } catch {
      return [];
    }
  }
  return [];
};

/**
 * Evaluates whether a status represents likely eligibility.
 * Matches contracts/eligibility-result.schema.json (ELIGIBLE),
 * preliminary screening (ELIGIBLE_LIKELY), and mock adapter (POTENTIALLY_ELIGIBLE).
 */
export const isLikelyEligibleStatus = (status) => {
  if (!status) return false;
  const s = String(status).toUpperCase();
  return (
    s === 'ELIGIBLE' ||
    s === 'ELIGIBLE_LIKELY' ||
    s === 'POTENTIALLY_ELIGIBLE'
  );
};

// In-memory guard to avoid duplicate scans on the same page load
let hasScannedOnLoad = false;

export const resetScanGuard = () => {
  hasScannedOnLoad = false;
};

/**
 * Main re-check eligibility logic.
 * Only executes for logged-in users who have opted into profile_details.
 */
export const checkProfileNotifications = async ({
  user,
  profileDetails,
  language = 'en',
  updateNotifiedSchemes,
  force = false,
}) => {
  // Pre-condition 5: If the user has no saved profile, or hasn't consented, skip entirely
  if (!user || !profileDetails?.answers || !profileDetails?.consent_at) {
    return { notifications: [], newlyEligibleCount: 0, checked: false, skipped: true };
  }

  // Pre-condition 6: Guard against duplicate calls on page load/re-render unless forced
  if (hasScannedOnLoad && !force) {
    return { notifications: [], newlyEligibleCount: 0, checked: false, alreadyRun: true };
  }
  hasScannedOnLoad = true;

  try {
    const mappedAnswers = profileToAnswers(profileDetails.answers);
    const scannedItems = await scanProfileEligibility(mappedAnswers, language);

    const eligibleItems = scannedItems.filter((item) =>
      isLikelyEligibleStatus(item.status)
    );

    const previouslyNotified = new Set(
      Array.isArray(profileDetails.notified_scheme_ids)
        ? profileDetails.notified_scheme_ids
        : []
    );

    // Identify newly likely-eligible schemes
    const newlyEligible = eligibleItems.filter(
      (item) => !previouslyNotified.has(item.scheme_id)
    );

    const now = new Date().toISOString();

    const notifications = newlyEligible.map((item) => ({
      id: `notif-${item.scheme_id}`,
      scheme_id: item.scheme_id,
      scheme_name: item.scheme_name,
      created_at: now,
    }));

    // Update stored set so they aren't repeated on future logins
    if (updateNotifiedSchemes) {
      const allNotified = Array.from(
        new Set([
          ...Array.from(previouslyNotified),
          ...newlyEligible.map((item) => item.scheme_id),
        ])
      );
      await updateNotifiedSchemes(allNotified, now);
    }

    return {
      notifications,
      newlyEligibleCount: newlyEligible.length,
      lastCheckedAt: now,
      checked: true,
    };
  } catch (error) {
    return { notifications: [], newlyEligibleCount: 0, checked: false, error };
  }
};

