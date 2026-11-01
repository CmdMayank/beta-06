"""Strict, ephemeral chatbot DTOs; no authentication/profile persistence."""
from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.questionnaire import QuestionnaireState

class DTO(BaseModel):
    model_config = ConfigDict(extra='forbid', allow_inf_nan=False)

class ChatProfileContext(DTO):
    state: str | None = Field(default=None,max_length=100)
    area_type: Literal['rural','urban'] | None = None
    age: int | None = Field(default=None,ge=0,le=125)
    gender: str | None = Field(default=None,max_length=40)
    occupation: str | None = Field(default=None,max_length=100)
    annual_income: float | None = Field(default=None,ge=0,le=1e15)
    owns_agricultural_land: bool | None = None
    housing_type: str | None = Field(default=None,max_length=100)
    caste_category: str | None = Field(default=None,max_length=40)
    has_bpl_card: bool | None = None
    has_existing_lpg: bool | None = None
    pays_income_tax: bool | None = None
    education_level: str | None = Field(default=None,max_length=100)

class ChatMessageRequest(DTO):
    conversation_id: str | None = Field(default=None,pattern=r'^[a-f0-9-]{36}$')
    conversation_token: str | None = Field(default=None,pattern=r'^[a-f0-9]{64}$')
    message: str = Field(min_length=1,max_length=2000)
    language: Literal['en','hi'] | None = None
    session_id: str | None = Field(default=None,max_length=100)
    profile: ChatProfileContext | None = None
    questionnaire_state: QuestionnaireState | None = None

class SchemeCardData(DTO):
    scheme_id: str
    code: str
    name: str
    category: str
    level: str
    benefits_summary: str
    official_url: str | None = None
    match_reason: str | None = None
    publication_status: str = 'draft'
    verification_status: str = 'UNVERIFIED'
    screening_available: bool = False

class CriterionEvaluationItem(DTO):
    criterion_name: str
    satisfied: bool | None
    explanation: str

class EligibilityCardData(DTO):
    scheme_id: str
    scheme_name: str
    status: Literal['POTENTIALLY_ELIGIBLE','NOT_ELIGIBLE','NEEDS_VERIFICATION','INSUFFICIENT_INFO']
    confidence_score: float | None = None
    summary_explanation: str
    criteria_breakdown: list[CriterionEvaluationItem] = Field(default_factory=list)

class DocumentCheckItem(DTO):
    document_name: str
    is_required: bool = False
    status: Literal['AVAILABLE','MISSING','NEEDS_VERIFICATION','NOT_APPLICABLE'] = 'NEEDS_VERIFICATION'
    purpose: str | None = None
    where_to_obtain: str | None = None
    official_portal_url: str | None = None

class ApplicationGuidanceData(DTO):
    scheme_id: str
    scheme_name: str
    mode: Literal['online','offline','both'] | None = None
    official_portal_url: str | None = None
    steps: list[str] = Field(default_factory=list)
    documents_needed: list[str] = Field(default_factory=list)
    caution_notes: list[str] = Field(default_factory=list)

class IntentAnalysis(DTO):
    intent: str
    language: str = 'en'
    requires_profile: bool = False
    requires_scheme_search: bool = False
    requires_eligibility_check: bool = False
    requires_document_check: bool = False
    target_scheme_id: str | None = None
    target_category: str | None = None
    target_state: str | None = None

class ChatMessageResponse(DTO):
    conversation_id: str
    conversation_token: str
    message: str
    language: Literal['en','hi']
    intent: str
    intent_details: IntentAnalysis | None = None
    provider: Literal['gemini','local_guidance']
    degradation_reason: str | None = None
    schemes: list[SchemeCardData] = Field(default_factory=list)
    eligibility: EligibilityCardData | None = None
    missing_documents: list[DocumentCheckItem] = Field(default_factory=list)
    application_guidance: ApplicationGuidanceData | None = None
    suggested_followups: list[str] = Field(default_factory=list)
    sources: list[dict] = Field(default_factory=list)
    screening_url: str | None = None
    created_at: datetime = Field(default_factory=lambda:datetime.now(timezone.utc))

class ChatMessageRecord(DTO):
    id: str
    role: Literal['user','assistant','system']
    content: str
    created_at: datetime

class ConversationHistoryResponse(DTO):
    conversation_id: str
    messages: list[ChatMessageRecord]
    total_messages: int

class SuggestedQuestionsResponse(DTO):
    language: Literal['en','hi']
    questions: list[str]

class VoiceTTSRequest(DTO):
    text: str = Field(min_length=1,max_length=2500)
    language: Literal['en','hi'] = 'en'
    voice_id: str | None = Field(default=None,pattern=r'^[a-zA-Z0-9_-]{1,80}$')

class VoiceStatusResponse(DTO):
    configured: bool
    provider: str
    voice_id: str
    model_id: str
    gender: str = 'configured_voice'
    persona: str = 'Sahayak'
    languages_supported: list[str]
