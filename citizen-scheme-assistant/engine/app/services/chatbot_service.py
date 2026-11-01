"""Bounded conversation orchestration. Policy facts and decisions are server-owned."""
from datetime import datetime,timezone
from secrets import token_hex,compare_digest
from threading import RLock
from time import monotonic
import re
import uuid

from app.core.errors import APIError
from app.schemas.chatbot import (ChatMessageResponse,SchemeCardData,EligibilityCardData,
    CriterionEvaluationItem,DocumentCheckItem,ApplicationGuidanceData)
from app.services.gemini_service import gemini_service,detect_language,Plan
from app.services.profile_context_service import profile_context_service
from app.services.scheme_retrieval_service import scheme_retrieval_service,display

WORDS={
'en':dict(basic='Basic guidance: live AI is unavailable. ',hello='Hello! What would you like to know about government schemes?',
    ack='I will keep that in this conversation. Which scheme would you like to discuss?',choose='Which scheme would you like to discuss?',missing='The available catalogue does not contain a matching record. Which scheme or area of support do you mean?',
    scope='I can help with government schemes and facts you shared in this conversation.',
    screening='Use the structured screening questions; chat or profile information alone cannot establish eligibility.',
    notice='Preliminary information only, not government approval. The official provider verifies enrolment and benefits.',
    unavailable='This information is unavailable in the current record. Please confirm with the official provider.',
    limited='Local draft catalogue; not publication-approved.',follow=['Show available schemes','Which documents are listed?','How do I apply?']),
'hi':dict(basic='मूल मार्गदर्शन: लाइव एआई उपलब्ध नहीं है। ',hello='नमस्ते! आप सरकारी योजनाओं के बारे में क्या जानना चाहते हैं?',
    ack='मैं यह बात इस बातचीत में याद रखूँगा। किस योजना के बारे में जानना चाहते हैं?',choose='आप किस योजना के बारे में बात करना चाहते हैं?',missing='उपलब्ध सूची में संबंधित अभिलेख नहीं है। किस योजना या सहायता के क्षेत्र के बारे में पूछ रहे हैं?',
    scope='मैं सरकारी योजनाओं और इस बातचीत में आपकी बताई बातों में सहायता कर सकता हूँ।',
    screening='संरचित जाँच के प्रश्नों का उपयोग करें; केवल चैट या प्रोफ़ाइल से पात्रता तय नहीं होती।',
    notice='यह प्रारंभिक जानकारी है, सरकारी स्वीकृति नहीं। आधिकारिक संस्था नामांकन और लाभ की पुष्टि करती है।',
    unavailable='वर्तमान अभिलेख में यह जानकारी उपलब्ध नहीं है। आधिकारिक संस्था से पुष्टि करें।',
    limited='स्थानीय मसौदा सूची; प्रकाशन स्वीकृत नहीं।',follow=['उपलब्ध योजनाएं दिखाएँ','कौन से दस्तावेज़ सूचीबद्ध हैं?','आवेदन कैसे करें?'])}

def safe_url(value):
    from urllib.parse import urlsplit
    if not value: return None
    p=urlsplit(value)
    return value if p.scheme=='https' and p.hostname and not p.username and not p.password else None

