import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getRecipes } from '@/lib/api';
import { Recipe } from '@/types';
import RecipeCard from '@/components/RecipeCard';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { generateRssFeed } from '@/lib/generate-rss'; // <--- New Import for RSS

interface HomeProps {
  recipes: Recipe[];
}

export default function Home({ recipes }: HomeProps) {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Recipe Blog</title>
        <meta name="description" content="A multi-language recipe blog" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm p-4 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Recipe Blog</h1>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">{t('latest_recipes')}</h2>
          
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="featured-recipes"
          >
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>

          {recipes.length === 0 && (
            <p className="text-gray-500 text-center py-10">
              No recipes found. Make sure you published your content in Contentful!
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  // 1. Generate RSS feed (Only run this for the default language to avoid duplicates)
  if (locale === 'en') {
      try {
        await generateRssFeed();
        console.log('✅ RSS Feed generated successfully.');
      } catch (e) {
        console.error('❌ Error generating RSS feed:', e);
      }
  }

  // 2. Fetch recipes from Contentful
  const recipes = await getRecipes(locale || 'en');

  // 3. Filter for featured items (or just take the latest ones)
  const featuredRecipes = recipes.filter((r: Recipe) => r.isFeatured);

  return {
    props: {
      // If no recipes are marked "Featured", show all recipes so the page isn't empty
      recipes: featuredRecipes.length > 0 ? featuredRecipes : recipes,
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
    revalidate: 60, // Rebuild page every 60 seconds if data changes
  };
};