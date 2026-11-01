import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveApiBase, API_BASE_URL} from '../src/services/apiConfig.js';
import {ApiClient} from '../src/services/apiClient.js';
import {chatbotApi} from '../src/services/chatbotApi.js';
import {readdirSync} from 'node:fs';
import viteConfig from '../vite.config.js';

test('generated bundles never collide with public artwork directories by case',()=>{
  const publicNames=readdirSync(new URL('../public/',import.meta.url)).map(name=>name.toLowerCase());
  assert.equal(publicNames.includes(viteConfig.build.assetsDir.toLowerCase()),false);
});

test('production defaults to same-origin, never the visitor loopback address',()=>{
  assert.equal(resolveApiBase({PROD:true}), '');
  assert.equal(resolveApiBase({MODE:'production', VITE_API_BASE_URL:'  '}), '');
  assert.equal(resolveApiBase({DEV:true}), 'http://127.0.0.1:8002');
});
test('explicit deployment URL or reverse-proxy path takes precedence',()=>{
  assert.equal(resolveApiBase({PROD:true,VITE_API_BASE_URL:' https://api.example.invalid/ '}),'https://api.example.invalid');
  assert.equal(resolveApiBase({PROD:true,VITE_API_BASE_URL:'/backend/'}),'/backend');
});
test('catalogue and chatbot clients share exactly the same API base',async()=>{
  const previous=globalThis.fetch; const calls=[];
  globalThis.fetch=async url=>{calls.push(url);return Response.json({status:'ok'});};
  try{
    await new ApiClient().checkHealth(); await chatbotApi.getStatus();
    assert.deepEqual(calls,[API_BASE_URL+'/health',API_BASE_URL+'/api/v1/chatbot/status']);
  }finally{globalThis.fetch=previous;}
});
test('already-aborted screening requests remain aborted',async()=>{
  const previous=globalThis.fetch;const controller=new AbortController();controller.abort();
  globalThis.fetch=async (_url,options)=>{
    assert.equal(options.signal.aborted,true);
    throw new DOMException('Aborted','AbortError');
  };
  try{await assert.rejects(new ApiClient().get('/health',{signal:controller.signal}),e=>e.code==='REQUEST_ABORTED');}
  finally{globalThis.fetch=previous;}
});
