import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { INDIAN_STATES, SCHEME_CATEGORIES } from '../../constants/schemeConstants';
import { Filter, RotateCcw, ChevronDown, X } from 'lucide-react';

export const FilterSidebar = ({
  filters = { level: 'all', state: 'ALL', category: 'all' },
  onChange,
  onReset,
  className = '',
  isMobile = false,
  onCloseMobile,
}) => {
  const { t, getLocalized } = useLanguage();

  const levelOptions = [
    { value: 'all', labelKey: 'filterAllLevels', defaultLabel: 'All Levels' },
    { value: 'central', labelKey: 'filterCentral', defaultLabel: 'Central Schemes' },
    { value: 'state', labelKey: 'filterState', defaultLabel: 'State Schemes' },
  ];

  return (
    <div className={`bg-white rounded-[28px] border border-slate-200/80 p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-orange-500 fill-orange-500/20" />
          <h2 className="font-bold text-slate-900 text-base">{t('filterTitle', 'Filters')}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('showAllResults', 'Show All Results')}</span>
          </button>

          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 ml-1"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Government Level */}
      <div className="pt-5">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
          {t('filterGovernmentLevel', 'GOVERNMENT LEVEL')}
        </label>
        <div className="space-y-1.5">
          {levelOptions.map((lvl) => {
            const isSelected = filters.level === lvl.value;
            return (
              <label
                key={lvl.value}
                onClick={() => onChange('level', lvl.value)}
                className={`flex items-center gap-3 p-2.5 px-3 rounded-2xl cursor-pointer transition ${
                  isSelected
                    ? 'border border-amber-300 ring-1 ring-amber-300/40 bg-white shadow-xs'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition ${
                    isSelected
                      ? 'border-2 border-orange-500'
                      : 'border border-slate-300'
                  }`}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                </div>
                <span
                  className={`text-xs sm:text-sm ${
                    isSelected ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                  }`}
                >
                  {t(lvl.labelKey, lvl.defaultLabel)}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Select State / Union Territory */}
      <div className="pt-6">
        <label
          htmlFor="state-filter-select"
          className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5"
        >
          {t('filterStateSelect', 'SELECT STATE / UNION TERRITORY')}
        </label>
        <div className="relative">
          <select
            id="state-filter-select"
            value={filters.state || 'ALL'}
            onChange={(e) => onChange('state', e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-2xl py-3 pl-4 pr-10 text-xs sm:text-sm font-medium text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 cursor-pointer shadow-xs"
          >
            {INDIAN_STATES.map((st) => (
              <option key={st.code} value={st.code}>
                {getLocalized(st.name)}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-700 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Category */}
      <div className="pt-6">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          {t('filterCategory', 'CATEGORY')}
        </label>
        <div className="space-y-1">
          {SCHEME_CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange('category', cat.id)}
                className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#0B1528] text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <span>{t(cat.key, cat.defaultLabel || cat.id)}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
