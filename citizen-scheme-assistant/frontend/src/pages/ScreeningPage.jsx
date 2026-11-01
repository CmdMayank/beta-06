import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { errorKey } from '../i18n/integration.js';
import { schemeApi } from '../services/schemeApi.js';
import { screeningFlow as flow } from '../services/screeningFlow.js';
import { speechValue } from '../services/adapters.js';
import { VoiceAssistant } from '../components/questionnaire/VoiceAssistant';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { LoadingState } from '../components/common/LoadingState';
import { useAuth } from '../auth/AuthContext';
import { profileToAnswers } from '../profile/profileToAnswers';
import { mockAdapter } from '../mock/mockAdapter';
import { ArrowLeft, ArrowRight, RotateCcw, Shuffle, Sparkles, CheckCircle2 } from 'lucide-react';

export const ScreeningPage = () => {
  const { t, language, getLocalized } = useLanguage();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { user, profileDetails } = useAuth();

  const SCHEME_ALIASES = useMemo(
    () => ({
      // 1. PMJJBY
      pmjjby: 'in-cen-000001',
      'in-cen-000001': 'in-cen-000001',
      'pradhan-mantri-jeevan-jyoti-bima-yojana': 'in-cen-000001',

      // 2. PMSBY
      pmsby: 'in-cen-000002',
      'in-cen-000002': 'in-cen-000002',
      'pradhan-mantri-suraksha-bima-yojana': 'in-cen-000002',

      // 3. PM-SYM
      'pm-sym': 'in-cen-000003',
      pmsym: 'in-cen-000003',
      'in-cen-000003': 'in-cen-000003',
      'pradhan-mantri-shram-yogi-maan-dhan': 'in-cen-000003',

      // 4. PMUY / Ujjwala
      'pm-ujjwala': 'in-cen-000004',
      pmuy: 'in-cen-000004',
      ujjwala: 'in-cen-000004',
      'in-cen-000004': 'in-cen-000004',

      // 5. IGNOAPS / Pension
      'ignaps-pension': 'in-cen-000005',
      ignoaps: 'in-cen-000005',
      pension: 'in-cen-000005',
      'in-cen-000005': 'in-cen-000005',

      // 6. PM-KISAN
      'pm-kisan': 'in-cen-000006',
      pmkisan: 'in-cen-000006',
      kisan: 'in-cen-000006',
      'in-cen-000006': 'in-cen-000006',

      // 7. APY
      apy: 'in-cen-000007',
      'atal-pension-yojana': 'in-cen-000007',
      'atal-pension': 'in-cen-000007',
      'in-cen-000007': 'in-cen-000007',

      // 8. SSY / Sukanya Samriddhi
      ssy: 'in-cen-000008',
      'sukanya-samriddhi': 'in-cen-000008',
      sukanya: 'in-cen-000008',
      'in-cen-000008': 'in-cen-000008',

      // 9. PMAY-G
      'pmay-g': 'in-cen-000009',
      pmayg: 'in-cen-000009',
      pmay: 'in-cen-000009',
      awas: 'in-cen-000009',
      'in-cen-000009': 'in-cen-000009',

      // 10. AB PM-JAY / Ayushman
      'pm-jay': 'in-cen-000010',
      pmjay: 'in-cen-000010',
      'pm-jay-ayushman': 'in-cen-000010',
      ayushman: 'in-cen-000010',
      'in-cen-000010': 'in-cen-000010',

      // 11. PM Vishwakarma
      'pm-vishwakarma': 'in-cen-000011',
      vishwakarma: 'in-cen-000011',
      'in-cen-000011': 'in-cen-000011',

      // 12. PM SVANidhi
      'pm-svanidhi': 'in-cen-000012',
      svanidhi: 'in-cen-000012',
      'in-cen-000012': 'in-cen-000012',

      // 13. PM MUDRA
      'pm-mudra': 'in-cen-000013',
      mudra: 'in-cen-000013',
      pmmy: 'in-cen-000013',
      'in-cen-000013': 'in-cen-000013',

      // 14. PM Surya Ghar
      'pm-surya-ghar': 'in-cen-000014',
      'surya-ghar': 'in-cen-000014',
      'in-cen-000014': 'in-cen-000014',

      // 15. KCC
      kcc: 'in-cen-000015',
      'kisan-credit-card': 'in-cen-000015',
      'in-cen-000015': 'in-cen-000015',
    }),
    []
  );

  const rawRequested = params.get('scheme_id') || '';
  const initialSchemeId = SCHEME_ALIASES[rawRequested.toLowerCase()] || rawRequested;
  const [schemes, setSchemes] = useState([]);
  const [selected, setSelected] = useState(initialSchemeId);
  const [q, setQ] = useState(
    () => (!initialSchemeId || flow.current?.state?.scheme_id === initialSchemeId ? flow.current : null)
  );
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const lock = useRef(false);
  const generation = useRef(0);
  const prefilled = useRef(new Set());
  const autoStarted = useRef(null);

  const profileAnswers = useMemo(
    () => (user ? profileToAnswers(profileDetails?.answers || {}) : {}),
    [user, profileDetails]
  );

  const resolveSchemeId = useCallback(
    (rawId, list = []) => {
      if (!rawId) return '';
      const lower = rawId.toLowerCase().trim();
      const directMatch = list.find(
        (s) =>
          (s.id && s.id.toLowerCase() === lower) ||
          (s.code && s.code.toLowerCase() === lower) ||
          (s.key && s.key.toLowerCase() === lower)
      );
      if (directMatch) return directMatch.id;

      if (SCHEME_ALIASES[lower]) {
        const canonical = SCHEME_ALIASES[lower];
        const inList = list.find((s) => s.id === canonical || s.code === canonical);
        if (inList) return inList.id;
        const aliasMatch = list.find(
          (s) =>
            SCHEME_ALIASES[(s.id || '').toLowerCase()] === canonical ||
            SCHEME_ALIASES[(s.code || '').toLowerCase()] === canonical
        );
        if (aliasMatch) return aliasMatch.id;
        return canonical;
      }

      const found = list.find(
        (s) => getLocalized(s.name) && getLocalized(s.name).toLowerCase().includes(lower)
      );
      return found?.id || rawId;
    },
    [SCHEME_ALIASES, getLocalized]
  );

  // Load available schemes for selection or metadata lookup
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    schemeApi
      .getSchemes({ language, limit: 100 })
      .then(async (data) => {
        const items = data.items || [];
        const requested =
          SCHEME_ALIASES[(params.get('scheme_id') || '').toLowerCase()] || params.get('scheme_id');
        if (requested && !items.some((s) => s.id === requested)) {
          try {
            const detail = await schemeApi.getSchemeByCode(requested, language);
            if (detail) items.push(detail);
          } catch {
            // Keep existing catalogue items if individual scheme lookup fails
          }
        }
        if (active) {
          setSchemes(items);
          if (requested && items.some((s) => s.id === requested)) {
            setSelected(requested);
          }
        }
      })
      .catch(async (e) => {
        if (!active) return;
        // In preview or offline development mode, fallback to mock schemes so user is not blocked
        try {
          const mockRes = await mockAdapter.getSchemes({ language });
          if (active && mockRes?.schemes?.length) {
            setSchemes(mockRes.schemes);
            const raw = params.get('scheme_id');
            const targetId = resolveSchemeId(raw, mockRes.schemes);
            if (targetId) {
              setSelected(targetId);
            }
            setError('');
            return;
          }
        } catch {
          // If mockAdapter fails as well, show the network error
        }
        if (active) setError(t(errorKey(e)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [language, reload, params, SCHEME_ALIASES, resolveSchemeId]);

  // Clean session cleanup on unmount
  useEffect(() => {
    return () => {
      generation.current++;
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Scroll to top on question change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [q?.current_question?.question_id]);

  async function run(action, navigateAfter = false) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    const ticket = generation.current;
    try {
      const result = await action();
      if (ticket !== generation.current) return;
      if (navigateAfter) navigate('/results');
      else {
        setQ(result);
        setValue('');
      }
    } catch (e) {
      if (ticket === generation.current) setError(t(errorKey(e)));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  // AUTO-START: When a scheme is chosen (via URL query param), start screening immediately without prompt
  useEffect(() => {
    const raw = params.get('scheme_id');
    if (!raw) return;
    const targetId = resolveSchemeId(raw, schemes);
    if (!targetId) return;

    setSelected(targetId);

    const canonicalId = SCHEME_ALIASES[(targetId || '').toLowerCase()] || targetId;

    // If flow is already actively evaluating this scheme, keep it
    if (
      flow.current?.state?.scheme_id &&
      (flow.current.state.scheme_id === canonicalId || flow.current.state.scheme_id === targetId) &&
      q
    ) {
      return;
    }

    // Auto-start questionnaire automatically
    if (autoStarted.current !== canonicalId) {
      autoStarted.current = canonicalId;
      run(() => flow.start(canonicalId, language));
    }
  }, [params, language, resolveSchemeId, schemes, SCHEME_ALIASES, q]);

  // Pre-fill profile answers
  useEffect(() => {
    const key = q?.current_question?.question_id;
    if (!key || !user || profileAnswers[key] === undefined || prefilled.current.has(key) || busy)
      return;
    prefilled.current.add(key);
    run(() => flow.update(key, 'answer', profileAnswers[key]));
  }, [q?.current_question?.question_id, user, profileAnswers, busy]);

  // Synchronize language changes
  useEffect(() => {
    if (q && !busy && !error && flow.current && flow.current.state.language !== language)
      run(() => flow.language(language));
  }, [language, busy, q?.state?.language, error]);

  const question = q?.current_question;
  const currentActiveSchemeId = q?.state?.scheme_id || selected;
  const currentScheme = schemes.find(
    (s) =>
      s.id === currentActiveSchemeId ||
      s.code === currentActiveSchemeId ||
      SCHEME_ALIASES[(s.id || '').toLowerCase()] === currentActiveSchemeId ||
      SCHEME_ALIASES[(currentActiveSchemeId || '').toLowerCase()] === s.id
  );
  const selectedScheme = schemes.find(
    (s) =>
      s.id === selected ||
      s.code === selected ||
      SCHEME_ALIASES[(s.id || '').toLowerCase()] === selected ||
      SCHEME_ALIASES[(selected || '').toLowerCase()] === s.id
  );
  const currentSelectValue = selectedScheme?.id || selected;
  const validSelection = Boolean(
    selectedScheme && (!selectedScheme.is_demo || selectedScheme.screening_available === true)
  );

  const clear = () => {
    generation.current++;
    autoStarted.current = null;
    prefilled.current.clear();
    flow.clear();
    setQ(null);
    setValue('');
    setError('');
    window.speechSynthesis?.cancel();
  };

  const handleSwitchScheme = () => {
    clear();
    setSelected('');
    setParams({});
  };

  const changePrefill = (key) => {
    prefilled.current.delete(key);
    run(() => flow.update(key, 'clear'));
  };

  const submit = (action, input = value) =>
    run(() => flow.update(question.question_id, action, input));

  return (
    <div className="flex-1 py-6 md:py-8 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Navigation Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Link
              to="/schemes"
              className="glass-card-subtle inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white transition-all shadow-xs"
              title={t('navSchemes', 'Explore all schemes')}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('navSchemes', 'Explore Schemes')}</span>
            </Link>

            {q && (
              <button
                type="button"
                onClick={handleSwitchScheme}
                className="glass-card-subtle inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white transition-all shadow-xs"
                title={t('switchSchemeDesc', 'Choose a different scheme to evaluate')}
              >
                <Shuffle className="w-3.5 h-3.5 text-orange-600" />
                <span>{t('switchScheme', 'Switch Scheme')}</span>
              </button>
            )}

            <button
              type="button"
              className="glass-card-subtle inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-slate-700 hover:text-rose-700 hover:bg-rose-50 transition-all shadow-xs"
              onClick={clear}
              disabled={busy}
              title={t('clearDataDesc', 'Clear all answers and reset questionnaire')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('clearData', 'Clear Data')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Main Screening Container */}
        <div
          className="glass-panel rounded-[36px] shadow-glass-lg p-6 sm:p-8 border border-white/80"
          aria-busy={busy}
        >
          {/* Active Scheme Header Banner */}
          {currentScheme && q && (
            <div className="mb-6 pb-4 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {t('evaluatingScheme', 'Eligibility Check for')}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    {getLocalized(currentScheme?.name) || currentScheme?.id}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSwitchScheme}
                className="text-xs font-semibold text-orange-700 hover:text-orange-950 underline self-start sm:self-auto"
              >
                {t('changeScheme', 'Change Scheme')}
              </button>
            </div>
          )}

          {!q && (
            <p className="text-sm text-slate-500 mb-5">
              {t('screeningSingle', 'This questionnaire evaluates one selected scheme.')}
            </p>
          )}

          {error && (
            <div role="alert" className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 mb-5 text-sm font-semibold flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => {
                  autoStarted.current = null;
                  setReload((n) => n + 1);
                }}
                className="text-xs font-bold underline hover:text-rose-950"
              >
                {t('retry', 'Retry')}
              </button>
            </div>
          )}

          {!q ? (
            loading || busy ? (
              <div className="py-12">
                <LoadingState message={t('loadingQuestion', 'Preparing eligibility questionnaire...')} />
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-base font-extrabold text-slate-900 mb-2" htmlFor="scheme-select">
                    {t('selectScheme', 'Choose a scheme to check')}
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    {t('selectSchemeDesc', 'Select any welfare program to start answering verification questions.')}
                  </p>
                  <select
                    id="scheme-select"
                    className="glass-input rounded-2xl w-full p-4 text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    value={currentSelectValue}
                    onChange={(e) => setSelected(e.target.value)}
                    disabled={busy}
                  >
                    <option value="">{t('selectScheme', 'Choose a scheme to check')}</option>
                    {schemes
                      .filter((s) => !s.is_demo || s.screening_available === true)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {getLocalized(s.name) || s.id}
                          {s.translation_fallback
                            ? ` (${t(s.language === 'en' ? 'fallbackEnglish' : 'languageFallback')})`
                            : ''}
                        </option>
                      ))}
                  </select>
                </div>

                {!schemes.length && !error && (
                  <p role="status" className="text-xs text-slate-500">
                    {t('emptyPublished', 'No published schemes available.')}
                  </p>
                )}

                <button
                  type="button"
                  className="glass-dark-pill w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-40"
                  disabled={!validSelection || busy}
                  onClick={() => {
                    const targetId = resolveSchemeId(selected, schemes) || selected;
                    const canonicalId = SCHEME_ALIASES[(targetId || '').toLowerCase()] || targetId;
                    run(() => flow.start(canonicalId, language));
                  }}
                >
                  <span>{t('startScheme', 'Start my eligibility check')}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            )
          ) : (
            <>
              {/* Progress Bar & Counter Badges */}
              <div role="status" className="text-xs text-slate-600 flex flex-wrap gap-2.5 mb-6">
                {['answered', 'unknown', 'skipped', 'remaining'].map((k) => (
                  <span
                    key={k}
                    className="px-3 py-1 rounded-full glass-card-subtle text-[11px] font-semibold"
                  >
                    {t(k === 'remaining' ? 'remainingCount' : `${k}Count`)}: {q.progress[k]}
                  </span>
                ))}
              </div>

              {q.completed &&
                (q.missing_information_labels || []).map((label, i) => (
                  <p className="mb-3 text-sm text-amber-900 font-medium" key={i}>
                    {label}
                  </p>
                ))}

              {question ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit('answer');
                  }}
                  className="space-y-6"
                >
                  <VoiceAssistant
                    contentLanguage={question.content_language}
                    textToRead={question.text}
                    onSpeechResult={(text) => {
                      try {
                        setValue(speechValue(question, text));
                        setError('');
                      } catch {
                        setError(t('invalidAnswer'));
                      }
                    }}
                  />
                  <p className="text-xs text-slate-500">
                    {t('voiceConfirm')} {t('voiceFallback')}
                  </p>
                  <h2
                    id="current-question"
                    data-question-id={question.question_id}
                    lang={question.content_language}
                    className="text-xl sm:text-2xl font-black text-slate-900 leading-snug"
                  >
                    {question.text}
                  </h2>
                  {profileAnswers[question.question_id] !== undefined && (
                    <p className="text-xs text-emerald-700 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{t('fromProfile', 'From your saved details')}</span>
                      <button
                        type="button"
                        className="ml-2 underline hover:text-emerald-900"
                        onClick={() => changePrefill(question.question_id)}
                      >
                        {t('changeAnswer', 'Change')}
                      </button>
                    </p>
                  )}
                  {(question.translation_fallback ||
                    question.content_language !== language) && (
                      <p className="text-amber-700 text-xs font-medium">{t('fallbackEnglish')}</p>
                    )}
                  <p className="text-xs text-slate-500 font-medium">
                    {[
                      question.unit,
                      question.period,
                      question.scope,
                      question.reference_basis,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>

                  {question.answer_type === 'boolean' ? (
                    <div
                      role="radiogroup"
                      aria-labelledby="current-question"
                      className="grid grid-cols-2 gap-4"
                    >
                      {[true, false].map((v) => (
                        <button
                          type="button"
                          key={String(v)}
                          role="radio"
                          aria-checked={value === v}
                          className={`glass-card-subtle rounded-[24px] p-6 text-sm font-bold transition-all ${value === v
                              ? 'ring-2 ring-orange-500 bg-white/95 text-slate-900 shadow-md scale-[1.01]'
                              : 'text-slate-700 hover:bg-white/80 active:scale-95'
                            }`}
                          disabled={busy}
                          onClick={() => setValue(v)}
                        >
                          {t(v ? 'yes' : 'no')}
                        </button>
                      ))}
                    </div>
                  ) : question.answer_type === 'category' ? (
                    <div>
                      <p className="text-xs text-slate-500 mb-2 font-medium">{t('categoryCodes')}</p>
                      <select
                        aria-labelledby="current-question"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="glass-input rounded-2xl w-full p-4 text-sm font-semibold focus:outline-none cursor-pointer"
                        disabled={busy}
                      >
                        <option value="">{t('selectOne', 'Select one')}</option>
                        {question.allowed_values.map((v) => (
                          <option value={v} key={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <input
                      aria-labelledby="current-question"
                      type="text"
                      inputMode={
                        question.answer_type === 'integer' ? 'numeric' : 'decimal'
                      }
                      autoComplete="off"
                      value={value}
                      disabled={busy}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={t('typeAnswerPlaceholder', 'Enter your response...')}
                      className="glass-input rounded-full w-full p-4 text-center text-xl font-bold focus:outline-none placeholder:text-slate-400 placeholder:text-sm placeholder:font-normal"
                    />
                  )}

                  {/* Primary & Auxiliary Action Controls */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={busy || value === ''}
                      className="glass-dark-pill inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide disabled:opacity-40 hover:bg-black transition-all shadow-md active:scale-95"
                    >
                      <span>{t('btnNext', 'Continue')}</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => submit('skip')}
                      className="glass-card-subtle rounded-full px-5 py-3.5 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs"
                    >
                      {t('skipQuestion', 'Skip Question')}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => submit('answer', null)}
                      className="glass-card-subtle rounded-full px-5 py-3.5 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs"
                    >
                      {t('unknownAnswer', 'I Do Not Know')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 py-4">
                  <p className="text-base font-bold text-slate-900">
                    {q.completion_reason === 'VERIFICATION_REQUIRED'
                      ? t('verificationComplete', 'Preliminary evaluation complete.')
                      : t('resultNotice', 'All questions answered.')}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {q.evaluation?.explanation}
                  </p>
                  <button
                    disabled={busy}
                    className="glass-dark-pill inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold tracking-wide hover:bg-black transition-all shadow-lg active:scale-95"
                    onClick={() => run(() => flow.finish(), true)}
                  >
                    <span>{t('finishScreening', 'View Detailed Evaluation Results')}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              {/* Back & Answer History Management Bar */}
              <div className="mt-8 pt-5 border-t border-slate-200/60 flex flex-wrap items-center gap-2.5">
                <button
                  disabled={busy || !flow.history.length}
                  onClick={() => run(() => flow.back())}
                  className="glass-card-subtle inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 transition-all shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('previousAnswer', 'Previous Question')}</span>
                </button>
                {Object.keys(q.state.answers)
                  .concat(q.state.skipped)
                  .map((key) => (
                    <button
                      key={key}
                      disabled={busy}
                      className="glass-card-subtle rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
                      onClick={() => run(() => flow.update(key, 'clear'))}
                      title={`${t('clearAnswer')}: ${q.field_labels?.[key] || key}`}
                    >
                      ✕ {q.field_labels?.[key] || key}
                    </button>
                  ))}
              </div>
            </>
          )}

          {busy && <p role="status" className="mt-4 text-xs text-slate-500 font-medium">{t('loadingQuestion')}</p>}
        </div>

        <p className="text-center text-xs text-slate-500 mt-5">
          {t('privacyMemory', 'Answers stay in memory and are cleared on reload or Clear Data.')}
        </p>
      </div>
    </div>
  );
};
