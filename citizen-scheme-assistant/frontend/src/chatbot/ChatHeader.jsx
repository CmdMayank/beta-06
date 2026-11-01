import React from 'react';
import { Bot,RotateCcw,Minus } from 'lucide-react';
import { chatText } from './i18n';
export const ChatHeader=({language,onLanguage,onReset,onClose,status})=>{
  const t=key=>chatText(language,key);
  return <header className="flex items-center justify-between gap-2 border-b border-orange-100 bg-orange-50 px-4 py-3">
    <div className="flex items-center gap-2"><Bot aria-hidden="true" className="text-orange-600"/><div>
      <h2 id="sahayak-title" className="font-bold text-slate-900">{t('title')}</h2>
      <p className="text-[11px] text-slate-600">{t(status==='ai'?'ai':status==='configured'?'configured':status==='offline'?'offline':'basic')}</p>
    </div></div>
    <div className="flex items-center gap-1">
      <select aria-label={t('language')} value={language} onChange={e=>onLanguage(e.target.value)}
        className="rounded-lg border border-orange-200 bg-white px-1 py-1 text-xs"><option value="en">English</option><option value="hi">हिन्दी</option></select>
      <button type="button" aria-label={t('reset')} title={t('reset')} onClick={onReset} className="rounded-lg p-2 hover:bg-orange-100"><RotateCcw size={17}/></button>
      <button type="button" aria-label={t('close')} title={t('close')} onClick={onClose} className="rounded-lg p-2 hover:bg-orange-100"><Minus size={19}/></button>
    </div>
  </header>;
};
