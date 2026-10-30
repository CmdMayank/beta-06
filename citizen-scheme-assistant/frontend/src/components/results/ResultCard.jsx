import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  ExternalLink,
  Calendar,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';

export const ResultCard = ({ result, className = '' }) => {
  const { t, getLocalized } = useLanguage();
  const [showDocuments, setShowDocuments] = useState(true);

  const schemeName = getLocalized(result.scheme_name);
  const explanation = getLocalized(result.explanation);
  const missingInfo = result.missing_information ? getLocalized(result.missing_information) : null;
  const officialSource = result.official_source || {};
  const documents = result.required_documents || [];

  return (
    <div
      className={`glass-panel rounded-[28px] p-6 sm:p-8 shadow-glass flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top Status & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <StatusBadge status={result.status} />

          <div className="flex items-center gap-3 text-xs text-slate-500">
            {officialSource.last_checked_date && (
              <span className="inline-flex items-center gap-1.5 glass-card-subtle px-3 py-1 rounded-full text-[11px] font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {t('lastCheckedOn', 'Rule verified on:')} {officialSource.last_checked_date}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Scheme Name */}
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-3">
          <Link
            to={`/schemes/${result.scheme_id}`}
            className="hover:text-orange-600 transition-colors"
          >
            {schemeName}
          </Link>
        </h3>

        {/* Plain Language Explanation (Decisive Rule) */}
        <div className="glass-card-subtle rounded-2xl p-4 sm:p-5 border border-white/90 mb-4">
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            {t('decisiveRuleHeading', 'Why this outcome:')}
          </h4>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            {explanation}
          </p>
        </div>

        {/* Missing Information / Verification Required notice */}
        {missingInfo && (
          <div className="bg-amber-500/10 rounded-2xl p-4 sm:p-5 border border-amber-300/60 mb-4 flex items-start gap-3 text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider mb-1 text-amber-900">
                {t('uncertaintyHeading', 'Information needed for confirmation:')}
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">{missingInfo}</p>
            </div>
          </div>
        )}

        {/* Document Checklist Accordion */}
        {documents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/60">
            <button
              type="button"
              onClick={() => setShowDocuments(!showDocuments)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-black"
            >
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-orange-500" />
                <span>
                  {t('documentsRequiredHeading', 'Required Documents')} ({documents.length})
                </span>
              </div>
              {showDocuments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDocuments && (
              <ul className="mt-3 space-y-2.5">
                {documents.map((doc) => (
                  <li
                    key={doc.id || doc.title.en}
                    className="p-3 sm:p-3.5 glass-card-subtle rounded-xl border border-white/80 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{getLocalized(doc.title)}</span>
                      {doc.issuing_authority && (
                        <span className="text-[10px] font-medium text-slate-600 bg-white/80 px-2 py-0.5 rounded-full border border-white">
                          {getLocalized(doc.issuing_authority)}
                        </span>
                      )}
                    </div>
                    {doc.guidance && (
                      <p className="text-[11px] text-slate-500 italic font-normal">
                        {getLocalized(doc.guidance)}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="mt-6 pt-4 border-t border-white/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {officialSource.url && (
            <a
              href={officialSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-black transition"
            >
              <span>{t('officialLink', 'Official Portal')}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          )}
        </div>

        <Link
          to={`/schemes/${result.scheme_id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-950 bg-orange-100/80 hover:bg-orange-200/80 px-4 py-2 rounded-full border border-orange-200/90 transition shadow-2xs"
        >
          <span>{t('viewDetails', 'View Details')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
