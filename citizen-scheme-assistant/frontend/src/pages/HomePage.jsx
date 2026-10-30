import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { SearchBar } from '../components/home/SearchBar';
import { CategoryCard } from '../components/home/CategoryCard';
import { HowItWorks } from '../components/home/HowItWorks';
import { FeaturedSchemes } from '../components/home/FeaturedSchemes';
import { TrustPrivacy } from '../components/home/TrustPrivacy';
import { useLanguage } from '../i18n/LanguageContext';

export const HomePage = () => {
  const { t } = useLanguage();

  const categories = [
    { id: 'agriculture', titleKey: 'catAgriculture', descKey: 'catAgricultureDesc' },
    { id: 'women-child', titleKey: 'catWomenChild', descKey: 'catWomenChildDesc' },
    { id: 'education', titleKey: 'catEducation', descKey: 'catEducationDesc' },
    { id: 'health', titleKey: 'catHealth', descKey: 'catHealthDesc' },
    { id: 'housing', titleKey: 'catHousing', descKey: 'catHousingDesc' },
    { id: 'employment', titleKey: 'catEmployment', descKey: 'catEmploymentDesc' },
    { id: 'business', titleKey: 'catBusiness', descKey: 'catBusinessDesc' },
    { id: 'social-welfare', titleKey: 'catSocialWelfare', descKey: 'catSocialWelfareDesc' },
  ];

  return (
    <div className="flex-1 relative">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Search Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 z-20">
        <SearchBar />
      </section>

      {/* 3. Popular Categories */}
      <section className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <span className="inline-block px-3.5 py-1 rounded-full glass-card-subtle text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-2">
            Targeted Welfare
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            {t('categoriesHeading', 'Browse by Category')}
          </h2>
          <p className="text-sm text-slate-600">
            {t(
              'categoriesSubheading',
              'Find schemes tailored to your occupation, family needs, and life stage'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              categoryId={cat.id}
              titleKey={cat.titleKey}
              descKey={cat.descKey}
            />
          ))}
        </div>
      </section>

      {/* 4. How It Works */}
      <HowItWorks />

      {/* 5. Featured Schemes */}
      <FeaturedSchemes />

      {/* 6. Trust & Privacy */}
      <TrustPrivacy />
    </div>
  );
};
