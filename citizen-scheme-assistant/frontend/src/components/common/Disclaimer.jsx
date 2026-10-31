import React from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const Disclaimer = ({ className = '', customText }) => {
  const { t } = useLanguage();

  return (
    <div
      className={`glass-panel rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-950 border border-amber-200/60 shadow-glass ${className}`}
      role="note"
      aria-label="Government platform disclaimer"
    >
      <div className="w-8 h-8 rounded-xl bg-amber-100/90 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
        <Info className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="text-xs leading-relaxed">
        <strong className="font-bold block mb-0.5 text-slate-900">
          {t('footerDisclaimerTitle', 'Important Notice / Disclaimer')}
        </strong>
        <span className="text-slate-600 font-normal">
          {customText ||
            t(
              'resultsDisclaimer',
              'This is a preliminary screening, not an official government decision. Final eligibility and approval are determined by the relevant government authority upon document verification and formal application.'
            )}
        </span>
      </div>
    </div>
  );
};
