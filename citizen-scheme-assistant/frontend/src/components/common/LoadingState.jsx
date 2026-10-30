import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const LoadingState = ({ message, className = '' }) => {
  const { t } = useLanguage();
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
      role="status"
    >
      <Loader2 className="w-10 h-10 text-saffron-600 animate-spin mb-4" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-600">
        {message || t('loading', 'Loading information...')}
      </p>
    </div>
  );
};

