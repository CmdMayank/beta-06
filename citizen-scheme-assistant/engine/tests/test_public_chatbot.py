"""Synthetic public clients and policies only; never contacts a provider or DB."""
import os, sys, unittest
from pathlib import Path
from unittest.mock import Mock, patch
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.api.routes.chatbot import router
from app.api.routes.demo import router as demo_router
from app.core.errors import APIError, register_errors
from app.services.chatbot_access import ChatBodyLimitMiddleware, PublicChatLimiter
from app.services.chatbot_service import ChatbotService
from app.services.gemini_service import Generation, Plan

ORIGIN = 'https://citizens.example'
RECORD = dict(id='synthetic-only', name='Synthetic Record', description='Synthetic overview.',
    level='central', publication_status='published', is_demo=False,
    sources=[{'original_url':'https://example.gov.in/synthetic','reference_id':'fixture'}],
    required_documents=[{'title':{'text':'Synthetic document'},'requirement':'required'}],
    application_guidance={'steps':[{'text':'Synthetic application step.'}],'url':'https://example.gov.in/synthetic'})


class PublicChatTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.service, self.limiter = ChatbotService(), PublicChatLimiter()
        self.generate = Mock(return_value=Generation(Plan(intent='conversation', dialogue='Hello.')))
        self.detail = Mock(return_value=RECORD)
        for context in [patch.dict(os.environ, SCHEME_APP_ENV='production',
                SCHEME_CHATBOT_PUBLIC_ENABLED='1', SCHEME_DEMO_ENABLED='0', CORS_ORIGINS=ORIGIN),
            patch('app.api.routes.chatbot.chatbot_service', self.service),
            patch('app.services.chatbot_access.public_chat_limiter', self.limiter),
            patch('app.services.chatbot_service.gemini_service.generate_plan', self.generate),
            patch('app.services.chatbot_service.scheme_retrieval_service.records', return_value=[RECORD]),
            patch('app.services.chatbot_service.scheme_retrieval_service.detail', self.detail),
            patch('psycopg.connect', side_effect=AssertionError('No live database access'))]:
            context.start(); self.addCleanup(context.stop)
        self.app = FastAPI(); register_errors(self.app)
        self.app.add_middleware(ChatBodyLimitMiddleware)
        self.app.add_middleware(CORSMiddleware, allow_origins=[ORIGIN],
            allow_methods=['GET','POST','DELETE'], allow_headers=['Content-Type','X-Conversation-Token'])
        self.app.include_router(router); self.app.include_router(demo_router)
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=self.app,
            client=('203.0.113.12', 1234)), base_url='https://api.example')
        self.addAsyncCleanup(self.client.aclose)

    async def send(self, **body):
        return await self.client.post('/api/v1/chatbot/message',
            headers={'Origin': ORIGIN}, json={'message':'hello', 'language':'en'} | body)

    async def test_public_english_hindi_and_cors(self):
        for language in ('en','hi'):
            r = await self.send(language=language)
            self.assertEqual(r.status_code,200)
            self.assertEqual(r.json()['language'],language)
            self.assertEqual(r.headers['access-control-allow-origin'],ORIGIN)
            self.assertEqual(r.headers['cache-control'],'no-store')
        self.assertEqual((await self.client.get('/api/v1/chatbot/status')).status_code,200)

    async def test_origin_missing_unapproved_or_localhost_cannot_spend_provider_budget(self):
        for origin in (None,'https://attacker.example','http://localhost:5175'):
            headers={'Origin':origin} if origin else {}
            r=await self.client.post('/api/v1/chatbot/message',headers=headers,json={'message':'hello'})
            self.assertEqual(r.status_code,403)
        self.generate.assert_not_called()

    async def test_public_is_explicit_and_drafts_stay_unavailable(self):
        with patch.dict(os.environ,SCHEME_CHATBOT_PUBLIC_ENABLED='0'):
            self.assertEqual((await self.send()).status_code,404)
        self.assertEqual((await self.client.get('/api/v1/demo/schemes')).status_code,404)
        self.generate.assert_not_called()

    async def test_capability_is_required_across_public_clients(self):
        first=(await self.send()).json(); path='/api/v1/chatbot/conversations/'+first['conversation_id']
        self.assertEqual((await self.client.get(path)).status_code,404)
        r=await self.client.get(path,headers=[(b'x-conversation-token', b'\xe9')])
        self.assertEqual(r.status_code,404)
        r=await self.client.get(path,headers={'X-Conversation-Token':first['conversation_token']})
        self.assertEqual(r.status_code,200)
        self.assertEqual((await self.client.delete(path,headers={'X-Conversation-Token':first['conversation_token']})).status_code,200)

    async def test_rate_limit_and_spoofed_forwarded_ip(self):
        self.limiter.PAID_PER_MINUTE=2
        self.assertEqual((await self.send()).status_code,200)
        self.assertEqual((await self.send()).status_code,200)
        r=await self.client.post('/api/v1/chatbot/message',headers={'Origin':ORIGIN,
            'X-Forwarded-For':'198.51.100.99'},json={'message':'hello'})
        self.assertEqual(r.status_code,429)
        self.assertEqual(r.headers['retry-after'],'60')
        self.assertEqual(r.headers['cache-control'],'no-store')
        self.assertEqual(self.generate.call_count,2)

    async def test_length_and_chunked_body_limits_precede_provider(self):
        r=await self.client.post('/api/v1/chatbot/message',headers={'Origin':ORIGIN},content=b'x'*17000)
        self.assertEqual(r.status_code,413)
        async def chunks():
            yield b'{"message":"'
            yield b'x'*17000
            yield b'"}'
        r=await self.client.post('/api/v1/chatbot/message',headers={'Origin':ORIGIN,
            'Content-Type':'application/json'},content=chunks())
        self.assertEqual(r.status_code,413)
        self.generate.assert_not_called()

    async def test_published_documents_use_detail_and_preserve_evidence(self):
        self.generate.return_value=Generation(Plan(intent='documents',scheme_ids=['synthetic-only']))
        r=await self.send(message='Which documents for Synthetic Record?')
        self.assertEqual(r.status_code,200)
        self.detail.assert_called_once_with('synthetic-only','en',False)
        self.assertEqual(r.json()['missing_documents'][0]['document_name'],'Synthetic document')
        self.assertEqual(r.json()['sources'][0]['original_url'],'https://example.gov.in/synthetic')
        self.assertIsNone(r.json()['eligibility'])

    async def test_removed_published_record_cannot_fall_back_to_summary(self):
        self.detail.return_value=None
        self.generate.return_value=Generation(Plan(intent='overview',scheme_ids=['synthetic-only']))
        r=await self.send(message='Tell me about Synthetic Record')
        self.assertEqual(r.status_code,200)
        self.assertEqual(r.json()['schemes'],[])
        self.assertIsNone(r.json()['eligibility'])

    async def test_voice_fallback_is_public_but_uses_same_budget(self):
        with patch('app.api.routes.chatbot.elevenlabs_service.synthesize_speech',return_value=(None,'Synthetic voice')):
            r=await self.client.post('/api/v1/chatbot/voice/tts',headers={'Origin':ORIGIN},
                json={'text':'Synthetic voice','language':'hi'})
        self.assertEqual(r.status_code,200)
        self.assertEqual(r.json()['provider'],'browser_fallback')
        self.assertEqual(len(self.limiter._hour),1)


