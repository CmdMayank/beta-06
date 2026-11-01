import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { errorKey } from '../i18n/integration.js';
import { screeningFlow as flow } from '../services/screeningFlow.js';
import { ResultCard } from '../components/results/ResultCard';

export const ResultsPage=()=>{
  const {t,language}=useLanguage(); const [result,setResult]=useState(flow.result),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{let active=true;if(flow.current && flow.current.state.language!==language){setBusy(true);flow.language(language).then(()=>flow.finish()).then(r=>{if(active)setResult(r);}).catch(e=>{if(active)setError(t(errorKey(e)));}).finally(()=>{if(active)setBusy(false);});}return()=>{active=false;};},[language]);
  const clear=()=>{flow.clear();setResult(null);setError('');};
  return <div className="flex-1 py-10 sm:py-16"><div className="max-w-5xl mx-auto px-4 space-y-6">
    <h1 className="text-3xl font-black">{t('resultsTitle')}</h1>
    <div className="flex gap-4"><Link to="/schemes" className="glass-card-subtle rounded-full p-3">{t('selectScheme')}</Link><button onClick={clear} className="glass-card-subtle rounded-full p-3">{t('clearData')}</button></div>
    {error?<p role="alert">{error}</p>:busy?<p role="status">{t('loading')}</p>:result?<ResultCard result={result}/>:<p role="status">{t('resultMissing')}</p>}
  </div></div>;
};
