import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, CheckCircle2, MapPin, Landmark } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { INDIAN_STATES } from '../../constants/schemeConstants';

const CATEGORY_NAMES = {
  'women-child': 'Women Child',
  'agriculture': 'Agriculture & Farmers',
  'education': 'Education',
  'health': 'Healthcare',
  'housing': 'Housing',
  'employment': 'Employment',
  'business': 'Business',
  'social-welfare': 'Social Welfare',
};

export const SchemeCard = ({ scheme, className = '' }) => {
  const { t, getLocalized } = useLanguage();
  const id = scheme.code || scheme.id;
  const canScreen = scheme.screening_available === true || !scheme.is_demo;

  // Resolve state name for state schemes
  let stateDisplay = t('stateGov', 'State Government');
  if (scheme.state_name) {
    stateDisplay = getLocalized(scheme.state_name);
  } else if (scheme.state_code) {
    const foundState = INDIAN_STATES.find((s) => s.code === scheme.state_code);
    if (foundState) stateDisplay = getLocalized(foundState.name);
  } else if (scheme.applicable_states && scheme.applicable_states.length > 0 && scheme.applicable_states[0] !== 'ALL') {
    const foundState = INDIAN_STATES.find((s) => s.code === scheme.applicable_states[0]);
    if (foundState) stateDisplay = getLocalized(foundState.name);
  }

  // Format category badge text
  const categoryRaw = scheme.category;
  const categoryDisplay = categoryRaw
    ? (CATEGORY_NAMES[categoryRaw] || categoryRaw)
    : null;

  // Resolve benefit highlight text
  const benefitText =
    scheme.benefit_highlight ||
    getLocalized(scheme.benefits) ||
    getLocalized(scheme.benefit);

  return (
    <article
      className={
        'flex h-full flex-col rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:shadow-md ' +
        className
      }
    >
      {/* Top Header / Badges Row */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {scheme.level === 'state' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              <span>{stateDisplay}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              <Landmark className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
              <span>{t('centralGov', 'Central Government')}</span>
            </span>
          )}

          {categoryDisplay && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {categoryDisplay}
            </span>
          )}

          {!canScreen && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              {t('schemeGuide', 'Scheme guide')}
            </span>
          )}
        </div>

        <span className="text-[11px] font-medium tracking-tight text-slate-400">
          .gov.in verified
        </span>
      </div>

      {/* Scheme Title */}
      <h3
        lang={scheme.language || undefined}
        className="mt-1 text-base sm:text-lg font-bold leading-snug text-slate-900"
      >
        <Link to={'/schemes/' + id} className="hover:text-orange-600 transition">
          {getLocalized(scheme.name) || id}
        </Link>
      </h3>

      {/* Scheme Description */}
      <p
        lang={scheme.language || undefined}
        className="mt-2.5 line-clamp-3 text-xs sm:text-sm leading-relaxed text-slate-600"
      >
        {getLocalized(scheme.description) || t('unavailable')}
      </p>

      {/* Benefit Highlight Box */}
      {benefitText && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-emerald-100/90 bg-emerald-50/50 p-3">
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
            aria-hidden="true"
          />
          <p
            lang={scheme.language || undefined}
            className="line-clamp-2 text-xs font-medium leading-relaxed text-emerald-800"
          >
            {benefitText}
          </p>
        </div>
      )}

      {/* Audience */}
      {scheme.audience && (
        <p
          lang={scheme.language}
          className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-500"
        >
          <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{scheme.audience}</span>
        </p>
      )}

      {/* Translation Fallback Notice */}
      {scheme.translation_fallback && (
        <p className="mt-2 text-xs text-slate-500">{t('sourceLanguage')}</p>
      )}

      {/* Action Row */}
      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <Link
            to={'/schemes/' + id}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline transition"
          >
            <span>{t('viewDetails', 'View Details')}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          {canScreen && (
            <Link
              to={'/screening?scheme_id=' + encodeURIComponent(scheme.id || id)}
              className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-black transition"
            >
              {t('checkEligibility', 'Check Eligibility')}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
