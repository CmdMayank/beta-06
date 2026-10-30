import React from 'react';
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const StatusBadge = ({ status, className = '' }) => {
  const { t } = useLanguage();

  const normalized = (status || '').toUpperCase();

  if (normalized === 'POTENTIALLY_ELIGIBLE' || normalized === 'ELIGIBLE') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-900 border border-emerald-300/70 shadow-2xs ${className}`}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
        <span>{t('statusPotentiallyEligible', 'Potentially Eligible')}</span>
      </span>
    );
  }

  if (
    normalized === 'NOT_ELIGIBLE_UNDER_SCREENED_RULES' ||
    normalized === 'INELIGIBLE' ||
    normalized === 'NOT_ELIGIBLE'
  ) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-100/80 text-rose-900 border border-rose-300/70 shadow-2xs ${className}`}
      >
        <XCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
        <span>{t('statusIneligible', 'Not Eligible Under Screened Rules')}</span>
      </span>
    );
  }

  // NEEDS_VERIFICATION / UNCERTAIN
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100/80 text-amber-950 border border-amber-300/70 shadow-2xs ${className}`}
    >
      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
      <span>{t('statusNeedsVerification', 'Needs Verification')}</span>
    </span>
  );
};
