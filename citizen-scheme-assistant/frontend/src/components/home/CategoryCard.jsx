import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Sprout,
  Users,
  GraduationCap,
  HeartPulse,
  Home,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const iconMap = {
  agriculture: Sprout,
  'women-child': Users,
  education: GraduationCap,
  health: HeartPulse,
  housing: Home,
  employment: Briefcase,
  business: TrendingUp,
  'social-welfare': ShieldCheck,
};

const categoryIconGradients = {
  agriculture: 'bg-emerald-100/80 text-emerald-700 border-emerald-200/60',
  'women-child': 'bg-rose-100/80 text-rose-700 border-rose-200/60',
  education: 'bg-blue-100/80 text-blue-700 border-blue-200/60',
  health: 'bg-teal-100/80 text-teal-700 border-teal-200/60',
  housing: 'bg-amber-100/80 text-amber-700 border-amber-200/60',
  employment: 'bg-indigo-100/80 text-indigo-700 border-indigo-200/60',
  business: 'bg-purple-100/80 text-purple-700 border-purple-200/60',
  'social-welfare': 'bg-cyan-100/80 text-cyan-700 border-cyan-200/60',
};

export const CategoryCard = ({ categoryId, titleKey, descKey, className = '' }) => {
  const { t } = useLanguage();
  const Icon = iconMap[categoryId] || ShieldCheck;
  const iconStyle =
    categoryIconGradients[categoryId] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <Link
      to={`/schemes?category=${categoryId}`}
      className={`group relative flex flex-col p-6 rounded-[24px] glass-panel glass-panel-hover shadow-glass ${className}`}
    >
      <div>
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3.5 transition-transform group-hover:scale-105 border ${iconStyle} shadow-2xs`}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
          {t(titleKey)}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed font-normal">{t(descKey)}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/60 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-orange-600">
        <span>{t('browseAllButton', 'Browse Schemes')}</span>
        <div className="w-6 h-6 rounded-full bg-white/70 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
};
