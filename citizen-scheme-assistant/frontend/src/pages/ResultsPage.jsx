import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { sessionApi } from '../services/sessionApi';
import { ResultCard } from '../components/results/ResultCard';
import { DocumentChecklist } from '../components/results/DocumentChecklist';
import { Disclaimer } from '../components/common/Disclaimer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import {
  CheckCircle2,
  HelpCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Compass,
  FileQuestion,
} from 'lucide-react';

export const ResultsPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchResults = useCallback(() => {
    setLoading(true);
    setError(null);
    const sid = sessionApi.getSessionId() || 'demo_session';

    sessionApi
      .getResults(sid)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve screening results.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) {
    return (
      <div className="flex-1 py-20">
        <LoadingState message="Loading your eligibility breakdown..." />
      </div>
    );
  }

  // 1.5 Show ErrorState with Retry button when real API fails
  if (error) {
    return (
      <div className="flex-1 py-16 px-4">
        <ErrorState
          title={t('errorTitle', 'Something went wrong')}
          message={error}
          onRetry={fetchResults}
        />
      </div>
    );
  }

  const results = data?.results || [];

  const eligibleCount = results.filter((r) => {
    const s = (r.status || '').toUpperCase();
    return s === 'POTENTIALLY_ELIGIBLE' || s === 'ELIGIBLE';
  }).length;

  const uncertainCount = results.filter((r) => {
    const s = (r.status || '').toUpperCase();
    return s === 'NEEDS_VERIFICATION' || s === 'UNCERTAIN' || s === 'MAYBE';
  }).length;

  const ineligibleCount = results.filter((r) => {
    const s = (r.status || '').toUpperCase();
    return (
      s === 'NOT_ELIGIBLE_UNDER_SCREENED_RULES' ||
      s === 'INELIGIBLE' ||
      s === 'NOT_ELIGIBLE'
    );
  }).length;

  const noCurrentRulesCount = results.filter((r) => {
    const s = (r.status || '').toUpperCase();
    return s === 'NO_CURRENT_RULES';
  }).length;

  const filteredResults = results.filter((item) => {
    const s = (item.status || '').toUpperCase();
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ELIGIBLE') return s === 'POTENTIALLY_ELIGIBLE' || s === 'ELIGIBLE';
    if (activeTab === 'NEEDS_VERIFICATION') return s === 'NEEDS_VERIFICATION' || s === 'UNCERTAIN' || s === 'MAYBE';
    if (activeTab === 'INELIGIBLE') {
      return (
        s === 'NOT_ELIGIBLE_UNDER_SCREENED_RULES' ||
        s === 'INELIGIBLE' ||
        s === 'NOT_ELIGIBLE'
      );
    }
    if (activeTab === 'NO_CURRENT_RULES') return s === 'NO_CURRENT_RULES';
    return true;
  });

  const tabs = [
    { id: 'ALL', labelKey: 'statusAll', defaultLabel: 'All Results' },
    { id: 'ELIGIBLE', labelKey: 'statusPotentiallyEligible', defaultLabel: 'You may qualify' },
    { id: 'NEEDS_VERIFICATION', labelKey: 'statusNeedsVerification', defaultLabel: 'Needs Verification' },
    { id: 'INELIGIBLE', labelKey: 'statusIneligible', defaultLabel: 'Not Eligible' },
  ];
  if (noCurrentRulesCount > 0) {
    tabs.push({ id: 'NO_CURRENT_RULES', labelKey: 'statusNoCurrentRules', defaultLabel: 'No Current Rules' });
  }

  return (
    <div className="flex-1 py-10 sm:py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-card-subtle text-orange-800 text-[11px] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Preliminary Screening Summary</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1.5">
              {t('resultsTitle', 'Screening Evaluation Results')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {t(
                'resultsSubtitle',
                'Based on your preliminary responses, here is the eligibility breakdown for screened government schemes.'
              )}
            </p>
          </div>

          <div className="no-print flex items-center gap-3">
            <Link
              to="/screening"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-slate-700 glass-card-subtle hover:bg-white transition shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('retakeScreening', 'Retake Screening')}</span>
            </Link>

            <Link
              to="/schemes"
              className="glass-dark-pill inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide hover:bg-black transition shadow-sm"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t('navSchemes', 'Explore All Schemes')}</span>
            </Link>
          </div>
        </div>

        {/* Prominent Official Disclaimer Box */}
        <div className="mb-8">
          <Disclaimer />
        </div>

        {/* Outcome Summary Glass Cards */}
        <div className={`grid grid-cols-1 ${noCurrentRulesCount > 0 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'} gap-4 sm:gap-6 mb-8`}>
          {/* Eligible card (1.9 'You may qualify') */}
          <div
            onClick={() => setActiveTab('ELIGIBLE')}
            className={`p-6 rounded-[28px] transition-all cursor-pointer border ${
              activeTab === 'ELIGIBLE'
                ? 'bg-emerald-500/15 border-emerald-400 shadow-glass ring-2 ring-emerald-300/60'
                : 'glass-panel hover:bg-white/90 border-white/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                {t('eligibleCount', 'You may qualify')}
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-950">{eligibleCount}</div>
            <p className="text-xs text-emerald-800 mt-1 font-medium">Schemes matching primary rules</p>
          </div>

          {/* Needs Verification card */}
          <div
            onClick={() => setActiveTab('NEEDS_VERIFICATION')}
            className={`p-6 rounded-[28px] transition-all cursor-pointer border ${
              activeTab === 'NEEDS_VERIFICATION'
                ? 'bg-amber-500/15 border-amber-400 shadow-glass ring-2 ring-amber-300/60'
                : 'glass-panel hover:bg-white/90 border-white/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider">
                {t('uncertainCount', 'Needs Verification')}
              </span>
              <HelpCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-amber-950">{uncertainCount}</div>
            <p className="text-xs text-amber-900 mt-1 font-medium">Requires local document check</p>
          </div>

          {/* Ineligible card */}
          <div
            onClick={() => setActiveTab('INELIGIBLE')}
            className={`p-6 rounded-[28px] transition-all cursor-pointer border ${
              activeTab === 'INELIGIBLE'
                ? 'bg-rose-500/15 border-rose-400 shadow-glass ring-2 ring-rose-300/60'
                : 'glass-panel hover:bg-white/90 border-white/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-rose-950 uppercase tracking-wider">
                {t('ineligibleCount', 'Not Eligible')}
              </span>
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-3xl font-black text-rose-950">{ineligibleCount}</div>
            <p className="text-xs text-rose-900 mt-1 font-medium">Excluded under screened rules</p>
          </div>

          {/* No Current Rules card (if any present) */}
          {noCurrentRulesCount > 0 && (
            <div
              onClick={() => setActiveTab('NO_CURRENT_RULES')}
              className={`p-6 rounded-[28px] transition-all cursor-pointer border ${
                activeTab === 'NO_CURRENT_RULES'
                  ? 'bg-slate-500/15 border-slate-400 shadow-glass ring-2 ring-slate-300/60'
                  : 'glass-panel hover:bg-white/90 border-white/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  {t('noCurrentRulesCount', 'No Current Rules')}
                </span>
                <FileQuestion className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-3xl font-black text-slate-950">{noCurrentRulesCount}</div>
              <p className="text-xs text-slate-700 mt-1 font-medium">Rules pending from official source</p>
            </div>
          )}
        </div>

        {/* Tab Filters */}
        <div className="no-print flex items-center gap-2 border-b border-white/60 mb-6 pb-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition shrink-0 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
              }`}
            >
              {t(tab.labelKey, tab.defaultLabel)}
            </button>
          ))}
        </div>

        {/* Results List */}
        {filteredResults.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-[28px] glass-panel border border-white/80 max-w-lg mx-auto my-8 shadow-glass">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">
              {activeTab === 'ALL'
                ? t('noEligibleSchemesFound', 'No schemes found matching all your criteria')
                : t('noSchemesMatchFilter', 'No schemes match the selected filter')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
              {t(
                'tryAdjustingAnswers',
                'You can retake the eligibility check with updated answers or explore all government schemes directly.'
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {activeTab !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('ALL')}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-white text-slate-800 border border-slate-200/80 hover:bg-slate-50 transition shadow-2xs focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  {t('resetFilters', 'Show All Results')}
                </button>
              )}
              <Link
                to="/screening"
                className="px-4 py-2 rounded-full text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition shadow-xs focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                {t('retakeScreening', 'Retake Screening')}
              </Link>
              <Link
                to="/schemes"
                className="px-4 py-2 rounded-full text-xs font-bold glass-dark-pill hover:bg-black transition shadow-xs focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                {t('navSchemes', 'Explore All Schemes')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredResults.map((result) => (
              <ResultCard key={result.scheme_id} result={result} />
            ))}
          </div>
        )}

        {/* Consolidated Actionable Document Checklist */}
        <DocumentChecklist results={results} />

      </div>
    </div>
  );
};
