"""Synthetic chatbot tests; no vendor calls, real credentials or database writes."""
import io,json,os,sys,unittest
from contextlib import redirect_stdout,redirect_stderr
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock,patch
import httpx
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from main import app
from app.services.chatbot_service import ChatbotService
from app.services.gemini_service import GeminiService,Generation,Plan
from app.services.elevenlabs_service import ElevenLabsService
from app.services.scheme_retrieval_service import scheme_retrieval_service
from app.schemas.chatbot import ChatMessageRequest

RECORD=dict(id='synthetic-only',name='Synthetic Record',description='Synthetic description only.',
    level='central',is_demo=True,publication_status='draft',verification_status='UNVERIFIED',
    screening_available=True,benefits=[dict(description={'text':'Synthetic benefit from fixture.'})],
    required_documents=[dict(title={'text':'Synthetic document'},requirement='conditional')],
    application_guidance=dict(steps=[{'text':'Synthetic application step.'}],url='https://example.gov.in/fixture'),
    sources=[dict(reference_id='fixture',original_url='https://example.gov.in/fixture',title='Synthetic source')])

class ChatbotTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.service=ChatbotService()
        self.generation=Mock(return_value=Generation(None,'not_configured'))
        for context in [patch.dict(os.environ,SCHEME_APP_ENV='development',SCHEME_DEMO_ENABLED='1',GEMINI_API_KEY='',ELEVENLABS_API_KEY=''),
            patch('app.api.routes.chatbot.chatbot_service',self.service),
            patch('app.services.chatbot_service.scheme_retrieval_service.records',return_value=[RECORD]),
            patch('app.services.chatbot_service.gemini_service.generate_plan',self.generation),
            patch('psycopg.connect',side_effect=AssertionError('No live database'))]:
            context.start();self.addCleanup(context.stop)
        self.client=httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://127.0.0.1')
        self.addAsyncCleanup(self.client.aclose)

    async def send(self,message,prior=None,**extra):
        body=dict(message=message,language='en') | extra
        if prior:body.update(conversation_id=prior['conversation_id'],conversation_token=prior['conversation_token'])
        response=await self.client.post('/api/v1/chatbot/message',json=body)
        self.assertEqual(response.status_code,200,response.text)
        self.assertEqual(response.headers['cache-control'],'no-store')
        return response.json()

    async def test_status_openapi_language_and_private_errors(self):
        status=await self.client.get('/api/v1/chatbot/status')
        self.assertFalse(status.json()['gemini_configured'])
        self.assertIn('/api/v1/chatbot/message',app.openapi()['paths'])
        hi=await self.client.get('/api/v1/chatbot/suggested-questions?lang=hi')
        self.assertEqual(hi.json()['language'],'hi')
        bad=await self.client.post('/api/v1/chatbot/message',json={'message':'private-value','language':'xx'})
        self.assertEqual(bad.status_code,422);self.assertNotIn('private-value',bad.text)
        self.assertEqual(bad.headers['cache-control'],'no-store')

    async def test_offline_mode_is_explicit_and_remembers_only_current_conversation(self):
        first=await self.send('My name is Test Citizen.')
        second=await self.send('What is my name?',first)
        self.assertEqual(second['provider'],'local_guidance')
        self.assertEqual(second['degradation_reason'],'not_configured')
        self.assertIn('Test Citizen',second['message'])
        separate=await self.send('What is my name?')
        self.assertNotIn('Test Citizen',separate['message'])
        history=self.generation.call_args_list[1].args[1]
        self.assertEqual([m['role'] for m in history],['user','assistant'])
        self.assertEqual(history[0]['content'],'My name is Test Citizen.')

    async def test_history_requires_capability_and_reset_removes_it(self):
        first=await self.send('hello');path='/api/v1/chatbot/conversations/'+first['conversation_id']
        self.assertEqual((await self.client.get(path)).status_code,404)
        wrong={'X-Conversation-Token':'0'*64}
        self.assertEqual((await self.client.get(path,headers=wrong)).status_code,404)
        headers={'X-Conversation-Token':first['conversation_token']}
        self.assertEqual((await self.client.get(path,headers=headers)).json()['total_messages'],2)
        self.assertEqual((await self.client.delete(path,headers=headers)).status_code,200)
        self.assertEqual((await self.client.get(path,headers=headers)).status_code,404)

    async def test_grounded_multiturn_documents_and_application(self):
        first=await self.send('Tell me about Synthetic Record')
        self.assertEqual(first['schemes'][0]['scheme_id'],'synthetic-only')
        second=await self.send('Which documents?',first)
        self.assertEqual(second['missing_documents'][0]['document_name'],'Synthetic document')
        self.assertEqual(second['missing_documents'][0]['status'],'NEEDS_VERIFICATION')
        third=await self.send('How do I apply?',second)
        self.assertEqual(third['application_guidance']['steps'],['Synthetic application step.'])
        self.assertIsNone(third['application_guidance']['mode'])
        self.assertEqual(third['schemes'][0]['verification_status'],'UNVERIFIED')

    async def test_gemini_cannot_supply_scheme_facts_urls_or_eligibility(self):
        self.generation.return_value=Generation(Plan(intent='overview',scheme_ids=['synthetic-only'],
            dialogue='You are eligible for 999999 rupees at https://evil.invalid'))
        result=await self.send('Tell me about Synthetic Record')
        self.assertNotIn('999999',result['message']);self.assertNotIn('evil.invalid',json.dumps(result))
        self.assertIsNone(result['eligibility'])
        self.generation.return_value=Generation(Plan(intent='conversation',dialogue='You qualify for 999999 rupees.'))
        result=await self.send('Am I eligible for Synthetic Record?')
        self.assertNotIn('999999',result['message'])

    async def test_profile_cannot_create_an_eligibility_decision(self):
        result=await self.send('Am I eligible for Synthetic Record?',profile={'age':30,'annual_income':0})
        self.assertEqual(result['eligibility']['status'],'INSUFFICIENT_INFO')
        self.assertIsNone(result['eligibility']['confidence_score'])
        self.assertTrue(result['screening_url'].startswith('/screening?scheme_id='))
        state={'scheme_id':'synthetic-only','language':'en','answers':{},'policy_fingerprint':'0'*64}
        with patch('app.eligibility.preliminary.render',return_value=dict(evaluation=dict(status='NEEDS_VERIFICATION',
                explanation='Synthetic engine result',evaluated_conditions=[]))) as engine:
            result=await self.send('Check screening',questionnaire_state=state)
            self.assertEqual(result['eligibility']['status'],'NEEDS_VERIFICATION')
            engine.assert_called_once()

    async def test_unknown_scheme_never_gets_a_fabricated_card(self):
        result=await self.send('Find XYZ unknown scholarship')
        self.assertEqual(result['schemes'],[])
        self.assertIsNone(result['eligibility'])

    async def test_hindi_hinglish_and_language_change_keep_history(self):
        first=await self.send('Mera naam Test User hai')
        second=await self.send('मेरा नाम क्या है?',first,language='hi')
        self.assertIn('Test User',second['message']);self.assertEqual(second['language'],'hi')
        self.assertTrue(self.generation.call_args.args[1])

    async def test_ttl_bounded_history_and_no_logging_or_persistence(self):
        with patch.object(Path,'write_text',side_effect=AssertionError('No persistence')), redirect_stdout(io.StringIO()) as output:
            first=None
            for i in range(8): first=await self.send('hello',first)
            self.assertEqual(len(self.service.get_conversation_history(first['conversation_id'],first['conversation_token'])),12)
        self.assertEqual(output.getvalue(),'')
        self.service._conversations[first['conversation_id']]['updated']-=1000
        response=await self.client.get('/api/v1/chatbot/conversations/'+first['conversation_id'],
            headers={'X-Conversation-Token':first['conversation_token']})
        self.assertEqual(response.status_code,404)

    async def test_remote_clients_are_rejected_without_provider_calls(self):
        self.generation.reset_mock()
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app,client=('203.0.113.1',123)),base_url='http://localhost') as client:
            response=await client.post('/api/v1/chatbot/message',json={'message':'hello'})
        self.assertEqual(response.status_code,404);self.generation.assert_not_called()

    async def test_voice_json_fallback_and_audio_are_never_publicly_cached(self):
        fallback=await self.client.post('/api/v1/chatbot/voice/tts',json={'text':'Synthetic response','language':'hi'})
        self.assertEqual(fallback.json()['provider'],'browser_fallback')
        self.assertEqual(fallback.headers['cache-control'],'no-store')
        with patch('app.api.routes.chatbot.elevenlabs_service.synthesize_speech',return_value=(b'x'*300,'Synthetic response')):
            audio=await self.client.post('/api/v1/chatbot/voice/tts',json={'text':'Synthetic response'})
            self.assertTrue(audio.headers['content-type'].startswith('audio/'))
            self.assertEqual(audio.headers['cache-control'],'no-store')

    async def test_cors_allows_isolated_origin_and_reset_header(self):
        response=await self.client.options('/api/v1/chatbot/conversations/synthetic-only',
            headers={'Origin':'http://localhost:5175','Access-Control-Request-Method':'DELETE',
                     'Access-Control-Request-Headers':'x-conversation-token'})
        self.assertEqual(response.status_code,200)

