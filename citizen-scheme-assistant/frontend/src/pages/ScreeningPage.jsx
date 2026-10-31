import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { sessionApi } from '../services/sessionApi';
import { QuestionInput } from '../components/questionnaire/QuestionInput';
import { VoiceAssistant } from '../components/questionnaire/VoiceAssistant';
import { ProgressBar } from '../components/common/ProgressBar';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, HelpCircle } from 'lucide-react';

export const ScreeningPage = () => {
  const { t, getLocalized, language } = useLanguage();
  const navigate = useNavigate();
  const questionContainerRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionError, setSessionError] = useState(null);
  const [evalError, setEvalError] = useState(null);

  // 1. Scroll to very top of window and document on step change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentIndex]);

  // Cancel any active speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize or resume session
  useEffect(() => {
    let active = true;

    async function init() {
      setSessionError(null);
      try {
        let sid = sessionApi.getSessionId();
        if (!sid) {
          const res = await sessionApi.createSession(language);
          sid = res.session_id;
        }
        if (active) {
          setSessionId(sid);
          const savedAnswers = JSON.parse(sessionStorage.getItem('yojanamitra_answers') || '{}');
          setAnswers(savedAnswers);
          loadQuestion(sid, 0, savedAnswers);
        }
      } catch (err) {
        console.error('Session init error:', err);
        if (active) {
          setSessionError(err.message || 'Failed to initialize session');
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      active = false;
    };
  }, []);

  const loadQuestion = async (sid, index, existingAnswers = answers) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await sessionApi.getNextQuestion(sid, index);
      if (data && data.question) {
        setCurrentQuestion(data.question);
        setCurrentIndex(data.current_index || index);
        setTotalQuestions(data.total_questions || 10);

        // Prepopulate current answer if citizen previously answered
        const qId = data.question.id;
        if (existingAnswers[qId] !== undefined) {
          setCurrentAnswer(existingAnswers[qId]);
        } else {
          setCurrentAnswer(data.question.type === 'MULTI_SELECT' ? [] : null);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (val) => {
    setCurrentAnswer(val);
    setErrorMessage('');
  };

  const handleNext = async (e) => {
    if (e) {
      e.preventDefault();
      e.currentTarget?.blur();
    }

    // Debounce / race-condition guard
    if (loading || evaluating) return;

    if (!currentQuestion) return;

    // Cancel any active voice read-aloud immediately on navigation
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Validation for required fields
    if (
      currentQuestion.required &&
      (currentAnswer === null ||
        currentAnswer === undefined ||
        currentAnswer === '' ||
        (Array.isArray(currentAnswer) && currentAnswer.length === 0))
    ) {
      setErrorMessage(t('requiredField', 'This question is required to evaluate eligibility.'));
      return;
    }

    // Save answer
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: currentAnswer,
    };
    setAnswers(updatedAnswers);

    try {
      await sessionApi.submitAnswer(sessionId, currentQuestion.id, currentAnswer);
    } catch (err) {
      console.warn('Answer submit note:', err.message);
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx < totalQuestions) {
      loadQuestion(sessionId, nextIdx, updatedAnswers);
    } else {
      triggerEvaluation();
    }
  };

  const handleBack = (e) => {
    if (e) {
      e.preventDefault();
      e.currentTarget?.blur();
    }

    // Debounce / race-condition guard
    if (loading || evaluating) return;

    // Cancel any active voice read-aloud immediately on navigation
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Preserve any edits made on current step before moving back
    const updatedAnswers = {
      ...answers,
      ...(currentQuestion && currentAnswer !== null && currentAnswer !== undefined
        ? { [currentQuestion.id]: currentAnswer }
        : {}),
    };
    setAnswers(updatedAnswers);

    if (currentIndex > 0) {
      loadQuestion(sessionId, currentIndex - 1, updatedAnswers);
    }
  };

  const triggerEvaluation = async () => {
    setEvaluating(true);
    setEvalError(null);
    try {
      await sessionApi.evaluateSession(sessionId);
      navigate('/results');
    } catch (err) {
      console.error('Evaluation error:', err);
      // 1.5 Never navigate to /results after a failed evaluation. Show ErrorState with Retry button.
      setEvalError(err.message || 'Evaluation request failed. Please check connection and try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleClear = () => {
    if (window.confirm(t('clearSessionConfirm'))) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      sessionApi.clearSession();
      setAnswers({});
      setCurrentAnswer(null);
      setCurrentIndex(0);
      setSessionError(null);
      setEvalError(null);
      sessionApi.createSession(language).then((res) => {
        setSessionId(res.session_id);
        loadQuestion(res.session_id, 0, {});
      }).catch((err) => {
        setSessionError(err.message || 'Failed to create new session');
      });
    }
  };

  const questionTitle = currentQuestion ? getLocalized(currentQuestion.title) : '';
  const helpText = currentQuestion ? getLocalized(currentQuestion.help_text) : '';

  if (sessionError) {
    return (
      <div className="flex-1 py-16 px-4">
        <ErrorState
          title={t('errorTitle', 'Something went wrong')}
          message={sessionError}
          onRetry={() => {
            setSessionError(null);
            setLoading(true);
            sessionApi
              .createSession(language)
              .then((res) => {
                setSessionId(res.session_id);
                loadQuestion(res.session_id, 0, {});
              })
              .catch((err) => {
                setSessionError(err.message || 'Failed to initialize session');
                setLoading(false);
              });
          }}
        />
      </div>
    );
  }

  if (evalError) {
    return (
      <div className="flex-1 py-16 px-4">
        <ErrorState
          title={t('errorTitle', 'Something went wrong')}
          message={evalError}
          onRetry={triggerEvaluation}
        />
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="glass-panel p-8 sm:p-12 rounded-[36px] shadow-glass-lg max-w-md w-full text-center border border-white/80">
          <div className="w-16 h-16 rounded-full glass-orb-saffron text-white flex items-center justify-center mx-auto mb-6 animate-spin shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            Evaluating Government Schemes...
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Matching your profile with Central & State welfare guidelines. Generating explanations and document checklists.
          </p>
        </div>
      </div>
    );
  }

  return (
    // 2 & 3. Outer Page Wrapper with ref, scroll-mt-6, and compact py-6 md:py-8 padding
    <div
      ref={questionContainerRef}
      className="flex-1 py-6 md:py-8 relative scroll-mt-6"
    >
      {/* Background soft glowing sun orbs */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-orange-300/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-72 h-72 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Top Control Bar ("Clear Data / New Citizen" and language switcher) */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-card-subtle text-xs font-semibold text-slate-600 hover:text-rose-600 transition"
            title={t('btnClearSession')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('btnClearSession', 'Clear Data / Reset')}</span>
          </button>

          <LanguageSwitcher />
        </div>

        {/* Questionnaire Progress & Question Card */}
        <div className="glass-panel rounded-[36px] shadow-glass-lg p-6 sm:p-8 sm:py-10 border border-white/80 relative overflow-hidden">
          
          {/* Progress Bar ("Step X of 10") */}
          <div className="mb-6 sm:mb-8">
            <ProgressBar current={currentIndex} total={totalQuestions || 10} />
          </div>

          {loading ? (
            <LoadingState message="Loading next question..." />
          ) : currentQuestion ? (
            <div className="space-y-6 sm:space-y-8">
              
              {/* Question Header & Voice Assistant */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider glass-card-subtle px-3 py-0.5 rounded-full">
                    {t('stepProgress', 'Question')} {currentIndex + 1} {t('ofText', 'of')}{' '}
                    {totalQuestions}
                  </span>

                  {/* Bilingual Voice Read Aloud and Speech Recognition */}
                  <VoiceAssistant
                    textToRead={`${questionTitle}. ${helpText}`}
                    onSpeechResult={(val) => {
                      if (currentQuestion.type === 'NUMBER') {
                        const num = parseInt(val.replace(/\D/g, ''), 10);
                        if (!isNaN(num)) setCurrentAnswer(num);
                      } else {
                        setCurrentAnswer(val);
                      }
                    }}
                  />
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {questionTitle}
                </h2>

                {helpText && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-slate-500 font-normal">
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p>{helpText}</p>
                  </div>
                )}
              </div>

              {/* Dynamic Input Control */}
              <div className="py-1">
                <QuestionInput
                  question={currentQuestion}
                  value={currentAnswer}
                  onChange={handleAnswerChange}
                />
              </div>

              {/* Error validation message */}
              {errorMessage && (
                <p className="text-xs font-bold text-rose-600 text-center animate-shake">
                  {errorMessage}
                </p>
              )}

              {/* Navigation Controls */}
              <div className="pt-5 border-t border-white/60 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={(e) => {
                    handleBack(e);
                  }}
                  disabled={currentIndex === 0 || loading || evaluating}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none ${
                    currentIndex === 0 || loading || evaluating
                      ? 'text-slate-300 cursor-not-allowed bg-transparent'
                      : 'glass-card-subtle text-slate-700 hover:bg-white'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('btnBack', 'Back')}</span>
                </button>

                {/* Dark Pill CTA with capsule arrow */}
                <button
                  type="button"
                  onClick={(e) => {
                    handleNext(e);
                  }}
                  disabled={loading || evaluating}
                  className="glass-dark-pill inline-flex items-center gap-3 px-6 py-3.5 rounded-full text-xs font-semibold tracking-wide hover:bg-black transition-all shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {currentIndex === totalQuestions - 1
                      ? t('btnSubmit', 'Evaluate Eligibility')
                      : t('btnNext', 'Continue')}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </button>
              </div>

            </div>
          ) : (
            <p className="text-center text-sm text-slate-500">No questions available.</p>
          )}

        </div>

        {/* Ephemeral Privacy Note */}
        <div className="mt-5 text-center text-xs text-slate-400 font-medium">
          <span>🔒 Ephemeral Session: Your answers are not stored permanently on any server.</span>
        </div>

      </div>
    </div>
  );
};
