import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Menu, X, ArrowRight } from 'lucide-react';

export const Navbar = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 pb-2 transition-all">
        <div className="max-w-7xl mx-auto">
        <div className="glass-panel rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-glass">
          
          {/* Logo & Platform Name */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none rounded-full p-1 transition"
            aria-label="Scheme Sahayak Home"
          >
            <div className="relative">
              <img
                src="/logo.svg"
                alt="Scheme Sahayak logo"
                className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-105"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  {language === 'hi' ? 'योजना सहायक' : 'Scheme Sahayak'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight hidden md:block">
                {t('appSubtitle', 'Citizen Scheme Assistant')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/40 p-1 rounded-full border border-white/60">
            <Link
              to="/"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {t('navHome', 'Home')}
            </Link>

            <Link
              to="/schemes"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/schemes')
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {t('navSchemes', 'Explore Schemes')}
            </Link>

            <a
              href="/#how-it-works"
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-all"
            >
              {t('navHowItWorks', 'How It Works')}
            </a>

            <a
              href="/#about"
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-all"
            >
              {t('navAbout', 'About Us')}
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Dark Capsule Button */}
            <Link
              to="/screening"
              className="glass-dark-pill inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide hover:bg-black transition-all shadow-md active:scale-95"
            >
              <span>{t('navCheckEligibility', 'Check Eligibility')}</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-white" />
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button & Lang Switcher */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 bg-white/60 hover:bg-white rounded-full border border-white/80"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-2">
          <div className="glass-panel rounded-3xl p-5 space-y-3 shadow-lg border border-white/80">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 hover:bg-white/70"
            >
              {t('navHome', 'Home')}
            </Link>
            <Link
              to="/schemes"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 hover:bg-white/70"
            >
              {t('navSchemes', 'Explore Schemes')}
            </Link>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 hover:bg-white/70"
            >
              {t('navHowItWorks', 'How It Works')}
            </a>
            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 hover:bg-white/70"
            >
              {t('navAbout', 'About Us')}
            </a>

            <div className="pt-3 border-t border-slate-200/50">
              <Link
                to="/screening"
                onClick={() => setMobileMenuOpen(false)}
                className="glass-dark-pill w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs font-semibold tracking-wide"
              >
                <span>{t('navCheckEligibility', 'Check Eligibility')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
    {/* 1.2 Independent disclaimer strip directly under navbar on EVERY page */}
    <div className="bg-amber-50/90 border-y border-amber-200/80 text-amber-950 py-1 px-4 text-center text-[11px] sm:text-xs font-medium tracking-wide">
      <p className="max-w-7xl mx-auto">
        {t('bannerDisclaimer', 'Independent project, not an official government website.')}
      </p>
    </div>
  </>
  );
};
