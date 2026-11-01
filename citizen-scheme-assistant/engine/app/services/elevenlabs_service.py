"""Server-only ElevenLabs speech; no audio persistence, cache or exception logging."""
import json
import re
import urllib.request
from app.core.config import elevenlabs_api_key,elevenlabs_model_id,elevenlabs_voice_id

class ElevenLabsService:
    def is_configured(self): return bool(elevenlabs_api_key() and elevenlabs_voice_id())
    def get_status(self):
        return dict(configured=self.is_configured(),provider='elevenlabs',voice_id=elevenlabs_voice_id(),
            model_id=elevenlabs_model_id(),gender='configured_voice',persona='Sahayak',languages_supported=['en','hi'])
    def sanitize_for_speech(self,text,lang='en'):
        text=re.sub(r'https?://\S+','',text)
        return re.sub(r'[*#_\x00-\x08]', '',text).strip()[:2500]
    def synthesize_speech(self,text,lang='en',voice_id=None):
        text=self.sanitize_for_speech(text,lang)
        configured_voice=elevenlabs_voice_id()
        if not text or not self.is_configured(): return None,text
        # Browser may not choose arbitrary vendor resources charged to this key.
        if voice_id and voice_id!=configured_voice: return None,text
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,80}',configured_voice): return None,text
        payload=json.dumps(dict(text=text,model_id=elevenlabs_model_id())).encode()
        request=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+configured_voice,
            data=payload,method='POST',headers={'xi-api-key':elevenlabs_api_key(),
                'Content-Type':'application/json','Accept':'audio/mpeg'})
        try:
            with urllib.request.urlopen(request,timeout=12) as response:
                audio=response.read(4_000_001)
                if response.status==200 and response.headers.get('Content-Type','').startswith('audio/') and 200<len(audio)<=4_000_000:
                    return audio,text
        except Exception: pass
        return None,text

elevenlabs_service=ElevenLabsService()
