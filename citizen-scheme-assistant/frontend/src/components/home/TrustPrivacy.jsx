import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ShieldCheck, Lock, ExternalLink, UserX } from 'lucide-react';

export const TrustPrivacy = ({ className = '' }) => {
  const { t } = useLanguage();

  const trustPoints = [
    {
      icon: Lock,
      titleKey: 'trustPoint1Title',
      descKey: 'trustPoint1Desc',
      color: 'bg-emerald-100/80 text-emerald-700 border-emerald-200/60',
    },
    {
      icon: ShieldCheck,
      titleKey: 'trustPoint2Title',
      descKey: 'trustPoint2Desc',
      color: 'bg-blue-100/80 text-blue-700 border-blue-200/60',
    },
    {
      icon: ExternalLink,
      titleKey: 'trustPoint3Title',
      descKey: 'trustPoint3Desc',
      color: 'bg-orange-100/80 text-orange-700 border-orange-200/60',
    },
    {
      icon: UserX,
      titleKey: 'trustPoint4Title',
      descKey: 'trustPoint4Desc',
      color: 'bg-purple-100/80 text-purple-700 border-purple-200/60',
    },
  ];

  return (
    <section id="about" className={`py-12 md:py-16 relative ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <span className="inline-block px-3.5 py-1 rounded-full glass-card-subtle text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2">
            Safety & Integrity
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            {t('trustHeading', 'Built on Trust, Privacy, and Official Sources')}
          </h2>
          <p className="text-sm text-slate-600">
            {t(
              'trustSubheading',
              'Scheme Sahayak is designed specifically for public benefit and shared-phone safety.'
            )}
          </p>
        </div>

        {/* 4 Feature Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.titleKey}
                className="glass-panel rounded-[26px] p-6 shadow-glass flex flex-col"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border shadow-2xs ${point.color}`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">{t(point.titleKey)}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{t(point.descKey)}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
