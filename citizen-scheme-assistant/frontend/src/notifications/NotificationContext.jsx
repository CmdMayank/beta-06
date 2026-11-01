import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { checkProfileNotifications, resetScanGuard } from './notificationService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, profileDetails, updateNotifiedSchemes } = useAuth();
  const { language } = useLanguage();

  const [notifications, setNotifications] = useState([]);
  const [checking, setChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);
  const [checkStatus, setCheckStatus] = useState(null); // 'no_new' | 'new_found' | null

  const checkingRef = useRef(false);

  // Sync lastCheckedAt from profileDetails
  useEffect(() => {
    if (profileDetails?.last_checked_at) {
      setLastCheckedAt(profileDetails.last_checked_at);
    }
  }, [profileDetails?.last_checked_at]);

  // Reset scan guard and notifications when user changes or logs out
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setCheckStatus(null);
      resetScanGuard();
    }
  }, [user]);

  const runCheck = useCallback(
    async ({ force = false } = {}) => {
      if (!user || !profileDetails?.answers || !profileDetails?.consent_at) {
        return;
      }
      if (checkingRef.current) return;
      checkingRef.current = true;
      setChecking(true);
      setCheckStatus(null);

      try {
        const result = await checkProfileNotifications({
          user,
          profileDetails,
          language,
          updateNotifiedSchemes,
          force,
        });

        if (result.checked) {
          setLastCheckedAt(result.lastCheckedAt);
          if (result.newlyEligibleCount > 0) {
            setNotifications(result.notifications);
            setCheckStatus('new_found');
          } else {
            setCheckStatus('no_new');
          }
        }
      } catch {
        // Silently handle error, do not expose raw errors
      } finally {
        checkingRef.current = false;
        setChecking(false);
      }
    },
    [user, profileDetails, language, updateNotifiedSchemes]
  );

  // Trigger check once on login when user with saved profileDetails arrives
  useEffect(() => {
    if (user && profileDetails?.answers && profileDetails?.consent_at) {
      runCheck({ force: false });
    }
  }, [user, profileDetails?.answers, profileDetails?.consent_at, runCheck]);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unseenCount: notifications.length,
        checking,
        lastCheckedAt,
        checkStatus,
        recheck: () => runCheck({ force: true }),
        dismissNotification,
        dismissAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      unseenCount: 0,
      checking: false,
      lastCheckedAt: null,
      checkStatus: null,
      recheck: () => {},
      dismissNotification: () => {},
      dismissAll: () => {},
    };
  }
  return context;
};

