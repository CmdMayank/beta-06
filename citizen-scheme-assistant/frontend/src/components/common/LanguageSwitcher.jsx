import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Languages } from 'lucide-react';

export const LanguageSwitcher = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={`inline-flex items-center glass-card-subtle p-0.5 rounded-full border border-white/80 text-xs font-semibold ${className}`}
    >
      <div className="pl-2.5 pr-1 text-slate-500">
        <Languages className="w-3.5 h-3.5" aria-hidden="true" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-full transition-all text-[11px] ${
          language === 'en'
            ? 'bg-orange-500 text-white shadow-xs font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        aria-pressed={language === 'en'}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-3 py-1 rounded-full transition-all text-[11px] ${
          language === 'hi'
            ? 'bg-orange-500 text-white shadow-xs font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        aria-pressed={language === 'hi'}
      >
        हिंदी
      </button>
    </div>
  );
};
