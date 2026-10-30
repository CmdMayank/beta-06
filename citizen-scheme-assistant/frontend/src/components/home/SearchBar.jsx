import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { Search, ArrowRight } from 'lucide-react';

export const SearchBar = ({ onSearch, initialValue = '', className = '' }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/schemes?search=${encodeURIComponent(query)}`);
    }
  };

  const handleQuickTag = (tag) => {
    setQuery(tag);
    if (onSearch) {
      onSearch(tag);
    } else {
      navigate(`/schemes?search=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-panel rounded-full p-2 pl-4 flex items-center shadow-glass border border-white/80 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100/50 transition-all">
          <div className="pr-2 text-slate-400">
            <Search className="w-5 h-5" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              'searchPlaceholder',
              'Search schemes by name, keyword or benefit (e.g., KISAN, Awas, Pension)...'
            )}
            className="w-full py-2.5 pr-3 text-slate-900 placeholder-slate-400 bg-transparent text-xs sm:text-sm font-medium focus:outline-none"
            aria-label="Search schemes"
          />
          <button
            type="submit"
            className="glass-dark-pill shrink-0 px-5 py-2.5 rounded-full text-xs font-semibold text-white tracking-wide hover:bg-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>{t('searchButton', 'Search Schemes')}</span>
            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowRight className="w-2.5 h-2.5 text-white" />
            </div>
          </button>
        </div>
      </form>

      {/* Popular quick tags */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-600">{t('popularSearchesLabel', 'Popular:')}</span>
        {['PM-KISAN', 'Awas Yojana', 'Ujjwala', 'Vishwakarma', 'Ayushman', 'Ladli Behna'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleQuickTag(tag)}
            className="glass-card-subtle px-3 py-1 rounded-full text-slate-700 hover:text-slate-950 hover:bg-white transition-all shadow-2xs text-[11px] font-semibold"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
