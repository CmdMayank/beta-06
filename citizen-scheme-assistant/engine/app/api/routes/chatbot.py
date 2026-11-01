"""Local chatbot API: capability-isolated RAM conversations and private audio."""
from typing import Annotated
from fastapi import APIRouter,Depends,Header,Query,Request,Response
from fastapi.responses import Response as RawResponse
from app.api.routes.demo import is_local_demo
from app.core.errors import APIError
from app.schemas.chatbot import (ChatMessageRequest,ChatMessageResponse,ConversationHistoryResponse,
    SuggestedQuestionsResponse,VoiceStatusResponse,VoiceTTSRequest)
from app.services.chatbot_service import chatbot_service,WORDS
from app.services.elevenlabs_service import elevenlabs_service
from app.services.gemini_service import gemini_service

def local_chat(request:Request,response:Response):
    response.headers['Cache-Control']='no-store'
    response.headers['Pragma']='no-cache'
    if (not request.client or request.client.host not in ('127.0.0.1','::1','test','testclient')
            or request.url.hostname not in ('127.0.0.1','localhost','::1','test','testserver')):
        raise APIError(404,'CHATBOT_UNAVAILABLE','Chatbot is unavailable.')

router=APIRouter(prefix='/api/v1/chatbot',tags=['Chatbot'],dependencies=[Depends(local_chat)])

@router.post('/message',response_model=ChatMessageResponse)
def send_chat_message(request:ChatMessageRequest,http_request:Request):
    if not request.message.strip():
        raise APIError(422,'INVALID_MESSAGE','Enter a message.')
    return chatbot_service.process_message(request,local_demo=is_local_demo(http_request))

@router.get('/conversations/{conversation_id}',response_model=ConversationHistoryResponse)
def get_conversation(conversation_id:str,x_conversation_token:Annotated[str|None,Header()]=None):
    history=chatbot_service.get_conversation_history(conversation_id,x_conversation_token)
    return dict(conversation_id=conversation_id,total_messages=len(history),messages=history)

@router.delete('/conversations/{conversation_id}')
def delete_conversation(conversation_id:str,x_conversation_token:Annotated[str|None,Header()]=None):
    return dict(success=chatbot_service.clear_conversation(conversation_id,x_conversation_token),deleted=True)

@router.get('/suggested-questions',response_model=SuggestedQuestionsResponse)
def get_suggested_questions(lang:Annotated[str,Query(pattern='^(en|hi)$')]='en'):
    return dict(language=lang,questions=WORDS[lang]['follow'])

@router.get('/status')
def get_chatbot_status():
    return dict(status='online',service='Sahayak AI Assistant',gemini_configured=gemini_service.is_configured(),
        model=gemini_service.model_name,mode='ai' if gemini_service.is_configured() else 'basic_guidance',
        languages_supported=['en','hi'],features=['grounded_catalogue','structured_screening_link','ephemeral_conversation','voice'])

@router.post('/voice/tts')
def synthesize_voice_speech(request:VoiceTTSRequest):
    audio,text=elevenlabs_service.synthesize_speech(request.text,request.language,request.voice_id)
    private={'Cache-Control':'no-store','Pragma':'no-cache'}
    if audio: return RawResponse(content=audio,media_type='audio/mpeg',headers=private)
    from fastapi.responses import JSONResponse
    return JSONResponse(dict(success=False,provider='browser_fallback',message='Use browser speech synthesis.',
        sanitized_text=text,language=request.language),headers=private)

@router.get('/voice/status',response_model=VoiceStatusResponse)
def get_voice_status():
    return elevenlabs_service.get_status()
