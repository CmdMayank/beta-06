import React from 'react';
import { DOCUMENT_MATCHING } from '../../config/documentMatching';
import { useLanguage } from '../../i18n/LanguageContext';
import { MapPin, ExternalLink } from 'lucide-react';

const GENERIC_AUTHORITIES = new Set([
  'self',
  'competent authority',
  'government authority',
  'concerned authority',
  'authorized authority',
  'competent official',
  'applicant',
  'not specified',
  'na',
  'n/a',
  'none',
  'स्वयं',
  'सक्षम अधिकारी',
  'सक्षम प्राधिकारी',
  'सरकारी प्राधिकारी',
  'सक्षम सरकारी प्राधिकारी',
  'संबंधित प्राधिकारी',
  'संबंधित अधिकारी',
  'आवेदक',
  'लागू नहीं',
  'उपलब्ध नहीं',
]);

const isGenericAuthority = (auth) => {
  if (!auth) return true;
  const checkText = (text) => {
    if (!text || typeof text !== 'string') return true;
    const clean = text.toLowerCase().trim().replace(/[.:;,]+$/, '');
    if (!clean || clean.length < 2) return true;
    if (GENERIC_AUTHORITIES.has(clean)) return true;
    if (clean.startsWith('self') || clean.startsWith('स्वयं')) return true;
    if (clean.startsWith('competent authority') || clean.startsWith('government authority')) return true;
    return false;
  };

  if (typeof auth === 'string') {
    return checkText(auth);
  }
  if (typeof auth === 'object') {
    if (auth.en && checkText(auth.en)) return true;
    if (auth.hi && checkText(auth.hi)) return true;
    if (!auth.en && !auth.hi) return true;
  }
  return false;
};

export const DocumentOwnershipChecklist = ({ requiredDocuments = [], documents = [] }) => {
  const { t, getLocalized } = useLanguage();

  const docsList = Array.isArray(requiredDocuments)
    ? requiredDocuments
    : requiredDocuments?.items || [];

  if (!docsList.length) return null;

  let hasAnyMapLink = false;

  const renderedDocs = docsList.map((document, idx) => {
    const id = document.id || document.code || document.item_id || String(idx);
    const owned = documents.some(
      (item) => DOCUMENT_MATCHING[id] === item.doc_type || id === item.doc_type
    );
    const title = getLocalized(document.title) || document.name || document.label || id;
    const issuingAuthority = getLocalized(document.issuing_authority);
    const guidance = getLocalized(document.guidance);

    const showMapLink = !owned && Boolean(issuingAuthority) && !isGenericAuthority(document.issuing_authority);
    if (showMapLink) {
      hasAnyMapLink = true;
    }

    const mapSearchUrl = showMapLink
      ? `https://www.google.com/maps/search/${encodeURIComponent(issuingAuthority)}+office+near+me`
      : null;

    return {
      id,
      owned,
      title,
      issuingAuthority,
      guidance,
      showMapLink,
      mapSearchUrl,
    };
  });

  return (
    <section className="glass-card-subtle rounded-2xl p-5">
      <h2 className="font-bold text-slate-900 mb-3">
        {t('documentsRequiredHeading', 'Documents you may need')}
      </h2>

      <div className="space-y-3">
        {renderedDocs.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-white/70 border border-slate-200/60 transition-all text-sm space-y-1.5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    item.owned ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  aria-hidden="true"
                />
                <span className="font-medium text-slate-900 truncate">{item.title}</span>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${
                  item.owned
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-amber-800 bg-amber-50 border-amber-200'
                }`}
              >
                {item.owned
                  ? t('documentAlreadyHave', 'Already added')
                  : t('documentStillNeeded', 'Still needed')}
              </span>
            </div>

            {!item.owned && (
              <>
                {item.issuingAuthority && (
                  <p className="text-xs text-slate-600 pl-5">
                    <span className="font-semibold text-slate-700">
                      {t('issuingAuthorityLabel', 'Issuing authority')}:
                    </span>{' '}
                    {item.issuingAuthority}
                  </p>
                )}

                {item.guidance && (
                  <p className="text-xs text-slate-500 pl-5 italic">
                    <span className="font-medium not-italic text-slate-600">
                      {t('documentGuidanceLabel', 'Guidance')}:
                    </span>{' '}
                    {item.guidance}
                  </p>
                )}

                {item.showMapLink && item.mapSearchUrl && (
                  <div className="pl-5 pt-1">
                    <a
                      href={item.mapSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-orange-600" aria-hidden="true" />
                      <span>
                        {t('findAuthorityNearMe', 'Find {authority} near me').replace(
                          '{authority}',
                          item.issuingAuthority
                        )}
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-70" aria-hidden="true" />
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {hasAnyMapLink && (
        <p className="text-[11px] text-slate-500 italic mt-3 pt-3 border-t border-slate-200/50">
          {t(
            'mapSearchDisclaimer',
            'We link to a map search for this office type. We do not confirm exact addresses or hours — please call ahead.'
          )}
        </p>
      )}
    </section>
  );
};