class GeminiProviderTests(unittest.TestCase):
    def test_missing_key_does_not_attempt_a_vendor_call(self):
        service=GeminiService()
        with patch('app.services.gemini_service.gemini_api_key',return_value=''),patch.object(service,'_get_client') as client:
            self.assertFalse(service.is_configured())
            self.assertEqual(service.generate_plan('hello',[],[],'en').reason,'not_configured')
            client.assert_not_called()

    def test_configured_model_and_every_history_turn_reach_sdk(self):
        service=GeminiService();client=Mock()
        client.models.generate_content.return_value=SimpleNamespace(text=json.dumps(dict(intent='conversation',dialogue='Hello')))
        with patch('app.services.gemini_service.gemini_api_key',return_value='synthetic-key'),patch.object(service,'_get_client',return_value=client):
            result=service.generate_plan('What is my name?',[dict(role='user',content='My name is Test'),
                dict(role='assistant',content='Noted')],[RECORD],'en')
        self.assertIsNotNone(result.plan)
        args=client.models.generate_content.call_args.kwargs
        self.assertEqual(args['model'],service.model_name)
        self.assertEqual([m.role for m in args['contents']],['user','model','user'])
        self.assertIn('My name is Test',args['contents'][0].parts[0].text)
        client.close.assert_called_once()

    def test_quota_failure_is_sanitized_and_circuit_breaker_prevents_retry_storm(self):
        service=GeminiService();client=Mock();failure=RuntimeError('private-key private-user-message');failure.code=429
        client.models.generate_content.side_effect=failure
        with patch('app.services.gemini_service.gemini_api_key',return_value='synthetic-key'),patch.object(service,'_get_client',return_value=client),redirect_stdout(io.StringIO()) as out,redirect_stderr(io.StringIO()) as err:
            first=service.generate_plan('Synthetic input',[],[],'hi')
            second=service.generate_plan('Synthetic input',[],[],'hi')
        self.assertEqual(first.reason,'quota_exceeded');self.assertEqual(second.reason,'temporarily_unavailable')
        self.assertEqual(out.getvalue()+err.getvalue(),'')
        self.assertEqual(client.models.generate_content.call_count,1)

    def test_unknown_model_scheme_id_is_rejected(self):
        service=GeminiService();client=Mock()
        client.models.generate_content.return_value=SimpleNamespace(text=json.dumps(dict(intent='overview',scheme_ids=['invented-scheme'])))
        with patch('app.services.gemini_service.gemini_api_key',return_value='synthetic-key'),patch.object(service,'_get_client',return_value=client):
            self.assertEqual(service.generate_plan('hello',[],[RECORD],'en').reason,'invalid_grounding')

