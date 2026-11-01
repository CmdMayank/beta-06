import React from 'react';
import { chatText } from './i18n';
export const EligibilityResult=({eligibility,language='en'})=>{
 const t=key=>chatText(language,key);
 const label=eligibility.status==='POTENTIALLY_ELIGIBLE'?'likely':eligibility.status==='NOT_ELIGIBLE'?'unlikely':'unknown';
 return <section className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-slate-900">
  <h3 className="font-semibold">{eligibility.scheme_name} — {t(label)}</h3>
  <p>{eligibility.summary_explanation}</p>
  <ul className="space-y-1">{eligibility.criteria_breakdown.map((c,i)=><li key={i}>{c.satisfied===true?'✓':c.satisfied===false?'×':'?'} {c.criterion_name}: {c.explanation}</li>)}</ul>
  <p className="text-[10px]">{t('notice')}</p>
 </section>;
};
