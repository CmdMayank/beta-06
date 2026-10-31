import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { schemeApi } from '../services/schemeApi';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { FilterSidebar } from '../components/schemes/FilterSidebar';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Search, Filter, X } from 'lucide-react';

export const SchemesPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state initialized from URL search params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    level: searchParams.get('level') || 'all',
    state: searchParams.get('state') || 'ALL',
  });

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const newFilters = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || 'all',
      level: searchParams.get('level') || 'all',
      state: searchParams.get('state') || 'ALL',
    };
    setFilters(newFilters);
  }, [searchParams]);

  // Fetch schemes whenever filters change
  const fetchSchemes = () => {
    setLoading(true);
    setError(null);

    schemeApi
      .getSchemes(filters)
      .then((data) => {
        setSchemes(data.schemes || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load schemes.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSchemes();
  }, [filters]);

  const updateFilter = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);

    const params = new URLSearchParams();
    if (updated.search) params.set('search', updated.search);
    if (updated.category !== 'all') params.set('category', updated.category);
    if (updated.level !== 'all') params.set('level', updated.level);
    if (updated.state !== 'ALL') params.set('state', updated.state);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    const resetState = {
      search: '',
      category: 'all',
      level: 'all',
      state: 'ALL',
    };
    setFilters(resetState);
    setSearchParams({});
  };

  const hasActiveFilters =
    filters.search ||
    filters.category !== 'all' ||
    filters.level !== 'all' ||
    filters.state !== 'ALL';

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-card-subtle text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-2">
            Catalog & Discovery
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5">
            {t('exploreTitle', 'Explore Government Schemes')}
          </h1>
          <p className="text-sm text-slate-600">
            {t(
              'exploreSubtitle',
              'Search and filter through Central and State Government welfare programs'
            )}
          </p>
        </div>

        {/* Search & Mobile Filter Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder={t('searchSchemesInput', 'Search by scheme name or keyword...')}
              className="w-full pl-11 pr-10 py-3 glass-input rounded-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => updateFilter('search', '')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-5 py-3 glass-panel rounded-full text-xs font-bold text-slate-800 shadow-glass"
          >
            <Filter className="w-4 h-4 text-orange-500" />
            <span>{t('filterTitle', 'Filters')}</span>
          </button>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
            <span className="text-slate-500 font-semibold">Active Filters:</span>
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-card-subtle text-orange-950 font-bold border border-orange-200">
                <span>Category: {filters.category}</span>
                <button
                  type="button"
                  onClick={() => updateFilter('category', 'all')}
                  className="hover:text-black"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.level !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-card-subtle text-blue-950 font-bold border border-blue-200 capitalize">
                <span>Level: {filters.level}</span>
                <button
                  type="button"
                  onClick={() => updateFilter('level', 'all')}
                  className="hover:text-black"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.state !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-card-subtle text-emerald-950 font-bold border border-emerald-200">
                <span>State: {filters.state}</span>
                <button
                  type="button"
                  onClick={() => updateFilter('state', 'ALL')}
                  className="hover:text-black"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-orange-700 hover:underline font-bold ml-1 text-xs"
            >
              {t('filterClearAll', 'Clear All')}
            </button>
          </div>
        )}

        {/* Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block glass-panel p-6 rounded-[28px] shadow-glass h-fit sticky top-24 border border-white/80">
            <FilterSidebar
              filters={filters}
              onChange={updateFilter}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Scheme Cards Stream */}
          <main className="lg:col-span-3">
            {/* Header / Scheme Count */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500">
                {t('showingResults', 'Showing')} {schemes.length} {t('schemesCount', 'schemes')}
              </span>
            </div>

            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState
                title={t('errorTitle', 'Something went wrong')}
                message={error}
                onRetry={fetchSchemes}
              />
            ) : schemes.length === 0 ? (
              <EmptyState
                title={t('noSchemesFound', 'No schemes match your criteria')}
                description={t(
                  'noSchemesFoundDesc',
                  "Try adjusting your search terms, changing the category, or selecting 'All States'."
                )}
                actionText={t('resetFilters', 'Reset All Filters')}
                onAction={handleResetFilters}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schemes.map((scheme) => (
                  <SchemeCard key={scheme.id || scheme.code} scheme={scheme} />
                ))}
              </div>
            )}
          </main>

        </div>

      </div>

      {/* Mobile Drawer Filter Dialog */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-md lg:hidden flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xs glass-panel h-full p-6 overflow-y-auto shadow-2xl border-l border-white/80">
            <FilterSidebar
              filters={filters}
              onChange={updateFilter}
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