class ChatbotService:
    TTL=15*60
    MAX_CONVERSATIONS=100
    def __init__(self):
        self._conversations={}
        self._lock=RLock()

    def _access(self,cid,token):
        c=self._conversations.get(cid)
        if not c or monotonic()-c['updated']>self.TTL or not token or not compare_digest(c['token'],token):
            raise APIError(404,'CONVERSATION_UNAVAILABLE','Conversation unavailable or expired.')
        return c

    def get_conversation_history(self,cid,token=None):
        with self._lock: return list(self._access(cid,token)['history'])

    def clear_conversation(self,cid,token=None):
        with self._lock:
            self._access(cid,token)
            del self._conversations[cid]
        return True

    def _begin(self,request):
        with self._lock:
            now=monotonic()
            for cid in list(self._conversations):
                if now-self._conversations[cid]['updated']>self.TTL: del self._conversations[cid]
            if request.conversation_id:
                cid=request.conversation_id
                c=self._access(cid,request.conversation_token)
            else:
                if len(self._conversations)>=self.MAX_CONVERSATIONS:
                    oldest=min(self._conversations,key=lambda k:self._conversations[k]['updated'])
                    del self._conversations[oldest]
                cid=str(uuid.uuid4())
                c=dict(token=token_hex(32),history=[],last_ids=[],updated=now,busy=False,turns=0)
                self._conversations[cid]=c
            if c['busy']: raise APIError(409,'CONVERSATION_BUSY','Wait for the current response.')
            if c['turns']>=40: raise APIError(429,'CONVERSATION_LIMIT','Start a new conversation.')
            c['busy']=True
            return cid,c,list(c['history'])

    def _offline_plan(self,message,history,records,last_ids):
        q=message.casefold()
        ids=scheme_retrieval_service.matching_ids(message,records)
        if re.fullmatch(r'\s*(hi|hello|hey|namaste|नमस्ते)[!.,\s]*',q):
            return Plan(intent='conversation')
        if re.search(r'(my name|mera naam|मेरा नाम|where do i live|who am i|मैं.*रहत)',q):
            return Plan(intent='conversation')
        intent=('documents' if re.search(r'document|कागज|कागज़|दस्तावेज|kagaz',q) else
                'application' if re.search(r'apply|application|आवेदन|kaise',q) else
                'screening' if re.search(r'eligib|qualify|पात्र|patra',q) else
                'benefits' if re.search(r'benefit|लाभ|fayda',q) else
                'overview' if ids else 'discover')
        found=scheme_retrieval_service.search(message,records)
        if not ids: ids=[r['id'] for r in found]
        if not ids and intent in ('documents','application','screening','benefits'):
            ids=last_ids[:1]
        return Plan(intent=intent,scheme_ids=ids[:3])

    def _memory_reply(self,message,history,language):
        # Only repeats facts explicitly written by the user; never policy inference.
        q=message.casefold()
        if not re.search(r'what.*name|mera naam kya|मेरा नाम क्या',q): return None
        for turn in reversed(history):
            if turn['role']!='user': continue
            match=re.search(r'(?:my name is|mera naam|मेरा नाम)\s+([^.!?\n]{1,60})',turn['content'],re.I)
            if match:
                name=re.sub(r'\s+(?:hai|है)$','',match.group(1)).strip()
                return ('आपने अपना नाम '+name+' बताया था।') if language=='hi' else 'You told me your name is '+name+'.'
        return None

    def _safe_conversation(self,text,history):
        # Model prose is restricted to personal conversation, never policy facts.
        # Scheme-specific prose is not rendered at all; immutable sections supply it.
        if re.search(r'https?://|www\.|₹|\$|rupee|रुपये|लाख|crore|deadline|eligible|qualif|entitle|sanction|पात्र|approve|स्वीकृत|guarantee|guaranteed|benefit|subsid|दस्तावेज|document|मुफ्त|free (?:house|loan|money)|loan|ऋण',text,re.I):
            return ''
        return text.strip()

    def _screen(self,state,target,language,local_demo):
        if state is None:
            return EligibilityCardData(scheme_id=target['id'],scheme_name=target['name'],
                status='INSUFFICIENT_INFO',summary_explanation=WORDS[language]['screening'])
        if state.scheme_id!=target['id']:
            raise APIError(422,'SCHEME_STATE_MISMATCH','Questionnaire state does not match the selected scheme.')
        if local_demo:
            from app.eligibility import preliminary
            from app.api.routes.demo import today
            q=preliminary.render(state,as_of=today())
            ev=q['evaluation']
            mapping={'ELIGIBLE_LIKELY':'POTENTIALLY_ELIGIBLE','NOT_ELIGIBLE_LIKELY':'NOT_ELIGIBLE','NEEDS_VERIFICATION':'NEEDS_VERIFICATION'}
            return EligibilityCardData(scheme_id=target['id'],scheme_name=target['name'],
                status=mapping[ev['status']],summary_explanation=ev['explanation']+' '+WORDS[language]['notice'],
                criteria_breakdown=[CriterionEvaluationItem(criterion_name=c['label'],
                    satisfied=True if c['result']=='SATISFIED' else False if c['result']=='FAILED' else None,
                    explanation=c['explanation']) for c in ev['evaluated_conditions']])
        from app.eligibility.questionnaire import next_question
        from app.eligibility.provider import get_rule_provider
        from app.api.routes.demo import today
        q=next_question(state,get_rule_provider(),as_of=today())
        ev=q.evaluation
        mapping={'ELIGIBLE':'POTENTIALLY_ELIGIBLE','INELIGIBLE':'NOT_ELIGIBLE','NEEDS_VERIFICATION':'NEEDS_VERIFICATION'}
        return EligibilityCardData(scheme_id=target['id'],scheme_name=target['name'],
            status=mapping[ev.status],summary_explanation=ev.explanation+' '+WORDS[language]['notice'])

    def process_message(self,request,*,local_demo=False):
        cid,c,history=self._begin(request)
        lang=request.language or detect_language(request.message)
        words=WORDS[lang]
        try:
            try: records=scheme_retrieval_service.records(lang,local_demo)
            except (APIError,ValueError,OSError): records=[]
            claims=profile_context_service.build_context_summary(request.profile).get('profile_data',{})
            generated=gemini_service.generate_plan(request.message,history,records,lang,claims)
            plan=generated.plan or self._offline_plan(request.message,history,records,c['last_ids'])
            # A model cannot disguise a scheme question as free-form personal chat.
            policy_query=re.search(r'eligib|qualif|benefit|document|apply|deadline|loan|scheme|पात्र|दस्तावेज|लाभ|योजना|आवेदन|ऋण',request.message,re.I)
            exact_ids=scheme_retrieval_service.matching_ids(request.message,records)
            if plan.intent=='conversation' and (policy_query or exact_ids):
                plan=Plan(intent='overview',scheme_ids=exact_ids or c['last_ids'][:1])
            by_id={r['id']:r for r in records}
            selected=[by_id[sid] for sid in plan.scheme_ids if sid in by_id]
            if request.questionnaire_state:
                target=by_id.get(request.questionnaire_state.scheme_id)
                if not target: raise APIError(404,'SCHEME_UNAVAILABLE','Scheme is unavailable in the current catalogue.')
                selected=[target]; plan=plan.model_copy(update={'intent':'screening'})
            if plan.intent=='conversation': selected=[]
            cards=[]; docs=[]; guidance=None; eligibility=None; sources=[]; screen_url=None
            parts=[]
            if plan.intent=='conversation':
                recall=self._memory_reply(request.message,history,lang)
                prose=self._safe_conversation(plan.dialogue,history) if generated.plan else ''
                greeting=bool(re.fullmatch(r'\\s*(hi|hello|hey|namaste|नमस्ते)[!.,\\s]*',request.message,re.I))
                parts=[recall or prose or words['hello' if greeting else 'ack']]
            elif selected:
                for record in selected[:3]:
                    benefits=[display(b.get('description')) for b in record.get('benefits',[]) if display(b.get('description'))]
                    app=record.get('application_guidance') or {}
                    url=safe_url(app.get('url')) or next((safe_url(s.get('original_url')) for s in record.get('sources',[]) if safe_url(s.get('original_url'))),None)
                    cards.append(SchemeCardData(scheme_id=record['id'],code=record['id'],name=record['name'],
                        category='government_scheme',level=record['level'],benefits_summary=' '.join(benefits[:2]) or record.get('description') or words['unavailable'],
                        official_url=url,match_reason=words['limited'] if record.get('is_demo') else None,
                        publication_status=record.get('publication_status','published'),
                        verification_status=record.get('verification_status','not_attested'),
                        screening_available=record.get('screening_available',False)))
                    parts.append(record['name'])
                    sources.extend(record.get('sources',[]))
                    if plan.intent in ('discover','overview','clarify'):
                        parts.append(record.get('description') or words['unavailable'])
                    if plan.intent=='benefits': parts.extend(benefits or [words['unavailable']])
                target=selected[0]
                if plan.intent=='documents':
                    for row in target.get('required_documents',[]):
                        title=display(row.get('title')) or row.get('document_type','')
                        if title: docs.append(DocumentCheckItem(document_name=title,is_required=row.get('requirement')=='required'))
                    parts += [d.document_name for d in docs] or [words['unavailable']]
                elif plan.intent=='application':
                    app=target.get('application_guidance') or {}
                    steps=[display(s) for s in app.get('steps',[]) if display(s)]
                    routes=target.get('application_routes',[])
                    steps += [r['instructions'] for r in routes if r.get('instructions')]
                    url=safe_url(app.get('url')) or next((safe_url(r.get('original_url')) for r in routes if safe_url(r.get('original_url'))),None)
                    guidance=ApplicationGuidanceData(scheme_id=target['id'],scheme_name=target['name'],
                        mode=routes[0]['mode'] if routes and routes[0]['mode'] in ('online','offline','both') else None,
                        official_portal_url=url,steps=steps,caution_notes=[words['notice']])
                    parts.extend(steps or [words['unavailable']])
                elif plan.intent=='screening':
                    eligibility=self._screen(request.questionnaire_state,target,lang,local_demo)
                    parts.append(eligibility.summary_explanation)
                    screen_url='/screening?scheme_id='+target['id']
                parts.append(words['notice'])
            else:
                clarification=(plan.followup or plan.dialogue).strip()
                safe_question=(clarification.endswith('?') and not re.search(r'https?://|www\\.|[0-9₹$]|eligible|पात्र|guarante|मुफ्त',clarification,re.I))
                parts=[clarification if generated.plan and plan.intent=='clarify' and safe_question else words['scope'] if plan.intent=='out_of_scope' else words['missing']]
            message='\n\n'.join(p for p in parts if p)
            if not generated.plan: message=words['basic']+message
            now=datetime.now(timezone.utc)
            with self._lock:
                if self._conversations.get(cid) is c:
                    c['history']=(history+[dict(id=str(uuid.uuid4()),role='user',content=request.message,created_at=now),
                        dict(id=str(uuid.uuid4()),role='assistant',content=message,created_at=now)])[-12:]
                    if selected: c['last_ids']=[r['id'] for r in selected]
                    c.update(updated=monotonic(),turns=c['turns']+1)
            return ChatMessageResponse(conversation_id=cid,conversation_token=c['token'],message=message,
                language=lang,intent=plan.intent,provider='gemini' if generated.plan else 'local_guidance',
                degradation_reason=generated.reason,schemes=cards,eligibility=eligibility,missing_documents=docs,
                application_guidance=guidance,suggested_followups=words['follow'],sources=sources[:20],screening_url=screen_url)
        finally:
            with self._lock: c['busy']=False

chatbot_service=ChatbotService()
