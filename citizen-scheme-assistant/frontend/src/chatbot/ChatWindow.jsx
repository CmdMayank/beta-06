import React,{useState,useEffect,useRef} from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { VoiceAssistantView } from './VoiceAssistantView';
import { chatbotApi } from '../services/chatbotApi';
import { createVoiceController } from './voice';
import { chatText } from './i18n';

export const ChatWindow=({open=true,onClose})=>{
 const {language:siteLanguage}=useLanguage();
 const [language,setLanguage]=useState(siteLanguage||'en');
 const [messages,setMessages]=useState([]),[text,setText]=useState(''),[busy,setBusy]=useState(false);
 const [error,setError]=useState(''),[status,setStatus]=useState('basic'),[voiceState,setVoiceState]=useState('idle');
 const [suggestions,setSuggestions]=useState([]);
 const conversation=useRef({id:null,token:null});const current=useRef(null);const version=useRef(0);
 const voice=useRef(null),end=useRef(null),inputRegion=useRef(null);
 const t=key=>chatText(language,key);
 useEffect(()=>{setLanguage(siteLanguage||'en');},[siteLanguage]);
 useEffect(()=>{
  voice.current=createVoiceController(chatbotApi,{onState:setVoiceState,onText:setText,onError:setError});
  return ()=>{version.current++;current.current?.abort();voice.current?.dispose();};
 },[]);
 useEffect(()=>{
  if(!open){voice.current?.cancel();return;}
  const request=new AbortController();
  chatbotApi.getStatus(request.signal).then(value=>setStatus(value.gemini_configured?'configured':'basic')).catch(()=>{if(!request.signal.aborted)setStatus('offline');});
  return ()=>request.abort();
 },[open]);
 useEffect(()=>{
  if(!open)return;
  const request=new AbortController();
  chatbotApi.getSuggestedQuestions(language,request.signal).then(setSuggestions).catch(()=>{if(!request.signal.aborted)setSuggestions([]);});
  return ()=>request.abort();
 },[language,open]);
 useEffect(()=>{if(open)end.current?.scrollIntoView({behavior:'smooth',block:'nearest'});},[messages,busy,open]);
 function cancel(){version.current++;current.current?.abort();current.current=null;setBusy(false);voice.current?.cancel();setError('cancelled');}
 async function send(value){
  const message=value.trim();if(!message||current.current)return;
  voice.current?.cancel();setError('');setText('');
  const ticket=++version.current,controller=new AbortController();current.current=controller;setBusy(true);
  setMessages(previous=>[...previous,{role:'user',content:message,language}].slice(-24));
  try{
   const reply=await chatbotApi.sendMessage({message,conversationId:conversation.current.id,
    conversationToken:conversation.current.token,language,signal:controller.signal});
   if(ticket!==version.current)return;
   conversation.current={id:reply.conversation_id,token:reply.conversation_token};
   setStatus(reply.provider==='gemini'?'ai':'basic');
   setMessages(previous=>[...previous,{role:'assistant',content:reply.message,language:reply.language,schemes:reply.schemes,eligibility:reply.eligibility,missing_documents:reply.missing_documents,application_guidance:reply.application_guidance,sources:reply.sources,screening_url:reply.screening_url}].slice(-24));
   setSuggestions(reply.suggested_followups||[]);
  }catch(problem){
   if(ticket===version.current)setError(problem.code==='CHATBOT_RATE_LIMITED'?'rateLimited':problem.code==='CHATBOT_ORIGIN_DENIED'?'originDenied':problem.code==='CONVERSATION_UNAVAILABLE'?'expired':problem.name==='AbortError'?'cancelled':'serverError');
  }finally{if(ticket===version.current){current.current=null;setBusy(false);}}
 }
 function reset(){
  cancel();const old=conversation.current;conversation.current={id:null,token:null};
  setMessages([]);setText('');setError('');
  chatbotApi.clearConversation(old.id,old.token).catch(()=>{});
 }
 function microphone(){
  setError('');
  if(voiceState==='listening'||voiceState==='requesting')voice.current?.cancel();
  else voice.current?.listen(language);
 }
 return <section id="sahayak-chat" role="dialog" aria-modal="false" aria-labelledby="sahayak-title" hidden={!open}
  onKeyDown={e=>{if(e.key==='Escape'){voice.current?.cancel();onClose();}}}
  className={open?'flex h-[min(650px,calc(100dvh-110px))] w-[min(420px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-2xl':'hidden'}>
  <ChatHeader language={language} onLanguage={value=>{voice.current?.cancel();setLanguage(value);}} onReset={reset} onClose={onClose} status={status}/>
  <p className="border-b border-slate-100 px-4 py-2 text-[10px] text-slate-600">{t('notice')}</p>
  {error&&<div role="alert" className="flex justify-between gap-2 bg-amber-50 px-4 py-2 text-xs text-amber-900">
   <span>{t(error)}</span><button aria-label={t('clearError')} onClick={()=>setError('')}>×</button></div>}
  <div aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
   {!messages.length&&<p className="rounded-2xl bg-slate-100 p-3 text-sm leading-relaxed text-slate-800">{t('welcome')}</p>}
   {messages.map((message,index)=><ChatMessage key={index} message={message} language={language}
      onRead={()=>{setError('');voice.current?.speak(message.content,message.language||language);}}/>)}
   {busy&&<p role="status" className="animate-pulse text-sm text-slate-500">{t('loading')}</p>}<div ref={end}/>
  </div>
  {!busy&&suggestions.length>0&&<div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-3 py-2">
   {suggestions.map(suggestion=><button type="button" key={suggestion} onClick={()=>send(suggestion)}
    className="shrink-0 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs text-orange-900">{suggestion}</button>)}
  </div>}
  <VoiceAssistantView language={language} state={voiceState} onStop={()=>voice.current?.cancel()}/>
  <div ref={inputRegion}><ChatInput language={language} text={text} onText={setText} onSend={send} disabled={busy}
    onMic={microphone} listening={voiceState==='listening'||voiceState==='requesting'} onCancel={cancel}/></div>
 </section>;
};
