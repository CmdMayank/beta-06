import React from 'react';
import { Square } from 'lucide-react';
import { chatText } from './i18n';
export const VoiceAssistantView=({language,state,onStop})=>{
 if(state==='idle')return null;
 return <div role="status" className="flex items-center justify-between gap-2 border-t border-orange-100 bg-orange-50 px-4 py-2 text-xs text-orange-900">
  <span>{chatText(language,state)}</span>
  {state!=='confirm'&&<button type="button" aria-label={chatText(language,state==='listening'||state==='requesting'?'stopMic':'stopAudio')} onClick={onStop} className="rounded border border-orange-300 p-1"><Square size={14}/></button>}
 </div>;
};
