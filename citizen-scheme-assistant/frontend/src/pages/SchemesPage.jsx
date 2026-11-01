import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { errorKey } from '../i18n/integration.js';
import { schemeApi } from '../services/schemeApi.js';
import { mockAdapter } from '../mock/mockAdapter.js';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { FilterSidebar } from '../components/schemes/FilterSidebar';
import { Search, Filter, X } from 'lucide-react';

export const PublishedCatalog = ({ data, loading, error, onResetFilters }) => {
  const { t } = useLanguage();
  if (error) {
    return (
      <div
        role="alert"
        className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium"
      >
        {error}
      </div>
    );
  }
  if (loading) {
    return (
      <p role="status" className="text-center py-12 text-slate-600 font-medium">
        {t('loading', 'Loading schemes...')}
      </p>
    );
  }
  if (!data?.items?.length) {
    return (
      <div
        role="status"
        className="glass-panel rounded-[28px] p-8 text-center text-slate-600 font-medium border border-white/80 shadow-glass"
      >
        <p className="text-base font-bold text-slate-800 mb-1">
          {t('emptyPublished', 'No published schemes')}
        </p>
        <p className="text-xs text-slate-500 mb-4">
          {t('noSchemesFoundDesc', "Try adjusting your search terms, changing the category, or selecting 'All States'.")}
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition shadow-xs"
          >
            {t('resetFilters', 'Reset All Filters')}
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.items.map((scheme) => (
        <SchemeCard key={scheme.id || scheme.code} scheme={scheme} />
      ))}
    </div>
  );
};

