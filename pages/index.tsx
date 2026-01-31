import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getRecipes } from '@/lib/api';
import { Recipe } from '@/types';
import RecipeCard from '@/components/RecipeCard';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Newsletter from '@/components/Newsletter';
import { generateRssFeed } from '@/lib/generate-rss';

interface HomeProps {
  recipes: Recipe[];
}

export default function Home({ recipes }: HomeProps) {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>{t('app_title')} • Modern Recipe Blog</title>
        <meta name="description" content={t('hero_subtitle')} />
      </Head>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('app_title')}</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="bg-emerald-900 text-white py-20 px-4 mb-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('hero_title')}</h2>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            {t('hero_subtitle')}
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
          <h2 className="text-3xl font-bold text-slate-900">{t('latest_recipes')}</h2>
          <span className="text-slate-500 text-sm hidden sm:inline-block">
            {recipes.length} {t('recipes_available')}
          </span>
        </div>
        
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          data-testid="featured-recipes"
        >
          {recipes.map((recipe) => (
            <div key={recipe.slug} data-testid="recipe-card">
               <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>

        {recipes.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-lg">{t('no_recipes')}</p>
          </div>
        )}

        <div className="mt-20">
           <Newsletter />
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  if (locale === 'en') {
      try { await generateRssFeed(); } catch (e) { console.error('RSS Error:', e); }
  }
  const recipes = await getRecipes(locale || 'en');
  const featured = recipes.filter((r: any) => r.isFeatured);
  
  return {
    props: {
      recipes: featured.length > 0 ? featured : recipes,
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
    revalidate: 60,
  };
};