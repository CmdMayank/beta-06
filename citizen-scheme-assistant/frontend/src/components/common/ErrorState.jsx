import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const ErrorState = ({
  title,
  message,
  onRetry,
  className = '',
}) => {
  const { t } = useLanguage();

  return (
    <div
      className={`p-6 bg-rose-50 border border-rose-200 rounded-xl text-center max-w-md mx-auto ${className}`}
      role="alert"
    >
      <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-600">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-rose-900 mb-1">
        {title || t('errorTitle', 'Something went wrong')}
      </h3>
      <p className="text-sm text-rose-700 mb-4">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-800 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 shadow-sm transition"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('retry', 'Try Again')}</span>
        </button>
      )}
    </div>
  );
};

