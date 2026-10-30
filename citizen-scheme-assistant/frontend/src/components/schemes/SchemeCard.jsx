import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { Building2, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

export const SchemeCard = ({ scheme, className = '' }) => {
  const { t, getLocalized } = useLanguage();

  const schemeName = getLocalized(scheme.name);
  const schemeDesc = getLocalized(scheme.description);
  const benefitsText = getLocalized(scheme.benefits);
  const isCentral = scheme.level === 'central';

  return (
    <div
      className={`group relative glass-panel glass-panel-hover rounded-[28px] p-6 sm:p-7 shadow-glass flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Badges: Level & Category */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            {isCentral ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50/80 text-blue-700 border border-blue-200/60 shadow-2xs">
                <Building2 className="w-3 h-3" />
                <span>{t('centralGov', 'Central Government')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50/80 text-emerald-800 border border-emerald-200/60 shadow-2xs">
                <MapPin className="w-3 h-3" />
                <span>
                  {scheme.state_code === 'MP' ? 'Madhya Pradesh' : t('stateGov', 'State Government')}
                </span>
              </span>
            )}

            <span className="text-[11px] font-medium text-slate-600 glass-card-subtle px-3 py-1 rounded-full capitalize">
              {scheme.category.replace('-', ' ')}
            </span>
          </div>

          {/* Verification Source Indicator */}
          <span className="text-[10px] text-slate-400 font-mono tracking-tight bg-white/40 px-2 py-0.5 rounded-full border border-white/60">
            .gov.in verified
          </span>
        </div>

        {/* Scheme Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2.5 leading-snug group-hover:text-orange-600 transition-colors">
          <Link to={`/schemes/${scheme.code || scheme.id}`}>{schemeName}</Link>
        </h3>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed font-normal">
          {schemeDesc}
        </p>

        {/* Benefit Highlight snippet */}
        {benefitsText && (
          <div className="glass-card-subtle p-3 rounded-2xl border border-white/80 mb-5 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 font-medium line-clamp-2">{benefitsText}</p>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-4 border-t border-white/60 flex items-center justify-between gap-3">
        <Link
          to={`/schemes/${scheme.code || scheme.id}`}
          className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1.5 transition"
        >
          <span>{t('viewDetails', 'View Details')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          to="/screening"
          className="px-4 py-2 rounded-full text-xs font-semibold text-orange-950 bg-orange-100/80 hover:bg-orange-200/80 border border-orange-200/90 transition shadow-2xs"
        >
          {t('checkEligibility', 'Check Eligibility')}
        </Link>
      </div>
    </div>
  );
};