class RetrievalTests(unittest.TestCase):
    def test_short_aliases_are_not_substrings_and_missing_titles_do_not_match_everything(self):
        records=[dict(id='in-cen-000007',name='Atal Pension Yojana'),dict(id='synthetic-only',name=None)]
        self.assertEqual(scheme_retrieval_service.matching_ids('therapy',records),[])
        self.assertEqual(scheme_retrieval_service.matching_ids('APY eligibility',records),['in-cen-000007'])
        self.assertEqual(scheme_retrieval_service.matching_ids('पीएम-किसान के बारे में बताएं',[dict(id='in-cen-000006',name='PM-KISAN')]),['in-cen-000006'])

class ElevenLabsTests(unittest.TestCase):
    def test_unconfigured_or_arbitrary_voice_never_calls_vendor(self):
        service=ElevenLabsService()
        with patch('app.services.elevenlabs_service.elevenlabs_api_key',return_value=''),patch('urllib.request.urlopen') as call:
            self.assertFalse(service.is_configured())
            self.assertIsNone(service.synthesize_speech('Synthetic text')[0]);call.assert_not_called()
        with patch('app.services.elevenlabs_service.elevenlabs_api_key',return_value='synthetic-key'),patch('app.services.elevenlabs_service.elevenlabs_voice_id',return_value='configuredVoice'),patch('urllib.request.urlopen') as call:
            self.assertIsNone(service.synthesize_speech('Synthetic text',voice_id='otherVoice')[0]);call.assert_not_called()

if __name__=='__main__':unittest.main()
