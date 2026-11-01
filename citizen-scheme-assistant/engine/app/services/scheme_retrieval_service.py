"""Only real repository/validated local records. No hardcoded policy fallback."""
import re
from app.core.errors import APIError
from app.db.repository import SchemeRepository

ALIASES={
    'pmjjby':'in-cen-000001','pmsby':'in-cen-000002','pm-sym':'in-cen-000003',
    'pmuy':'in-cen-000004','ujjwala':'in-cen-000004','उज्ज्वला':'in-cen-000004',
    'ignoaps':'in-cen-000005','pm-kisan':'in-cen-000006','pmkisan':'in-cen-000006','pm kisan':'in-cen-000006','किसान सम्मान':'in-cen-000006',
    'atal pension':'in-cen-000007','apy':'in-cen-000007','sukanya':'in-cen-000008','सुकन्या':'in-cen-000008',
    'pmay':'in-cen-000009','pm-jay':'in-cen-000010','ayushman':'in-cen-000010','आयुष्मान':'in-cen-000010',
    'vishwakarma':'in-cen-000011','विश्वकर्मा':'in-cen-000011','svanidhi':'in-cen-000012','स्वनिधि':'in-cen-000012',
    'mudra':'in-cen-000013','मुद्रा':'in-cen-000013','surya ghar':'in-cen-000014','सूर्य घर':'in-cen-000014',
    'जीवन ज्योति':'in-cen-000001','सुरक्षा बीमा':'in-cen-000002','श्रम योगी':'in-cen-000003',
    'वृद्धावस्था पेंशन':'in-cen-000005','पीएम-किसान':'in-cen-000006','पीएम किसान':'in-cen-000006',
    'अटल पेंशन':'in-cen-000007','पीएम आवास':'in-cen-000009','आवास ग्रामीण':'in-cen-000009',
    'kcc':'in-cen-000015','kisan credit':'in-cen-000015','किसान क्रेडिट':'in-cen-000015'}

def display(value):
    return value if isinstance(value,str) else (value or {}).get('text') or ''

class SchemeRetrievalService:
    def records(self,language,local_demo=False):
        if local_demo:
            from app.api.routes.demo import demo_records,item
            return [item(rows,language,detail=True) for rows in demo_records()]
        return [r.model_dump(mode='json') for r in SchemeRepository().list_schemes(language,None,None,100,0).items]

    def detail(self,scheme_id,language,local_demo=False):
        if local_demo: return next((r for r in self.records(language,True) if r['id']==scheme_id),None)
        result=SchemeRepository().get_scheme(scheme_id,language)
        return result.model_dump(mode='json') if result else None

    def matching_ids(self,query,records):
        q=query.casefold()
        allowed={r['id'] for r in records}
        exact=[sid for alias,sid in ALIASES.items() if sid in allowed and
            (bool(re.search(r'(?<![a-z0-9])'+re.escape(alias)+r'(?![a-z0-9])',q)) if alias.isascii() else alias in q)]
        exact += [r['id'] for r in records if r['id'] in q or (r.get('name') and r['name'].casefold() in q)]
        return list(dict.fromkeys(exact))

    def search(self,query,records):
        exact=self.matching_ids(query,records)
        if exact: return [r for r in records if r['id'] in exact][:3]
        q=query.casefold()
        groups=[(('farmer','farming','किसान','खेती'),{'in-cen-000006','in-cen-000015'}),
            (('housing','house','आवास','घर'),{'in-cen-000009','in-cen-000014'}),
            (('health','hospital','स्वास्थ्य','अस्पताल'),{'in-cen-000010'}),
            (('pension','पेंशन'),{'in-cen-000003','in-cen-000005','in-cen-000007'})]
        for words,ids in groups:
            if any(w in q for w in words): return [r for r in records if r['id'] in ids][:3]
        if any(w in q for w in ('available schemes','all schemes','योजनाएं दिखा','schemes available')):
            return records[:3]
        # No unrelated default schemes, scholarships or fake records.
        return []

scheme_retrieval_service=SchemeRetrievalService()
