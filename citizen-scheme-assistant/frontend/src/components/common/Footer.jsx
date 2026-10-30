import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { Shield, ExternalLink, Heart, Globe, Building2 } from 'lucide-react';

export const Footer = () => {
  const { t, language } = useLanguage();

  const officialLinks = [
    { title: 'myScheme Portal', url: 'https://www.myscheme.gov.in' },
    { title: 'National Portal of India', url: 'https://www.india.gov.in' },
    { title: 'Direct Benefit Transfer (DBT)', url: 'https://dbtbharat.gov.in' },
    { title: 'PM-KISAN Portal', url: 'https://pmkisan.gov.in' },
    { title: 'National Health Authority', url: 'https://nha.gov.in' },
    { title: 'National Scholarship Portal', url: 'https://scholarships.gov.in' },
  ];

  return (
    <footer className="mt-auto px-3 sm:px-6 pb-6 pt-12">
      <div className="max-w-7xl mx-auto rounded-[36px] glass-panel text-slate-700 border border-white/80 shadow-glass-lg overflow-hidden text-sm">
        
        {/* Top Disclaimer Banner */}
        <div className="bg-amber-50/80 border-b border-amber-200/60 py-5 px-6 sm:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200/80 shrink-0 shadow-2xs">
              <Shield className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="text-xs leading-relaxed text-amber-950">
              <span className="font-bold text-amber-900 block mb-0.5">
                {t('footerDisclaimerTitle', 'Important Disclaimer')}
              </span>
              <p className="text-amber-900/90 font-medium">
                {t(
                  'footerDisclaimerText',
                  'Scheme Sahayak is an independent public information platform. It is not affiliated with any specific ministry or government department. All scheme information is aggregated from official gazettes, guidelines, and portals (.gov.in). Final eligibility and disbursals are strictly governed by respective government authorities.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="px-6 sm:px-10 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Brand Col */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="Scheme Sahayak" className="w-9 h-9" />
                <span className="text-lg font-black text-slate-900 tracking-tight">
                  {language === 'hi' ? 'योजना सहायक' : 'Scheme Sahayak'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {t(
                  'footerAboutText',
                  'A bilingual, accessible citizen welfare assistant dedicated to bridging the information gap between Indian citizens and government welfare schemes.'
                )}
              </p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/90 text-emerald-800 text-[11px] font-semibold border border-emerald-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Shared-Phone Privacy Protected</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                {t('footerQuickLinks', 'Quick Links')}
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/" className="text-slate-600 hover:text-orange-600 transition font-medium">
                    {t('navHome', 'Home')}
                  </Link>
                </li>
                <li>
                  <Link to="/schemes" className="text-slate-600 hover:text-orange-600 transition font-medium">
                    {t('navSchemes', 'Explore Schemes')}
                  </Link>
                </li>
                <li>
                  <Link to="/screening" className="text-slate-600 hover:text-orange-600 transition font-medium">
                    {t('navCheckEligibility', 'Check Eligibility')}
                  </Link>
                </li>
                <li>
                  <a href="/#how-it-works" className="text-slate-600 hover:text-orange-600 transition font-medium">
                    {t('navHowItWorks', 'How It Works')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Official Gov Portals */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-orange-500" />
                <span>{t('footerGovPortals', 'Official Government Portals')}</span>
              </h4>
              <ul className="space-y-2.5 text-xs">
                {officialLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-slate-600 hover:text-orange-600 transition group font-medium"
                    >
                      <span>{link.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-orange-500 transition" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Transparency & Legal */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>{t('footerLegal', 'Transparency & Privacy')}</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                <li>
                  <strong className="text-slate-900 block font-semibold">Zero Persistent Tracking:</strong>
                  Screening sessions reside solely in your current browser tab.
                </li>
                <li>
                  <strong className="text-slate-900 block font-semibold">Verified Official Sources:</strong>
                  All scheme rules reference published gazette notifications.
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="pt-8 mt-8 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <p>{t('footerCopyright', '© 2026 Scheme Sahayak. Built for Indian Citizens.')}</p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1 text-slate-600">
                Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Digital India
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
