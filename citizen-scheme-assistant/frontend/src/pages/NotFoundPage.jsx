import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { Home, Compass, AlertCircle } from 'lucide-react';

export const NotFoundPage = () => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full glass-panel rounded-[36px] shadow-glass-lg p-8 sm:p-10 text-center border border-white/80">
        <div className="w-16 h-16 rounded-3xl bg-orange-100/90 text-orange-600 flex items-center justify-center mx-auto mb-6 shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
        <h2 className="text-base font-bold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-xs text-slate-500 mb-8 leading-relaxed font-normal">
          The government scheme or portal page you are looking for does not exist or has been relocated.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>{t('navHome', 'Return to Home')}</span>
          </Link>

          <Link
            to="/schemes"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-bold text-slate-700 glass-card-subtle hover:bg-white transition"
          >
            <Compass className="w-4 h-4" />
            <span>{t('navSchemes', 'Explore Schemes')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
