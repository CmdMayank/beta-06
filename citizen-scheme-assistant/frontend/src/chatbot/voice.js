// Explicit user gestures only. No transcripts, audio or tokens are persisted.
export function createVoiceController(api,{onState=()=>{},onText=()=>{},onError=()=>{}}={},env=window) {
  let recognition=null,audio=null,url=null,fetcher=null,timer=null,audioTimer=null,serial=0,disposed=false;
  const state=value=>{if(!disposed)onState(value);};
  function stopRecognition() {
    clearTimeout(timer);timer=null;
    const previous=recognition;recognition=null;
    if(previous){previous.onresult=previous.onerror=previous.onend=previous.onstart=null;try{previous.abort();}catch{}}
  }
  function stopAudio() {
    serial++;clearTimeout(audioTimer);audioTimer=null;fetcher?.abort();fetcher=null;
    if(audio){audio.onended=audio.onerror=null;audio.pause();audio=null;}
    if(url){env.URL.revokeObjectURL(url);url=null;}
    env.speechSynthesis?.cancel();state('idle');
  }
  function cancel(){stopRecognition();stopAudio();}
  function listen(language) {
    cancel();
    const SpeechRecognition=env.SpeechRecognition||env.webkitSpeechRecognition;
    if(!SpeechRecognition){onError('unsupported');return;}
    const rec=new SpeechRecognition();recognition=rec;
    rec.lang=language==='hi'?'hi-IN':'en-IN';rec.interimResults=true;rec.continuous=false;
    state('requesting');
    rec.onstart=()=>{if(recognition===rec)state('listening');};
    rec.onresult=event=>{
      if(recognition!==rec||disposed)return;
      let text='',final=false;
      for(let i=0;i<event.results.length;i++){text+=event.results[i][0].transcript;final||=event.results[i].isFinal;}
      onText(text);
      if(final){stopRecognition();state('confirm');}
    };
    rec.onerror=event=>{
      if(recognition!==rec)return;
      const key=['not-allowed','service-not-allowed'].includes(event.error)?'denied':event.error==='no-speech'?'noSpeech':'speechError';
      stopRecognition();state('idle');onError(key);
    };
    rec.onend=()=>{if(recognition===rec){stopRecognition();state('idle');}};
    timer=setTimeout(()=>{if(recognition===rec){stopRecognition();state('idle');onError('noSpeech');}},20000);
    try{rec.start();}catch{stopRecognition();state('idle');onError('speechError');}
  }
  function browserSpeak(text,language,turn) {
    if(disposed||turn!==serial)return;
    if(!env.speechSynthesis||!env.SpeechSynthesisUtterance){state('idle');onError('ttsUnsupported');return;}
    const utterance=new env.SpeechSynthesisUtterance(text);
    utterance.lang=language==='hi'?'hi-IN':'en-IN';utterance.rate=0.95;
    const voices=env.speechSynthesis.getVoices?.()||[];
    const voice=voices.find(v=>v.lang.toLowerCase().startsWith(language));if(voice)utterance.voice=voice;
    utterance.onend=()=>{if(turn===serial){clearTimeout(audioTimer);state('idle');}};
    utterance.onerror=()=>{if(turn===serial){clearTimeout(audioTimer);state('idle');onError('audioError');}};
    state('speaking');
    clearTimeout(audioTimer);audioTimer=setTimeout(()=>{if(turn===serial){stopAudio();onError('audioError');}},90000);
    try{env.speechSynthesis.speak(utterance);}catch{state('idle');onError('audioError');}
  }
  async function speak(text,language) {
    cancel();const turn=serial;fetcher=new AbortController();state('audioLoading');
    let result;
    try{result=await api.getSpeechAudio(text,language,fetcher.signal);}
    catch(error){if(disposed||turn!==serial)return;result={blob:null,text};}
    if(disposed||turn!==serial)return;
    fetcher=null;
    if(!result.blob){browserSpeak(result.text||text,language,turn);return;}
    url=env.URL.createObjectURL(result.blob);audio=new env.Audio(url);
    const clean=()=>{clearTimeout(audioTimer);if(audio){audio.onended=audio.onerror=null;audio=null;}if(url){env.URL.revokeObjectURL(url);url=null;}};
    audio.onended=()=>{if(turn===serial){clean();state('idle');}};
    let fallbackStarted=false;
    const fallback=()=>{if(turn===serial&&!fallbackStarted){fallbackStarted=true;clean();browserSpeak(text,language,turn);}};
    audio.onerror=fallback;
    audioTimer=setTimeout(()=>{if(turn===serial){stopAudio();onError('audioError');}},90000);
    try{state('speaking');await audio.play();}
    catch{fallback();}
  }
  return {listen,speak,cancel,stopAudio,stopRecognition,
    supported:()=>Boolean(env.SpeechRecognition||env.webkitSpeechRecognition),
    dispose(){cancel();disposed=true;}};
}
