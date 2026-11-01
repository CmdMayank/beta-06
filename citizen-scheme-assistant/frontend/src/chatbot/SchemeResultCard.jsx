import React from 'react';
import { Link } from 'react-router-dom';
import { chatText } from './i18n';
export const SchemeResultCard=({scheme,language='en'})=>{
 const t=key=>chatText(language,key);
 let url=null;try{const u=new URL(scheme.official_url);if(u.protocol==='https:'&&!u.username&&!u.password)url=u.href;}catch{}
 return <section className="space-y-2 rounded-2xl border border-orange-200 bg-white p-3 text-xs">
  <h3 className="font-bold text-slate-900">{scheme.name}</h3>
  <p className="leading-relaxed text-slate-700">{scheme.benefits_summary}</p>
  {scheme.publication_status!=='published'&&<p className="text-[10px] text-slate-500">{t('draft')}</p>}
  <div className="flex flex-wrap gap-3"><Link to={'/schemes/'+encodeURIComponent(scheme.scheme_id)} className="font-semibold text-orange-700 underline">{t('details')}</Link>
   {url&&<a href={url} target="_blank" rel="noopener noreferrer" className="text-slate-600 underline">{t('official')}</a>}
  </div>
 </section>;
};