export const SchemesPage = () => {
  const { t, language } = useLanguage();
  const [params, setParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: params.get('category') || 'all',
    level: params.get('level') || 'all',
    state: params.get('state') || 'ALL',
  });

  const [offset, setOffset] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setFilters({
      search: params.get('search') || '',
      category: params.get('category') || 'all',
      level: params.get('level') || 'all',
      state: params.get('state') || 'ALL',
    });
  }, [params]);

  // Fetch schemes from backend or fallback to mock adapter
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    schemeApi
      .getSchemes({
        search: filters.search,
        level: filters.level,
        language,
        offset,
      })
      .then((r) => {
        if (!active) return;
        if (r && r.items && r.items.length > 0) {
          setData(r);
        } else {
          // If response has no items, try fallback mock schemes for rich local preview
          return mockAdapter.getSchemes(filters).then((mockRes) => {
            if (active) {
              setData({ items: mockRes.schemes, total: mockRes.total });
            }
          });
        }
      })
      .catch((e) => {
        if (!active) return;
        // In local development or preview when engine is offline, fallback to mock schemes
        return mockAdapter
          .getSchemes(filters)
          .then((mockRes) => {
            if (active && mockRes?.schemes?.length) {
              setData({ items: mockRes.schemes, total: mockRes.total });
              setError('');
            } else {
              setError(t(errorKey(e)));
              setData(null);
            }
          })
          .catch(() => {
            if (active) {
              setError(t(errorKey(e)));
              setData(null);
            }
          });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters.search, filters.level, language, offset]);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    setOffset(0);

    const newParams = new URLSearchParams(params);
    if (updated.search) newParams.set('search', updated.search);
    else newParams.delete('search');

    if (updated.category && updated.category !== 'all') newParams.set('category', updated.category);
    else newParams.delete('category');

    if (updated.level && updated.level !== 'all') newParams.set('level', updated.level);
    else newParams.delete('level');

    if (updated.state && updated.state !== 'ALL') newParams.set('state', updated.state);
    else newParams.delete('state');

    setParams(newParams);
  };

  const handleResetFilters = () => {
    const reset = {
      search: '',
      category: 'all',
      level: 'all',
      state: 'ALL',
    };
    setFilters(reset);
    setOffset(0);
    setParams({});
  };

  // Client-side filtering on items for category and state
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    let items = data.items.filter(Boolean);

    if (filters.category && filters.category !== 'all') {
      items = items.filter((item) => {
        if (item.category) return item.category === filters.category;
        // Keyword heuristic if item comes from engine without category tag
        const nameText = typeof item.name === 'object' ? `${item.name?.en || ''} ${item.name?.hi || ''}` : String(item.name || '');
        const descText = typeof item.description === 'object' ? `${item.description?.en || ''} ${item.description?.hi || ''}` : String(item.description || '');
        const text = `${nameText} ${descText}`.toLowerCase();
        if (filters.category === 'agriculture') return /kisan|farmer|crop|land|agri/.test(text);
        if (filters.category === 'women-child') return /women|mahila|child|ladli|girl|sukanya|maternity/.test(text);
        if (filters.category === 'education') return /education|scholarship|student|school|merit/.test(text);
        if (filters.category === 'health') return /health|arogya|ayushman|medical|hospital|bima/.test(text);
        if (filters.category === 'housing') return /awas|house|housing|shelter/.test(text);
        if (filters.category === 'employment') return /employ|skill|vishwakarma|kaushal|rogar|worker/.test(text);
        if (filters.category === 'business') return /loan|mudra|credit|svanidhi|vendor|business/.test(text);
        if (filters.category === 'social-welfare') return /pension|welfare|divyang|senior|elderly/.test(text);
        return true;
      });
    }

    if (filters.state && filters.state !== 'ALL') {
      items = items.filter((item) => {
        if (item.level === 'central') return true;
        if (item.state_code) return item.state_code === filters.state;
        if (item.applicable_states) {
          return item.applicable_states.includes('ALL') || item.applicable_states.includes(filters.state);
        }
        if (item.id && typeof item.id === 'string') {
          return item.id.toLowerCase().includes(filters.state.toLowerCase());
        }
        return true;
      });
    }

    return items;
  }, [data, filters.category, filters.state]);

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-card-subtle text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-2">
            Catalog & Discovery
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5">
            {t('exploreTitle', 'Explore Government Schemes')}
          </h1>
          <p className="text-sm text-slate-600">
            {t(
              'catalogueIntro',
              'Search and filter through Central and State Government welfare programs'
            )}
          </p>
        </div>

        {/* Content Layout: Filter Sidebar + Main Schemes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Main Schemes Area */}
          <main className="lg:col-span-3 space-y-6">
            {/* Top Toolbar: Result count, Search bar, and Mobile filter button */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-500">
                {t('showingResults', 'Showing')} {filteredItems.length} {t('schemesCount', 'schemes')}
              </span>

              <div className="flex items-center gap-3 flex-1 max-w-md ml-auto">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-10 py-2.5 glass-input rounded-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                    aria-label={t('searchSchemesInput', 'Search by scheme name or keyword...')}
                    placeholder={t('searchSchemesInput', 'Search by scheme name or keyword...')}
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                  {filters.search && (
                    <button
                      type="button"
                      onClick={() => handleFilterChange('search', '')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50 transition shrink-0"
                >
                  <Filter className="w-3.5 h-3.5 text-orange-500" />
                  <span>{t('filterTitle', 'Filters')}</span>
                </button>
              </div>
            </div>

            {/* Published Catalog Grid */}
            <PublishedCatalog
              data={{ items: filteredItems, total: filteredItems.length }}
              loading={loading}
              error={error}
              onResetFilters={handleResetFilters}
            />

            {/* Pagination */}
            {data?.total > 20 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                <button
                  type="button"
                  disabled={!offset || loading}
                  onClick={() => setOffset(Math.max(0, offset - 20))}
                  className="px-5 py-2.5 rounded-full text-xs font-bold glass-panel text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all shadow-glass"
                >
                  ← {t('btnBack', 'Previous')}
                </button>
                <span className="text-xs text-slate-500 font-semibold">
                  {offset + 1} - {Math.min(offset + 20, data.total)} of {data.total}
                </span>
                <button
                  type="button"
                  disabled={!data?.has_more || loading}
                  onClick={() => setOffset(offset + 20)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold glass-dark-pill disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black transition-all shadow-md"
                >
                  {t('btnNext', 'Next')} →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer Filter Dialog */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              isMobile={true}
              onCloseMobile={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
