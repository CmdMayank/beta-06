import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createVoiceController} from '../src/chatbot/voice.js';
import {chatText} from '../src/chatbot/i18n.js';

function fixture(api={getSpeechAudio:async()=>({blob:null,text:'Synthetic response'})}) {
 const states=[],errors=[],texts=[],spoken=[],revoked=[];let rec;
 class Recognition {constructor(){rec=this;}start(){this.onstart?.();}abort(){this.aborted=true;}}
 class Utterance {constructor(text){this.text=text;}}
 class Audio {constructor(url){this.url=url;}async play(){}pause(){this.paused=true;}}
 const env={SpeechRecognition:Recognition,SpeechSynthesisUtterance:Utterance,Audio,
  speechSynthesis:{cancel(){},getVoices:()=>[],speak(value){spoken.push(value);}},
  URL:{createObjectURL:()=> 'blob:synthetic',revokeObjectURL:value=>revoked.push(value)}};
 const controller=createVoiceController(api,{onState:s=>states.push(s),onText:s=>texts.push(s),onError:s=>errors.push(s)},env);
 return {controller,states,errors,texts,spoken,revoked,env,rec:()=>rec};
}
test('English/Hindi speech enters editable input and never automatically sends',()=>{
 const f=fixture();f.controller.listen('hi');assert.equal(f.rec().lang,'hi-IN');
 f.rec().onresult({results:[Object.assign([{transcript:'परीक्षण संदेश'}],{isFinal:true})]});
 assert.deepEqual(f.texts,['परीक्षण संदेश']);assert.equal(f.states.at(-1),'confirm');assert.equal(f.rec().aborted,true);
 f.controller.dispose();
});
test('permission denial and unsupported browsers return a useful idle fallback',()=>{
 const f=fixture();f.controller.listen('en');f.rec().onerror({error:'not-allowed'});
 assert.equal(f.errors.at(-1),'denied');assert.equal(f.states.at(-1),'idle');
 delete f.env.SpeechRecognition;f.controller.listen('en');assert.equal(f.errors.at(-1),'unsupported');f.controller.dispose();
});
test('browser synthesis completes and uses requested Hindi language',async()=>{
 const f=fixture();await f.controller.speak('परीक्षण','hi');
 assert.equal(f.spoken[0].lang,'hi-IN');assert.equal(f.states.at(-1),'speaking');
 f.spoken[0].onend();assert.equal(f.states.at(-1),'idle');f.controller.dispose();
});
test('audio URL is revoked when playback completes or is cancelled',async()=>{
 const f=fixture({getSpeechAudio:async()=>({blob:new Blob(['synthetic']),text:'Synthetic'})});
 let playing;f.env.Audio=class {constructor(){playing=this;}async play(){}pause(){}};
 await f.controller.speak('Synthetic','en');playing.onended();assert.deepEqual(f.revoked,['blob:synthetic']);
 await f.controller.speak('Synthetic','en');f.controller.cancel();assert.equal(f.revoked.length,2);f.controller.dispose();
});
test('late audio after cancellation never starts playback',async()=>{
 let finish;const f=fixture({getSpeechAudio:()=>new Promise(resolve=>finish=resolve)});
 const promise=f.controller.speak('Synthetic','en');f.controller.cancel();finish({blob:new Blob(['synthetic'])});
 await promise;assert.equal(f.spoken.length,0);assert.equal(f.states.at(-1),'idle');f.controller.dispose();
});
test('unavailable speech synthesis clears loading rather than getting stuck',async()=>{
 const f=fixture();delete f.env.speechSynthesis;await f.controller.speak('Synthetic','en');
 assert.equal(f.errors.at(-1),'ttsUnsupported');assert.equal(f.states.at(-1),'idle');f.controller.dispose();
});
test('all voice error/control labels support both languages',()=>{
 for(const key of ['denied','unsupported','noSpeech','speechError','audioError','ttsUnsupported','read','stopAudio','confirm']){
  assert.ok(chatText('en',key));assert.match(chatText('hi',key),/[\u0900-\u097f]/);
 }
});
