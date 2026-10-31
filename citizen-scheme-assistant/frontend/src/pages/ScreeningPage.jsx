import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

export const ScreeningPage = () => {
  const { t, language } = useLanguage(); const navigate = useNavigate(); const [params] = useSearchParams();
  const { user, profileDetails } = useAuth();
  const [schemes,setSchemes] = useState([]), [selected,setSelected] = useState(params.get('scheme_id') || '');
  const [q,setQ] = useState(()=>!params.get('scheme_id')||flow.current?.state?.scheme_id===params.get('scheme_id')?flow.current:null), [value,setValue] = useState(''), [error,setError] = useState(''), [busy,setBusy] = useState(false);
  const [loading,setLoading] = useState(true), [reload,setReload] = useState(0); const lock = useRef(false); const generation = useRef(0); const prefilled = useRef(new Set());
  const profileAnswers = useMemo(() => user ? profileToAnswers(profileDetails?.answers || {}) : {}, [user, profileDetails]);
  useEffect(() => {
    let active=true; setLoading(true); setError('');
    schemeApi.getSchemes({language,limit:100}).then(async data => {
      const items=data.items || []; const requested=params.get('scheme_id');
      if(requested && !items.some(s=>s.id===requested)) {
        const detail=await schemeApi.getSchemeByCode(requested,language);
        items.push(detail);
      }
      if(active) setSchemes(items);
    })
      .catch(e => { if(active) setError(t(errorKey(e))); }).finally(() => {if(active)setLoading(false);});
    return () => {active=false;};
  },[language,reload]);
  useEffect(() => { flow.api.clearSession?.(); return () => { generation.current++; window.speechSynthesis?.cancel(); }; },[]);
  useEffect(() => {
    const key = q?.current_question?.question_id;
    if (!key || !user || profileAnswers[key] === undefined || prefilled.current.has(key) || busy) return;
    prefilled.current.add(key);
    run(() => flow.update(key, 'answer', profileAnswers[key]));
  }, [q?.current_question?.question_id, user, profileAnswers, busy]);
  async function run(action, navigateAfter=false) {
    if(lock.current) return; lock.current=true; setBusy(true); setError(''); const ticket=generation.current;
    try {
      const result=await action(); if(ticket!==generation.current)return;
      if(navigateAfter) navigate('/results'); else {setQ(result);setValue('');}
    } catch(e) {if(ticket===generation.current)setError(t(errorKey(e)));}
    finally {lock.current=false;setBusy(false);}
  }
  useEffect(() => {
    if(q && !busy && !error && flow.current && flow.current.state.language!==language) run(() => flow.language(language));
  },[language,busy,q?.state?.language,error]);
  const question=q?.current_question;
  const validSelection=schemes.some(s=>s.id===selected&&(!s.is_demo||s.screening_available===true));
  const clear=()=>{generation.current++;prefilled.current.clear();flow.clear();setQ(null);setValue('');setError('');window.speechSynthesis?.cancel();};
  const changePrefill = (key) => { prefilled.current.delete(key); run(() => flow.update(key, 'clear')); };
  const submit=(action,input=value)=>run(()=>flow.update(question.question_id,action,input));
  return <div className="flex-1 py-6 md:py-8 relative"><div className="max-w-3xl mx-auto px-4 sm:px-6">
    <div className="flex justify-between mb-5"><button type="button" className="glass-card-subtle rounded-full px-4 py-2" onClick={clear} disabled={busy}>{t('clearData')}</button><LanguageSwitcher/></div>
    <div className="glass-panel rounded-[36px] shadow-glass-lg p-6 sm:p-8 border border-white/80" aria-busy={busy}>
      <p className="text-sm text-slate-500 mb-5">{t('screeningSingle')}</p>
      {error && <p role="alert" className="text-rose-700 mb-4">{error}</p>}
      {!q ? loading ? <LoadingState/> : <div className="space-y-4">
        <label className="block font-bold" htmlFor="scheme-select">{t('selectScheme')}</label>
        <select id="scheme-select" className="glass-input rounded-2xl w-full p-4" value={selected} onChange={e=>setSelected(e.target.value)} disabled={busy}>
          <option value="">{t('selectScheme')}</option>{schemes.filter(s=>!s.is_demo||s.screening_available===true).map(s=><option key={s.id} value={s.id}>{s.name || s.id}{s.translation_fallback?` (${t(s.language==='en'?'fallbackEnglish':'languageFallback')})`:''}</option>)}
        </select>
        {!schemes.length && !error && <p role="status">{t('emptyPublished')}</p>}
        {error && <button type="button" onClick={()=>setReload(n=>n+1)}>{t('retry')}</button>}
        <button className="glass-dark-pill rounded-full p-4 disabled:opacity-40" disabled={!validSelection || busy} onClick={()=>run(()=>flow.start(selected,language))}>{t('startScheme')}</button>
      </div> : <>
        <div role="status" className="text-xs text-slate-600 flex flex-wrap gap-3 mb-6">
          {['answered','unknown','skipped','remaining'].map(k=><span key={k}>{t(k==='remaining'?'remainingCount':`${k}Count`)}: {q.progress[k]}</span>)}
        </div>
        {q.completed && (q.missing_information_labels||[]).map((label,i)=><p className="mb-3 text-sm" key={i}>{label}</p>)}
        {question ? <form onSubmit={e=>{e.preventDefault();submit('answer');}} className="space-y-5">
          <VoiceAssistant contentLanguage={question.content_language} textToRead={question.text} onSpeechResult={text=>{try{setValue(speechValue(question,text));setError('');}catch{setError(t('invalidAnswer'));}}}/>
          <p className="text-xs text-slate-500">{t('voiceConfirm')} {t('voiceFallback')}</p>
          <h2 id="current-question" data-question-id={question.question_id} lang={question.content_language} className="text-xl sm:text-2xl font-black text-slate-900">{question.text}</h2>
          {profileAnswers[question.question_id] !== undefined && <p className="text-xs text-emerald-700">{t('fromProfile', 'From your saved details')} <button type="button" className="ml-2 underline" onClick={() => changePrefill(question.question_id)}>{t('changeAnswer', 'Change')}</button></p>}
          {(question.translation_fallback || question.content_language!==language) && <p className="text-amber-700 text-xs">{t('fallbackEnglish')}</p>}
          <p className="text-xs">{[question.unit,question.period,question.scope,question.reference_basis].filter(Boolean).join(' · ')}</p>
          {question.answer_type==='boolean' ? <div role="radiogroup" aria-labelledby="current-question" className="grid grid-cols-2 gap-4">{[true,false].map(v=><button type="button" key={String(v)} role="radio" aria-checked={value===v} className={`glass-card-subtle rounded-[24px] p-6 ${value===v?'ring-2 ring-orange-400':''}`} disabled={busy} onClick={()=>setValue(v)}>{t(v?'yes':'no')}</button>)}</div>
           :question.answer_type==='category' ? <div><p className="text-xs">{t('categoryCodes')}</p><select aria-labelledby="current-question" value={value} onChange={e=>setValue(e.target.value)} className="glass-input rounded-2xl w-full p-4" disabled={busy}><option value="">{t('selectOne','Select one')}</option>{question.allowed_values.map(v=><option value={v} key={v}>{v}</option>)}</select></div>
           :<input aria-labelledby="current-question" type="text" inputMode={question.answer_type==='integer'?'numeric':'decimal'} autoComplete="off" value={value} disabled={busy} onChange={e=>setValue(e.target.value)} className="glass-input rounded-full w-full p-4 text-center text-xl"/>}
          <div className="flex flex-wrap gap-3"><button type="submit" disabled={busy||value===''} className="glass-dark-pill rounded-full px-6 py-3 disabled:opacity-40">{t('btnNext','Continue')}</button>
            <button type="button" disabled={busy} onClick={()=>submit('skip')} className="glass-card-subtle rounded-full px-4 py-3">{t('skipQuestion')}</button>
            <button type="button" disabled={busy} onClick={()=>submit('answer',null)} className="glass-card-subtle rounded-full px-4 py-3">{t('unknownAnswer')}</button></div>
        </form> : <div className="space-y-4"><p>{q.completion_reason==='VERIFICATION_REQUIRED'?t('verificationComplete'):t('resultNotice')}</p>
          <p>{q.evaluation.explanation}</p><button disabled={busy} className="glass-dark-pill rounded-full p-4" onClick={()=>run(()=>flow.finish(),true)}>{t('finishScreening')}</button></div>}
        <div className="mt-5 flex flex-wrap gap-3"><button disabled={busy || !flow.history.length} onClick={()=>run(()=>flow.back())} className="glass-card-subtle rounded-full px-4 py-2 disabled:opacity-40">{t('previousAnswer')}</button>
          {Object.keys(q.state.answers).concat(q.state.skipped).map(key=><button key={key} disabled={busy} className="glass-card-subtle rounded-full px-4 py-2" onClick={()=>run(()=>flow.update(key,'clear'))}>{t('clearAnswer')}: {q.field_labels?.[key]||t('previousAnswer')}</button>)}</div>
      </>}
      {busy && <p role="status" className="mt-4">{t('loadingQuestion')}</p>}
    </div><p className="text-center text-xs text-slate-500 mt-5">{t('privacyMemory')}</p>
  </div></div>;
};
