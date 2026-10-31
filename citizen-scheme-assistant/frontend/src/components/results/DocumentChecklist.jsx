import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { CheckSquare, Square, Printer, FileText, Eye } from 'lucide-react';
import { getDocumentSample } from '../../data/documentSamples';
import DocumentPreviewModal from '../documents/DocumentPreviewModal';

export const DocumentChecklist = ({ results = [] }) => {
  const { t, getLocalized } = useLanguage();
  const [checkedIds, setCheckedIds] = useState({});
  const [selectedSample, setSelectedSample] = useState(null);

  const eligibleSchemes = results.filter(
    (r) => r.status === 'POTENTIALLY_ELIGIBLE' || r.status === 'NEEDS_VERIFICATION'
  );

  const documentMap = new Map();
  eligibleSchemes.forEach((sch) => {
    (sch.required_documents || []).forEach((doc) => {
      const docKey = doc.id || doc.title.en;
      if (!documentMap.has(docKey)) {
        documentMap.set(docKey, {
          ...doc,
          schemes: [getLocalized(sch.scheme_name)],
        });
      } else {
        const existing = documentMap.get(docKey);
        existing.schemes.push(getLocalized(sch.scheme_name));
      }
    });
  });

  const uniqueDocs = Array.from(documentMap.values());

  const toggleCheck = (docId) => {
    setCheckedIds((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (uniqueDocs.length === 0) return null;

  return (
    <div className="glass-panel rounded-[32px] p-6 sm:p-8 mt-10 shadow-glass border border-white/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/60">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-1.5 glass-card-subtle px-3 py-0.5 rounded-full">
            <FileText className="w-3.5 h-3.5" />
            <span>Preparation Guide</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {t('printChecklist', 'Offline Document Checklist')}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Collect and check these documents before visiting your Gram Panchayat, CSC, or bank.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="no-print inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-slate-900 bg-white hover:bg-slate-50 border border-white/90 shadow-glass transition"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Print / Save Checklist</span>
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {uniqueDocs.map((doc, idx) => {
          const docId = doc.id || `doc-${idx}`;
          const isDone = !!checkedIds[docId];

          return (
            <div
              key={docId}
              onClick={() => toggleCheck(docId)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                isDone
                  ? 'bg-emerald-500/15 border-emerald-400 text-emerald-950 shadow-xs'
                  : 'glass-card-subtle text-slate-900 hover:bg-white/90 border-white/80'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-slate-400 shrink-0"
                aria-label="Toggle document status"
              >
                {isDone ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-sm font-bold ${isDone ? 'line-through text-slate-500' : ''}`}>
                    {getLocalized(doc.title)}
                  </span>
                  <div className="flex items-center gap-2">
                    {doc.issuing_authority && (
                      <span className="text-[10px] font-medium text-slate-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-white">
                        {getLocalized(doc.issuing_authority)}
                      </span>
                    )}
                    {(() => {
                      const sample = getDocumentSample(doc);
                      if (!sample) return null;
                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSample(sample);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/90 hover:bg-orange-50 text-orange-700 text-[10px] font-semibold border border-orange-200/80 shadow-xs transition-all active:scale-95"
                          title={`${t('viewSample', 'View Sample')} - ${getLocalized(doc.title)}`}
                        >
                          <Eye className="w-3 h-3 text-orange-600" />
                          <span>{t('viewSample', 'View Sample')}</span>
                        </button>
                      );
                    })()}
                  </div>
                </div>

                {doc.guidance && (
                  <p className="text-xs text-slate-600 mt-1">{getLocalized(doc.guidance)}</p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                  <span>Required for:</span>
                  {doc.schemes.map((sName) => (
                    <span
                      key={sName}
                      className="bg-white/90 px-2 py-0.5 rounded-full text-slate-700 border border-white/80 font-semibold"
                    >
                      {sName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Specimen Preview Modal */}
      <DocumentPreviewModal
        sample={selectedSample}
        isOpen={Boolean(selectedSample)}
        onClose={() => setSelectedSample(null)}
      />
    </div>
  );
};
