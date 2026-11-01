import React from 'react';
import { Send,Mic,Square } from 'lucide-react';
import { chatText } from './i18n';
export const ChatInput=({language,text,onText,onSend,disabled,onMic,listening,onCancel})=>{
 const t=key=>chatText(language,key);
 return <form className="border-t border-slate-200 bg-white p-3" onSubmit={e=>{e.preventDefault();onSend(text);}}>
  <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-2 focus-within:ring-2 focus-within:ring-orange-400">
   <textarea aria-label={t('input')} placeholder={t('placeholder')} value={text} maxLength={2000} rows={2}
    onChange={e=>onText(e.target.value)} disabled={disabled} className="max-h-28 min-w-0 flex-1 resize-y bg-transparent px-1 text-sm text-slate-900 focus:outline-none"
    onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();onSend(text);}}}/>
   <button type="button" aria-label={t(listening?'stopMic':'mic')} title={t(listening?'stopMic':'mic')}
     disabled={disabled} onClick={onMic} className="rounded-xl border border-orange-200 p-2 text-orange-700 disabled:opacity-50">
    {listening?<Square size={18}/>:<Mic size={18}/>}</button>
   {disabled?<button type="button" aria-label={t('stop')} onClick={onCancel} className="rounded-xl bg-slate-900 p-2 text-white"><Square size={18}/></button>
   :<button type="submit" aria-label={t('send')} disabled={!text.trim()} className="rounded-xl bg-orange-600 p-2 text-white disabled:opacity-40"><Send size={18}/></button>}
  </div>
  <p className="mt-1 text-[10px] text-slate-500">{t('voicePrivacy')}</p>
 </form>;
};
