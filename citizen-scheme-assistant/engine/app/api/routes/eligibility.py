from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, Field

from app.api.routes import demo
from app.core.errors import APIError
from app.eligibility import preliminary
from app.eligibility.engine import InvalidAnswers, evaluate
from app.eligibility.provider import RuleProvider, get_rule_provider
from app.schemas.eligibility import EvaluationRequest, EvaluationResponse, RuleSet
from app.schemas.questionnaire import QuestionnaireState
from app.schemas.schemes import ErrorResponse, Language

router = APIRouter(prefix='/api/v1/eligibility', tags=['Eligibility'], responses={
    422: {'model': ErrorResponse}, 503: {'model': ErrorResponse}, 500: {'model': ErrorResponse}})


class ScanRequest(BaseModel):
    answers: dict[str, Any] = Field(default_factory=dict)
    language: Language = 'en'


class ScanItem(BaseModel):
    scheme_id: str
    status: str
    scheme_name: dict[str, str] | str | None = None


class ScanResponse(BaseModel):
    items: list[ScanItem] = Field(default_factory=list)


@router.post('/evaluate', response_model=EvaluationResponse)
def evaluate_eligibility(request: EvaluationRequest, response: Response,
                         provider: Annotated[RuleProvider, Depends(get_rule_provider)]) -> EvaluationResponse:
    response.headers['Cache-Control'] = 'no-store'
    response.headers['Pragma'] = 'no-cache'
    rules = provider.get_rule_set(request.scheme_id)
    if rules is not None and (not isinstance(rules, RuleSet) or rules.scheme_id != request.scheme_id):
        raise APIError(503, 'RULE_SET_INVALID', 'Approved rule definitions are unavailable.')
    try:
        return evaluate(rules, request.scheme_id, request.answers, request.language,
                        as_of=datetime.now(timezone(timedelta(hours=5, minutes=30))).date())
    except InvalidAnswers:
        # Do not include citizen values or allow answer-controlled error messages.
        raise APIError(422, 'INVALID_ANSWERS', 'Answer fields or types do not match the reviewed questions.') from None


@router.post('/scan', response_model=ScanResponse)
def scan_eligibility(
    request: ScanRequest,
    response: Response,
    http_request: Request,
    provider: Annotated[RuleProvider, Depends(get_rule_provider)]
) -> ScanResponse:
    """Added for the notification feature.
    Evaluates citizen profile answers against all available schemes
    by reusing the exact internal evaluation logic used by /screening and /results.
    """
    response.headers['Cache-Control'] = 'no-store'
    response.headers['Pragma'] = 'no-cache'
    today = datetime.now(timezone(timedelta(hours=5, minutes=30))).date()
    items: list[ScanItem] = []

    if demo.is_local_demo(http_request):
        # Local demo mode: reuse preliminary catalog and preliminary.render
        data, policies = preliminary.catalog(include_additions=True)
        for scheme_id, policy in policies.items():
            definitions = {f['key']: f for f in policy.get('fields', [])}
            scheme_answers = {k: v for k, v in request.answers.items() if k in definitions}
            try:
                state = QuestionnaireState(
                    scheme_id=scheme_id,
                    language=request.language,
                    policy_fingerprint=preliminary.fingerprint(policy),
                    answers=scheme_answers
                )
                q = preliminary.render(state, as_of=today)
                status = q['evaluation']['status']
            except Exception:
                status = 'NEEDS_VERIFICATION'

            items.append(ScanItem(
                scheme_id=scheme_id,
                status=status,
                scheme_name=policy.get('name')
            ))
        return ScanResponse(items=items)

    # Production / Database mode: evaluate all approved schemes in provider
    approvals = getattr(provider, 'approvals', {})
    if approvals:
        for scheme_id in approvals.keys():
            rules = provider.get_rule_set(scheme_id)
            if rules is None:
                continue
            definitions = {f.key: f for f in rules.fields}
            scheme_answers = {k: v for k, v in request.answers.items() if k in definitions}
            try:
                eval_res = evaluate(rules, scheme_id, scheme_answers, request.language, as_of=today)
                status = eval_res.status
            except Exception:
                status = 'NEEDS_VERIFICATION'

            items.append(ScanItem(
                scheme_id=scheme_id,
                status=status,
                scheme_name=scheme_id
            ))

    return ScanResponse(items=items)
