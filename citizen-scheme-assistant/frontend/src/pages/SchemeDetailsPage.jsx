import React,{useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {useLanguage} from '../i18n/LanguageContext';
import {errorKey} from '../i18n/integration.js';
import {schemeApi} from '../services/schemeApi.js';
import {displayText,safeUrl} from '../services/adapters.js';
import {SourceReferences} from '../components/schemes/SourceReferences';

export const SchemeDetailsPage=()=>{
 const {code}=useParams();const {t,language}=useLanguage();const [scheme,setScheme]=useState(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;setScheme(null);setError('');schemeApi.getSchemeByCode(code,language).then(r=>{if(active)setScheme(r);}).catch(e=>{if(active)setError(t(errorKey(e)));});return()=>{active=false;};},[code,language]);
 const section=(title,items,render,empty)=><section className="border-t border-slate-200 pt-6"><h2 className="mb-4 text-xl font-bold text-slate-900">{t(title)}</h2>{items?.length?<ul className="space-y-3 leading-relaxed text-slate-700">{items.map((item,i)=><li key={item.item_key||i} className="flex gap-3"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700"/><div>{render(item)}</div></li>)}</ul>:<p className="text-sm text-slate-500">{t(empty||'unavailable')}</p>}</section>;
 const docs=scheme?.required_documents||[];
 const guidance=scheme?.application_guidance;
 const steps=Array.isArray(guidance)?guidance.flatMap(g=>g.steps||[]):guidance?.steps||[];
 const legacyRoutes=scheme?.application_routes||[];
 const canScreen=scheme&&(scheme.screening_available===true||!scheme.is_demo);
 return <div className="flex-1 py-10"><div className="mx-auto max-w-5xl space-y-6 px-4"><Link className="text-sm font-semibold text-teal-800 hover:underline" to="/schemes">← {t('navSchemes')}</Link>
 {error?<p role="alert">{error}</p>:!scheme?<p role="status">{t('loading')}</p>:<article className="space-y-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
  <header className="space-y-4"><p className="text-xs font-semibold uppercase tracking-wider text-teal-800">{t(canScreen?'quickCheck':'schemeGuide')}</p>
   <h1 lang={scheme.language||undefined} className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{scheme.name||t('unavailable')}</h1>
   {scheme.benefit_highlight&&<p className="text-xl font-semibold text-teal-800">{scheme.benefit_highlight}</p>}
   {scheme.audience&&<p className="text-sm text-slate-600">{t('audienceHeading')}: {scheme.audience}</p>}
   {canScreen?<Link className="inline-block rounded-full bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900" to={'/screening?scheme_id='+encodeURIComponent(scheme.id)}>{t('preliminaryAction')}</Link>:<p className="text-sm text-slate-600">{t('informationOnly')}</p>}
  </header>
  <p role="note" className="border-l-2 border-teal-700 pl-4 text-sm leading-relaxed text-slate-600">{scheme.assessment_notice||t('preliminaryNotice')} {t('independentNotice')}</p>
  {scheme.translation_fallback&&<p className="text-xs text-slate-500">{t('sourceLanguage')}</p>}
  <section><h2 className="mb-3 text-xl font-bold">{t('overviewHeading')}</h2><p lang={scheme.language||undefined} className="leading-relaxed text-slate-700">{scheme.description||t('unavailable')}</p></section>
  {section('benefitsHeading',scheme.benefits,b=>displayText(b.description),'unavailable')}
  {section('criteriaHeading',scheme.criteria,c=>c.text,'unavailable')}
  {section('documentsHeading',docs,d=><>{displayText(d.title)||d.document_type}{d.requirement==='conditional'&&<small className="block text-slate-500">{t('optionalCondition')}</small>}</>,'documentsUnavailable')}
  <section className="border-t border-slate-200 pt-6"><h2 className="mb-4 text-xl font-bold">{t('applicationHeading')}</h2>
   {steps.length?<ol className="list-decimal space-y-3 pl-5 leading-relaxed text-slate-700">{steps.map((s,i)=><li key={i}>{displayText(s)}</li>)}</ol>:legacyRoutes.length?<ol className="list-decimal space-y-3 pl-5">{legacyRoutes.map(r=><li key={r.id}>{r.instructions}</li>)}</ol>:<p className="text-sm text-slate-500">{t('guidanceUnavailable')}</p>}
   {safeUrl(guidance?.url)&&<a className="mt-5 inline-block rounded-full border border-teal-800 px-5 py-3 text-sm font-semibold text-teal-900" href={guidance.url} target="_blank" rel="noopener noreferrer">{t(guidance.link_kind==='application'?'applicationLink':'applicationInfoLink')} ↗</a>}
   {legacyRoutes.filter(r=>safeUrl(r.original_url)).map(r=><p className="mt-3" key={r.id}><a className="underline text-teal-900" href={r.original_url} target="_blank" rel="noopener noreferrer">{t('applicationInfoLink')}</a></p>)}
  </section>
  {!!scheme.manual_notes?.length&&<section className="rounded-2xl bg-slate-50 p-5"><h2 className="mb-2 font-semibold">{t('providerNotes')}</h2>{scheme.manual_notes.map((n,i)=><p className="text-sm leading-relaxed text-slate-600" key={i}>{n}</p>)}</section>}
  <SourceReferences sources={scheme.sources}/>
  {language==='hi'&&scheme.translation_origin==='project_authored_not_official'&&<p className="text-xs text-slate-500">{t('projectTranslation')}</p>}
 </article>}</div></div>;
};
