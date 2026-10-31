import React,{useEffect,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useLanguage} from '../i18n/LanguageContext';
import {errorKey} from '../i18n/integration.js';
import {schemeApi} from '../services/schemeApi.js';
import {SchemeCard} from '../components/schemes/SchemeCard';
export const PublishedCatalog=({data,loading,error})=>{
 const {t}=useLanguage();
 return error?<p role="alert">{error}</p>:loading?<p role="status">{t('loading')}</p>:!data?.items?.length?<p role="status" className="glass-panel rounded-[28px] p-8">{t('emptyPublished')}</p>:<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{data.items.map(s=><SchemeCard key={s.id} scheme={s}/>)}</div>;
};
export const SchemesPage=()=>{
 const {t,language}=useLanguage(); const [params]=useSearchParams(); const [search,setSearch]=useState(params.get('search')||'');
 const [level,setLevel]=useState('all'),[offset,setOffset]=useState(0),[data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;setLoading(true);setError('');schemeApi.getSchemes({search,level,language,offset}).then(r=>{if(active)setData(r);}).catch(e=>{if(active){setError(t(errorKey(e)));setData(null);}}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[search,level,language,offset]);
 return <div className="flex-1 py-10"><div className="max-w-7xl mx-auto px-4 space-y-6"><h1 className="text-3xl font-black">{t('exploreTitle')}</h1><p className="text-slate-600">{t('catalogueIntro')}</p>
 <div className="flex flex-wrap gap-4"><input className="glass-input rounded-full p-4 flex-1" aria-label={t('searchSchemesInput')} placeholder={t('searchSchemesInput')} value={search} onChange={e=>{setSearch(e.target.value);setOffset(0);}}/>
 <select className="glass-input rounded-full p-4" aria-label={t('filterTitle')} value={level} onChange={e=>{setLevel(e.target.value);setOffset(0);}}><option value="all">{t('allSchemes','All schemes')}</option>{['central','state','ut','local'].map(l=><option value={l} key={l}>{t(l==='central'?'centralGov':l==='state'?'stateGov':l,l)}</option>)}</select></div>
 <PublishedCatalog data={data} loading={loading} error={error}/>
 <div className="flex gap-4"><button disabled={!offset||loading} onClick={()=>setOffset(Math.max(0,offset-20))}>{t('btnBack')}</button><button disabled={!data?.has_more||loading} onClick={()=>setOffset(offset+20)}>{t('btnNext')}</button></div>
 </div></div>;
};
