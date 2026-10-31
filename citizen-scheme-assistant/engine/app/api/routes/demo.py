"""Opt-in, loopback-only draft previews. No database access or eligibility approval."""
from functools import lru_cache
from datetime import datetime, timedelta, timezone
import os
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, Path as URLPath, Query, Request, Response

from app.core.errors import APIError
from app.schemas.schemes import Language, Level
from ingestion.batch import validate_collection
from app.eligibility import preliminary
from app.schemas.questionnaire import StartRequest, NextRequest, AnswerRequest
from app.schemas.results import ResultRequest

router=APIRouter(prefix='/api/v1/demo',tags=['Development demo catalogue'])
COLLECTION=Path(__file__).resolve().parents[3]/'.phase3-output/catalog15/collection.json'


def demo_guard(request:Request):
    if (os.getenv('SCHEME_DEMO_ENABLED')!='1' or os.getenv('SCHEME_APP_ENV')!='development'
            or not request.client or request.client.host not in {'127.0.0.1','::1','testclient','test'}
            or request.url.hostname not in {'localhost','127.0.0.1','::1','testserver','test'}):
        raise APIError(404,'DEMO_UNAVAILABLE','Demo catalogue is unavailable.')


@lru_cache(maxsize=1)
def demo_records():
    try:
        bundles=validate_collection(COLLECTION)
        if len(bundles)!=15:raise ValueError('Incomplete demo collection')
        return tuple(b['payload']['rows'] for b in bundles)
    except (OSError,ValueError,KeyError):
        raise APIError(503,'DEMO_DATA_UNAVAILABLE','Validated demo catalogue is unavailable.') from None


def item(rows,lang,detail=False):
    scheme=rows['schemes'][0];version=rows['scheme_versions'][0]
    translation=next((t for t in rows['translations'] if t['language_code']==lang),None)
    if translation is None:translation=next(t for t in rows['translations'] if t['language_code']=='en')
    organization=next(o for o in rows['organizations'] if o['id']==scheme['organization_id'])
    result=dict(id=scheme['stable_id'],name=translation['title'],description=translation['summary'],
        requested_language=lang,language=translation['language_code'],translation_fallback=translation['language_code']!=lang,
        level=scheme['government_level'],organization_name=organization['name'],version_number=version['version_number'],
        publication_status='draft',published_at=None,is_demo=True,verification_status='UNVERIFIED',
        translation_review_status='draft',eligibility_execution_enabled=False,
        catalog_origin='validated_local_prepared_bundle',last_checked_date=version.get('last_checked_date'))
    if detail:
        sources={s['id']:s for s in rows['official_sources']};snapshots={s['id']:s for s in rows['source_snapshots']}
        result['eligibility_text']=translation.get('eligibility_text')
        result['sources']=[dict(id=e['id'],original_url=sources[snapshots[e['snapshot_id']]['source_id']]['original_url'],
            source_title=sources[snapshots[e['snapshot_id']]['source_id']]['title'],
            locator=e['locator'],last_checked_date=e['last_checked_date'],verification_status='UNVERIFIED') for e in rows['evidence']]
        result['sources']=preliminary.distinct_sources(result['sources'])
    result['screening_available']=False
    result['benefit_highlight']=None
    result['audience']=None
    policy=preliminary.policy_for(scheme['stable_id'],as_of=today())
    if policy:
        content=preliminary.detail_content(policy,lang)
        if not detail:
            content={k:v for k,v in content.items() if k in ('name','description','language','translation_fallback',
                'benefit_highlight','audience','screening_available','screening_scope','translation_origin','last_checked_date')}
        result.update(content)
    return result


def headers(response):
    response.headers['Cache-Control']='no-store'
    response.headers['X-Scheme-Catalog']='DEMO-UNVERIFIED'


def today():
    return datetime.now(timezone(timedelta(hours=5,minutes=30))).date()


@router.get('/schemes',dependencies=[Depends(demo_guard)])
def schemes(response:Response,lang:Language='en',search:Annotated[str|None,Query(max_length=200)]=None,
            level:Level|None=None,limit:Annotated[int,Query(ge=1,le=100)]=20,
            offset:Annotated[int,Query(ge=0,le=1_000_000)]=0):
    records=[item(r,lang) for r in demo_records()]
    records.sort(key=lambda r:(not r['screening_available'],r['id']))
    if level:records=[r for r in records if r['level']==level]
    if search and search.strip():
        term=search.strip().casefold()
        records=[r for r in records if term in r['name'].casefold() or term in r['description'].casefold() or term in r['id']]
    headers(response)
    return dict(items=records[offset:offset+limit],total=len(records),limit=limit,offset=offset,
                has_more=offset+limit<len(records),catalog_mode='DEMO_UNVERIFIED',eligibility_execution_enabled=False)


@router.get('/schemes/{scheme_id}',dependencies=[Depends(demo_guard)])
def detail(response:Response,scheme_id:Annotated[str,URLPath(pattern=r'^[a-z0-9]+(-[a-z0-9]+)*$',max_length=200)],lang:Language='en'):
    for rows in demo_records():
        if rows['schemes'][0]['stable_id']==scheme_id:
            headers(response);return item(rows,lang,detail=True)
    raise APIError(404,'SCHEME_NOT_FOUND','Demo scheme not found.')


@router.post('/questionnaire/start',dependencies=[Depends(demo_guard)])
def start_preliminary(request:StartRequest,response:Response):
    headers(response)
    return preliminary.start(request,as_of=today())


@router.post('/questionnaire/next',dependencies=[Depends(demo_guard)])
def next_preliminary(request:NextRequest,response:Response):
    headers(response)
    return preliminary.render(request.state,as_of=today())


@router.post('/questionnaire/answer',dependencies=[Depends(demo_guard)])
def answer_preliminary(request:AnswerRequest,response:Response):
    headers(response)
    return preliminary.answer(request,as_of=today())


@router.post('/results/explain',dependencies=[Depends(demo_guard)])
def explain_preliminary(request:ResultRequest,response:Response):
    headers(response)
    return preliminary.explain(request.state,as_of=today())
