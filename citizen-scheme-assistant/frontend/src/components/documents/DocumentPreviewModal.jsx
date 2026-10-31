import React, { useState, useEffect } from 'react';
import { X, Eye, AlertTriangle, CheckCircle2, MapPin, Building2, HelpCircle, FileText } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * Reusable DocumentPreviewModal
 * Displays a fictional document specimen with prominent watermarks and comprehensive citizen guidance.
 */
export default function DocumentPreviewModal({ sample, isOpen, onClose }) {
  const { currentLanguage, t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  // Reset image error state when sample changes
  useEffect(() => {
    setImgError(false);
  }, [sample]);

  // Helper for localized strings
  const getLocalized = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[currentLanguage] || field.en || Object.values(field)[0] || '';
  };

  // Close on Escape key and prevent background scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !sample) return null;

  const docName = getLocalized(sample.name);
  const docCategory = getLocalized(sample.category);
  const docPurpose = getLocalized(sample.purpose);
  const issuingAuth = getLocalized(sample.issuingAuthority);
  const whereToObtain = getLocalized(sample.whereToObtain);
  const formatDisclaimer = getLocalized(sample.formatDisclaimer);
  const checks = sample.importantChecks || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/50 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-doc-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white/95 backdrop-blur-2xl rounded-[28px] sm:rounded-[32px] border border-white shadow-2xl overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-orange-100/60 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100/80 border border-orange-200/80 flex items-center justify-center text-orange-600 shadow-sm shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100/70 px-2.5 py-0.5 rounded-full border border-orange-200/50">
                  {t('sampleDocModalTitle', 'Specimen Document Preview')}
                </span>
                {docCategory && (
                  <span className="text-[10px] sm:text-xs font-medium text-slate-500 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200/60 hidden sm:inline-block">
                    {docCategory}
                  </span>
                )}
              </div>
              <h3 id="modal-doc-title" className="text-lg sm:text-xl font-black text-slate-900 leading-snug mt-0.5">
                {docName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('closeModal', 'Close')}
            className="p-2 sm:p-2.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto px-5 sm:px-7 py-5 space-y-6">
          {/* Safety Watermark Notice Callout */}
          <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-950">
                {t('sampleWatermarkBadge', 'SAMPLE – NOT VALID / केवल नमूना - अमान्य')}
              </p>
              <p className="text-amber-800/90 leading-relaxed text-xs">
                {t(
                  'specimenWatermarkNotice',
                  'Fictional specimen for informational reference only. Actual layout, seals, and colors may vary by state and district.'
                )}
              </p>
            </div>
          </div>

          {/* Main Grid: Specimen Image on Left/Top, Details on Right/Bottom */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Specimen Preview Card */}
            <div className="lg:col-span-6 space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-50 group min-h-[220px] flex items-center justify-center">
                {imgError ? (
                  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-slate-100 text-slate-500">
                    <FileText className="w-12 h-12 text-slate-400 mb-3" />
                    <p className="text-sm font-bold text-slate-700">{docName}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {t('specimenWatermarkNotice', 'Fictional specimen for informational reference.')}
                    </p>
                  </div>
                ) : (
                  <img
                    src={sample.sampleImage}
                    alt={`${docName} Specimen`}
                    onError={() => setImgError(true)}
                    className="w-full h-auto object-contain block select-none pointer-events-none"
                    loading="lazy"
                  />
                )}
                
                {/* Floating Watermark Banner */}
                <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                  {t('sampleWatermarkBadge', 'SAMPLE – NOT VALID')}
                </div>
              </div>

              <p className="text-[11px] text-center text-slate-500 italic">
                {t(
                  'formatVariationHeading',
                  'Specimen illustration: Do not submit as actual document.'
                )}
              </p>
            </div>

            {/* Right: Key Guidance & Checkpoints */}
            <div className="lg:col-span-6 space-y-4">
              {/* Document Purpose */}
              {docPurpose && (
                <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-100/70">
                  <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>{t('docPurposeHeading', 'Purpose & Role in Welfare Schemes')}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {docPurpose}
                  </p>
                </div>
              )}

              {/* Where to Obtain & Authority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whereToObtain && (
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-sm">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs mb-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      <span>{t('whereToObtainHeading', 'Where to Obtain')}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {whereToObtain}
                    </p>
                  </div>
                )}

                {issuingAuth && (
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-sm">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs mb-1">
                      <Building2 className="w-3.5 h-3.5 text-orange-500" />
                      <span>{t('issuingAuthority', 'Issuing Authority')}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {issuingAuth}
                    </p>
                  </div>
                )}
              </div>

              {/* Important Checks List */}
              {checks.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('importantChecksHeading', 'Important Details to Check Before Applying')}</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {checks.map((check, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-900">
                            {getLocalized(check.title)}:
                          </span>{' '}
                          <span className="text-slate-600 leading-relaxed">
                            {getLocalized(check.desc)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* State Variation Disclaimer */}
              {formatDisclaimer && (
                <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200/60 text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">
                    {t('formatVariationHeading', 'State Format Variations')}:
                  </span>{' '}
                  {formatDisclaimer}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-5 sm:px-7 py-3.5 border-t border-slate-200/60 bg-slate-50/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {t('closeModal', 'Close Preview')}
          </button>
        </div>
      </div>
    </div>
  );
}

