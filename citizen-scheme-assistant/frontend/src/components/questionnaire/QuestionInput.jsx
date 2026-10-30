import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Check } from 'lucide-react';

export const QuestionInput = ({ question, value, onChange }) => {
  const { t, getLocalized } = useLanguage();

  if (!question) return null;

  const { type, options = [], placeholder } = question;

  // 1. BOOLEAN TYPE (Tactile Glass Yes / No Cards)
  if (type === 'BOOLEAN') {
    return (
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`p-6 rounded-[24px] font-bold text-base transition-all flex flex-col items-center justify-center gap-3 border ${
            value === true
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-950 shadow-md ring-2 ring-emerald-300/60'
              : 'glass-card-subtle text-slate-700 hover:bg-white/80 hover:border-slate-300'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xs transition-all ${
              value === true ? 'bg-emerald-600 text-white' : 'bg-white/80 text-slate-400'
            }`}
          >
            <Check className="w-5 h-5" />
          </div>
          <span>{t('yes', 'Yes')}</span>
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={`p-6 rounded-[24px] font-bold text-base transition-all flex flex-col items-center justify-center gap-3 border ${
            value === false
              ? 'bg-rose-500/15 border-rose-500 text-rose-950 shadow-md ring-2 ring-rose-300/60'
              : 'glass-card-subtle text-slate-700 hover:bg-white/80 hover:border-slate-300'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xs transition-all ${
              value === false ? 'bg-rose-600 text-white' : 'bg-white/80 text-slate-400'
            }`}
          >
            <span className="text-sm font-black">✕</span>
          </div>
          <span>{t('no', 'No')}</span>
        </button>
      </div>
    );
  }

  // 2. SINGLE_SELECT TYPE (Frosted Glass Option Pills)
  if (type === 'SINGLE_SELECT') {
    return (
      <div className="space-y-3 max-w-xl mx-auto">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const label = getLocalized(opt.label);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`w-full p-4 sm:p-4.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-glass border-orange-400 ring-2 ring-orange-200/50 font-bold'
                  : 'glass-card-subtle text-slate-700 hover:bg-white/80 hover:border-white'
              }`}
            >
              <span className="text-xs sm:text-sm pr-3 leading-snug">{label}</span>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500 text-white shadow-xs'
                    : 'border-slate-300/80 bg-white/60'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // 3. MULTI_SELECT TYPE (Checkable Glass Option Pills)
  if (type === 'MULTI_SELECT') {
    const selectedValues = Array.isArray(value) ? value : [];

    const handleToggle = (optVal) => {
      if (selectedValues.includes(optVal)) {
        onChange(selectedValues.filter((v) => v !== optVal));
      } else {
        onChange([...selectedValues, optVal]);
      }
    };

    return (
      <div className="space-y-3 max-w-xl mx-auto">
        {options.map((opt) => {
          const isChecked = selectedValues.includes(opt.value);
          const label = getLocalized(opt.label);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleToggle(opt.value)}
              className={`w-full p-4 sm:p-4.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                isChecked
                  ? 'bg-white text-slate-900 shadow-glass border-emerald-500 ring-2 ring-emerald-200/50 font-bold'
                  : 'glass-card-subtle text-slate-700 hover:bg-white/80 hover:border-white'
              }`}
            >
              <span className="text-xs sm:text-sm pr-3 leading-snug">{label}</span>
              <div
                className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                  isChecked
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                    : 'border-slate-300/80 bg-white/60'
                }`}
              >
                {isChecked && <Check className="w-3.5 h-3.5" />}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // 4. NUMBER TYPE (Frosted Glass Pill Input)
  if (type === 'NUMBER') {
    return (
      <div className="max-w-md mx-auto">
        <input
          type="number"
          value={value !== undefined && value !== null ? value : ''}
          onChange={(e) => {
            const val = e.target.value === '' ? '' : Number(e.target.value);
            onChange(val);
          }}
          min={question.min}
          max={question.max}
          placeholder={
            getLocalized(placeholder) || t('typeNumberPlaceholder', 'Enter number...')
          }
          className="w-full text-center text-xl sm:text-2xl font-black py-4 px-6 rounded-full glass-input text-slate-900 focus:outline-none"
        />
      </div>
    );
  }

  // 5. DATE TYPE
  if (type === 'DATE') {
    return (
      <div className="max-w-md mx-auto">
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-center text-sm sm:text-base font-bold py-3.5 px-6 rounded-full glass-input text-slate-900 focus:outline-none"
        />
      </div>
    );
  }

  // 6. TEXT TYPE
  return (
    <div className="max-w-md mx-auto">
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getLocalized(placeholder) || t('typeTextPlaceholder', 'Type your answer...')}
        className="w-full text-center text-sm sm:text-base font-semibold py-3.5 px-6 rounded-full glass-input text-slate-900 focus:outline-none"
      />
    </div>
  );
};
