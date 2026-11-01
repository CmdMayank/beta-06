import React from 'react';
import {Link} from 'react-router-dom';
import {useLanguage} from '../../i18n/LanguageContext';
import {StatusBadge} from '../common/StatusBadge';
import {displayText} from '../../services/adapters.js';
import {SourceReferences} from '../schemes/SourceReferences';
import {VoiceAssistant} from '../questionnaire/VoiceAssistant';
import {DocumentChecklist} from './DocumentChecklist';

export const ResultCard=({result,className=''})=>{
 const {t,getLocalized,language}=useLanguage();const raw=result.raw||{};
 const text=value=><span lang={value?.content_language||undefined}>{displayText(value)||t('unavailable')}{value?.translation_fallback&&<small className="block text-slate-500">{t('fallbackEnglish')}</small>}</span>;
 const conditions=raw.evaluation?.evaluated_conditions||[];
 const missing=raw.missing_information_labels||conditions.filter(c=>c.result==='UNKNOWN').map(c=>c.label);
 return <article className={'space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 '+className}>
  <header className="space-y-4"><StatusBadge status={result.status}/><h2 className="text-2xl font-bold text-slate-900"><Link to={'/schemes/'+result.scheme_id}>{getLocalized(result.scheme_name)||t('unavailable')}</Link></h2>
   {raw.scheme_name?.translation_fallback&&<p className="text-xs text-slate-500">{t('fallbackEnglish')}</p>}
   <p className="text-lg leading-relaxed text-slate-700">{text(raw.explanation)}</p>
   <VoiceAssistant textToRead={displayText(raw.explanation)} contentLanguage={raw.explanation?.content_language}/>
   <p role="note" className="border-l-2 border-teal-700 pl-4 text-sm text-slate-500">{text(raw.assessment_notice)} {t('independentNotice')}</p>
  </header>
  {!!missing.length&&<section className="rounded-2xl bg-amber-50 p-5"><h3 className="font-semibold text-amber-950">{t('missingHeading')}</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-amber-950">{missing.map((label,i)=><li key={i}>{label}</li>)}</ul></section>}
  <details className="rounded-2xl border border-slate-200 p-5"><summary className="cursor-pointer font-semibold">{t('reasonsHeading')}</summary><ul className="mt-4 space-y-3">{conditions.filter(c=>c.node_type==='predicate').map(c=><li key={c.rule_id} lang={c.content_language} className="flex gap-3 text-sm"><span aria-hidden="true" className={c.result==='SATISFIED'?'text-teal-800':c.result==='FAILED'?'text-rose-700':'text-amber-700'}>{c.result==='SATISFIED'?'✓':c.result==='FAILED'?'×':'?'}</span><div><p className="font-semibold">{c.label}</p><p className="text-slate-500">{c.explanation}</p></div></li>)}</ul></details>
  {!!raw.benefits?.items?.length&&<section><h3 className="mb-3 text-lg font-bold">{t('benefitsHeading')}</h3><ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">{raw.benefits.items.map(b=><li key={b.item_id}>{text(b.description)}</li>)}</ul></section>}
  <DocumentChecklist results={[result]}/>
  <section className="border-t border-slate-200 pt-6"><h3 className="mb-4 text-lg font-bold">{t('nextSteps')}</h3>
   {(raw.application_guidance?.items||[]).map(a=><ol key={a.item_id} className="list-decimal space-y-3 pl-5 leading-relaxed text-slate-700">{(a.steps||[]).map((s,i)=><li key={i}>{text(s)}</li>)}</ol>)}
   {!raw.application_guidance?.items?.length&&<p className="text-sm text-slate-500">{t('guidanceUnavailable')}</p>}
   <div className="mt-5 flex flex-wrap gap-3">{result.application_urls?.map(link=><a key={link.route_id+'-'+link.url} className="inline-block rounded-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white" href={link.url} target="_blank" rel="noopener noreferrer">{t(link.link_kind==='information'?'applicationInfoLink':'applicationLink')} ↗</a>)}</div>
  </section>
  {!!raw.manual_notes?.length&&<section><h3 className="mb-2 font-semibold">{t('providerNotes')}</h3>{raw.manual_notes.map((n,i)=><p className="text-sm leading-relaxed text-slate-600" key={i}>{n}</p>)}</section>}
  <SourceReferences sources={result.sources}/>
  {raw.screening_scope==='preliminary_only'&&language==='hi'&&<p className="text-xs text-slate-500">{t('projectTranslation')}</p>}
  {raw.last_verification_date&&<p className="text-xs text-slate-500">{t('sourceCheckedOn')}: {raw.last_verification_date}</p>}
 </article>;
};