class BudgetTests(unittest.TestCase):
    def test_global_budget_survives_peer_rotation_and_minute_expiry(self):
        now=[100.0]; limiter=PublicChatLimiter(clock=lambda:now[0]);limiter.GLOBAL_PAID_PER_HOUR=2
        for peer in ('one','two'):
            with limiter.reserve(peer,True): pass
        now[0]+=61
        with self.assertRaises(APIError):
            with limiter.reserve('third',True):pass
        now[0]+=3600
        with limiter.reserve('third',True):pass

    def test_concurrency_releases_on_error_and_peer_table_is_bounded(self):
        limiter=PublicChatLimiter();limiter.MAX_IN_FLIGHT=1;limiter.MAX_PEERS=1
        with limiter.reserve('one',True):
            with self.assertRaises(APIError):
                with limiter.reserve('one',True):pass
        self.assertEqual(limiter._active,0)
        with self.assertRaises(RuntimeError):
            with limiter.reserve('one',True):raise RuntimeError('Synthetic failure')
        self.assertEqual(limiter._active,0)
        with self.assertRaises(APIError):
            with limiter.reserve('new-peer',False):pass
        self.assertTrue(all(isinstance(k,bytes) and len(k)==32 for k in limiter._peers))


if __name__=='__main__':unittest.main()
