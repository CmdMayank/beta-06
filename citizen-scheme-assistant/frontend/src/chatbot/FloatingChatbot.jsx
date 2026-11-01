import React,{useState} from 'react';
import { Bot,X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { useLanguage } from '../i18n/LanguageContext';
import { chatText } from './i18n';
export const FloatingChatbot=()=>{
 const [open,setOpen]=useState(false);const {language}=useLanguage();
 return <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
  <ChatWindow open={open} onClose={()=>setOpen(false)}/>
  <button type="button" onClick={()=>setOpen(value=>!value)} aria-expanded={open} aria-controls="sahayak-chat"
   aria-label={chatText(language,open?'close':'open')} title={chatText(language,open?'close':'open')}
   className="mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-xl transition hover:bg-orange-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange-300">
   {open?<X/>:<Bot/>}
  </button>
 </div>;
};
