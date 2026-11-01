import React from 'react';
import { Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SchemeResultCard } from './SchemeResultCard';
import { EligibilityResult } from './EligibilityResult';
import { chatText } from './i18n';
const safe=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?value:null;}catch{return null;}};
export const ChatMessage=({message,language,onRead})=>{
 const user=message.role==='user',t=key=>chatText(language,key);
 return <article className={user?'ml-8 space-y-2':'mr-3 space-y-2'} aria-label={user?t('input'):t('response')}>
  <div className={user?'whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-slate-900 p-3 text-sm leading-relaxed text-white':'whitespace-pre-wrap break-words rounded-2xl rounded-bl-sm bg-slate-100 p-3 text-sm leading-relaxed text-slate-900'}>
   {message.content}
  </div>
  {!user&&<button type="button" onClick={onRead} aria-label={t('read')} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"><Volume2 size={14}/>{t('read')}</button>}
  {message.schemes?.map(s=><SchemeResultCard key={s.scheme_id} scheme={s} language={language}/>)}
  {message.eligibility&&<EligibilityResult eligibility={message.eligibility} language={language}/>}
  {message.missing_documents?.length>0&&<section className="rounded-xl border border-slate-200 p-3 text-xs">
   <h3 className="font-semibold">{t('documents')}</h3><ul className="mt-2 list-disc space-y-1 pl-4">
    {message.missing_documents.map((d,i)=><li key={i}>{d.document_name} <span className="text-slate-500">— {t('unknown')}</span></li>)}
   </ul></section>}
  {message.application_guidance&&<section className="rounded-xl border border-slate-200 p-3 text-xs">
   <h3 className="font-semibold">{t('application')}</h3><ol className="mt-2 list-decimal space-y-1 pl-4">
    {message.application_guidance.steps.map((step,i)=><li key={i}>{step}</li>)}</ol></section>}
  {message.screening_url&&/^\/screening\?scheme_id=in-cen-\d{6}$/.test(message.screening_url)&&<Link to={message.screening_url} className="inline-block rounded-full bg-orange-600 px-3 py-2 text-xs font-semibold text-white">{t('screen')}</Link>}
  {message.sources?.length>0&&<details className="text-xs text-slate-600"><summary className="cursor-pointer">{t('sources')}</summary>
   {message.sources.filter(s=>safe(s.original_url)).slice(0,6).map((s,i)=><a key={i} className="mt-1 block underline" href={safe(s.original_url)} target="_blank" rel="noreferrer noopener">{s.title||s.source_title||t('official')}</a>)}</details>}
 </article>;
};
