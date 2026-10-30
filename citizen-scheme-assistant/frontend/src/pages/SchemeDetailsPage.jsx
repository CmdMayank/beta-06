import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { schemeApi } from '../services/schemeApi';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Disclaimer } from '../components/common/Disclaimer';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle,
  FileText,
  ListOrdered,
  ArrowRight,
  ShieldCheck,
  Share2,
} from 'lucide-react';

export const SchemeDetailsPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { t, getLocalized } = useLanguage();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    schemeApi
      .getSchemeByCode(code)
      .then((data) => {
        if (active) {
          setScheme(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Scheme not found');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [code]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 py-20">
        <LoadingState />
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="flex-1 py-16 px-4">
        <ErrorState
          title="Scheme Not Found"
          message={error || `Could not find scheme with identifier "${code}".`}
          onRetry={() => navigate('/schemes')}
        />
      </div>
    );
  }

  const schemeName = getLocalized(scheme.name);
  const schemeDesc = getLocalized(scheme.description);
  const benefits = getLocalized(scheme.benefits);
  const officialSource = scheme.official_source || {};
  const isCentral = scheme.level === 'central';
  const criteria = scheme.criteria || [];
  const documents = scheme.required_documents || [];
  const applicationSteps = scheme.application_steps || [];

  return (
    <div className="flex-1 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link & Action Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            to="/schemes"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass-card-subtle text-xs font-semibold text-slate-700 hover:text-black hover:bg-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToSchemes', 'Back to Schemes')}</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-black glass-card-subtle px-4 py-2 rounded-full transition shadow-2xs hover:bg-white"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? t('linkCopied', 'Copied!') : t('copyLink', 'Share')}</span>
          </button>
        </div>

        {/* Main Scheme Hero Card */}
        <div className="glass-panel rounded-[36px] shadow-glass-lg p-6 sm:p-10 mb-8 border border-white/80">
          
          {/* Level and Category Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {isCentral ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-100/80 text-blue-900 border border-blue-200/60 shadow-2xs">
                <Building2 className="w-3.5 h-3.5" />
                <span>{t('centralGov', 'Central Government')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-900 border border-emerald-200/60 shadow-2xs">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {scheme.state_code === 'MP' ? 'Madhya Pradesh' : t('stateGov', 'State Government')}
                </span>
              </span>
            )}

            <span className="px-3.5 py-1 rounded-full text-xs font-bold glass-card-subtle text-slate-700 capitalize">
              {scheme.category.replace('-', ' ')}
            </span>

            {officialSource.last_checked_date && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium text-slate-500 glass-card-subtle ml-auto">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {t('lastCheckedOn', 'Rule verified on:')} {officialSource.last_checked_date}
                </span>
              </span>
            )}
          </div>

          {/* Scheme Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 leading-tight">
            {schemeName}
          </h1>

          {/* Ministry / Department */}
          {officialSource.issuing_ministry && (
            <p className="text-xs font-medium text-slate-500 mb-6">
              <span className="text-slate-400">Department:</span>{' '}
              {getLocalized(officialSource.issuing_ministry)}
            </p>
          )}

          {/* Scheme Description */}
          <div className="mb-8 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            <p>{schemeDesc}</p>
          </div>

          {/* Quick CTA to screening */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-white/60">
            <Link
              to="/screening"
              className="glass-dark-pill w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-full text-xs font-semibold tracking-wide hover:bg-black transition shadow-md active:scale-95"
            >
              <span>{t('startCheckForThisScheme', 'Check Your Eligibility for this Scheme')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </Link>

            {officialSource.url && (
              <a
                href={officialSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-xs font-bold text-slate-700 glass-card-subtle hover:bg-white transition"
              >
                <span>{t('officialLink', 'Official Government Portal')}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        {benefits && (
          <div className="glass-panel rounded-[32px] shadow-glass p-6 sm:p-8 mb-8 border border-white/80">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h2>{t('benefitsHeading', 'Key Benefits & Entitlements')}</h2>
            </div>
            <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-300/60 text-xs sm:text-sm text-emerald-950 leading-relaxed font-semibold">
              {benefits}
            </div>
          </div>
        )}

        {/* Eligibility Criteria Overview */}
        {criteria.length > 0 && (
          <div className="glass-panel rounded-[32px] shadow-glass p-6 sm:p-8 mb-8 border border-white/80">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg mb-4">
              <ShieldCheck className="w-5 h-5 text-orange-500" />
              <h2>{t('eligibilityHeading', 'Eligibility Criteria Overview')}</h2>
            </div>

            <div className="space-y-4">
              {criteria.map((crit, idx) => (
                <div
                  key={crit.id || idx}
                  className="p-4 sm:p-5 rounded-2xl border border-white/80 glass-card-subtle flex items-start gap-3.5"
                >
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${
                      crit.criticality === 'MANDATORY'
                        ? 'bg-blue-100/90 text-blue-900'
                        : 'bg-rose-100/90 text-rose-900'
                    }`}
                  >
                    {crit.criticality}
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {getLocalized(crit.explanation_if_met)}
                    </p>
                    {crit.explanation_if_violated && (
                      <p className="text-xs text-slate-500 mt-1 font-normal">
                        <span className="font-semibold text-rose-600">Note:</span>{' '}
                        {getLocalized(crit.explanation_if_violated)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required Documents */}
        {documents.length > 0 && (
          <div className="glass-panel rounded-[32px] shadow-glass p-6 sm:p-8 mb-8 border border-white/80">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg mb-4">
              <FileText className="w-5 h-5 text-orange-500" />
              <h2>{t('documentsHeading', 'Required Documents')}</h2>
            </div>

            <div className="space-y-3">
              {documents.map((doc, idx) => (
                <div
                  key={doc.id || idx}
                  className="p-4 rounded-2xl border border-white/80 glass-card-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{getLocalized(doc.title)}</h4>
                    {doc.guidance && (
                      <p className="text-xs text-slate-500 mt-0.5 font-normal">{getLocalized(doc.guidance)}</p>
                    )}
                  </div>

                  {doc.issuing_authority && (
                    <span className="text-[11px] font-medium text-slate-600 bg-white/80 px-3 py-1 rounded-full border border-white shrink-0 self-start sm:self-center">
                      {getLocalized(doc.issuing_authority)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Application Steps */}
        {applicationSteps.length > 0 && (
          <div className="glass-panel rounded-[32px] shadow-glass p-6 sm:p-8 mb-8 border border-white/80">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg mb-6">
              <ListOrdered className="w-5 h-5 text-orange-500" />
              <h2>{t('applicationHeading', 'How to Apply')}</h2>
            </div>

            <div className="space-y-6">
              {applicationSteps.map((step) => (
                <div key={step.step_number} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {step.step_number}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      {getLocalized(step.title)}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {getLocalized(step.description)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification & Official Source Info */}
        <div className="glass-card-subtle rounded-2xl p-6 border border-white/80 mb-8 text-xs text-slate-600 space-y-2">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            {t('officialSourceHeading', 'Official Source & Verification')}
          </h4>
          <p className="font-normal">
            {t(
              'verifyNotice',
              'Always verify criteria and latest amendments on the official portal before submitting applications.'
            )}
          </p>
          {officialSource.gazette_or_order_ref && (
            <p className="font-mono text-[10px] text-slate-500">
              Ref: {officialSource.gazette_or_order_ref}
            </p>
          )}
        </div>

        {/* Disclaimer */}
        <Disclaimer />

      </div>
    </div>
  );
};
