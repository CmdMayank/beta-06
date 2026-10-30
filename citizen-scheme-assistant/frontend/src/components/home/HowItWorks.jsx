import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { UserCheck, Compass, FileCheck2 } from 'lucide-react';

export const HowItWorks = ({ className = '' }) => {
  const { t } = useLanguage();

  const steps = [
    {
      number: '01',
      icon: UserCheck,
      titleKey: 'step1Title',
      descKey: 'step1Desc',
      accentColor: 'border-orange-200/80 text-orange-600 bg-orange-50/80',
    },
    {
      number: '02',
      icon: Compass,
      titleKey: 'step2Title',
      descKey: 'step2Desc',
      accentColor: 'border-blue-200/80 text-blue-600 bg-blue-50/80',
    },
    {
      number: '03',
      icon: FileCheck2,
      titleKey: 'step3Title',
      descKey: 'step3Desc',
      accentColor: 'border-emerald-200/80 text-emerald-700 bg-emerald-50/80',
    },
  ];

  return (
    <section id="how-it-works" className={`py-12 md:py-16 relative ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <span className="inline-block px-3.5 py-1 rounded-full glass-card-subtle text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-2">
            Transparent Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            {t('howItWorksHeading', 'How Scheme Sahayak Works')}
          </h2>
          <p className="text-sm text-slate-600">
            {t('howItWorksSubheading', 'Three straightforward steps to identify and claim your citizen entitlements')}
          </p>
        </div>

        {/* 3 Step Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative glass-panel rounded-[28px] p-6 shadow-glass flex flex-col"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs ${step.accentColor}`}>
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <span className="text-3xl font-black text-slate-300/80">{step.number}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{t(step.titleKey)}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{t(step.descKey)}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/60 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Step {idx + 1} of 3</span>
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
