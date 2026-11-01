import { API_BASE_URL as base } from './apiConfig.js';
const prefix=base+'/api/v1/chatbot';
async function request(path,{signal,timeout=20000,...options}={}) {
  const controller=new AbortController();
  const abort=()=>controller.abort();
  if(signal?.aborted)abort(); else signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(abort,timeout);
  try {
    const response=await fetch(prefix+path,{...options,signal:controller.signal,
      cache:'no-store',headers:{...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});
    if(!response.ok) {
      const data=await response.json().catch(()=>({}));
      const error=new Error('CHATBOT_REQUEST_FAILED');error.code=data.error?.code||'CHATBOT_REQUEST_FAILED';throw error;
    }
    return response;
  } finally {clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
export const chatbotApi={
  getStatus:async signal=>(await request('/status',{signal})).json(),
  getSuggestedQuestions:async(language='en',signal)=>(await (await request('/suggested-questions?lang='+encodeURIComponent(language),{signal})).json()).questions,
  sendMessage:async({message,conversationId=null,conversationToken=null,language='en',signal})=>
    (await request('/message',{method:'POST',signal,body:JSON.stringify({message,conversation_id:conversationId,
      conversation_token:conversationToken,language})})).json(),
  clearConversation:async(id,token,signal)=>{
    if(!id||!token)return;
    return (await request('/conversations/'+encodeURIComponent(id),{method:'DELETE',signal,
      headers:{'X-Conversation-Token':token}})).json();
  },
  async getSpeechAudio(text,language='en',signal) {
    const response=await request('/voice/tts',{method:'POST',signal,timeout:15000,
      body:JSON.stringify({text:text.slice(0,2500),language})});
    if((response.headers.get('content-type')||'').startsWith('audio/'))return {blob:await response.blob(),text,provider:'elevenlabs'};
    const fallback=await response.json();
    return {blob:null,text:fallback.sanitized_text||text,provider:'browser_fallback'};
  },
};
