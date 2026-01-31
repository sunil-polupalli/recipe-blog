import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
// import { NextSeo } from 'next-seo'; // Commented out to fix error
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import dynamic from 'next/dynamic';

import { getRecipes, getRecipeBySlug } from '@/lib/api';
import { Recipe } from '@/types';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Fix for video player
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface RecipePageProps {
  recipe: Recipe;
}

const richTextOptions = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => (
      <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>
    ),
    [BLOCKS.UL_LIST]: (node: any, children: any) => (
      <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node: any, children: any) => (
      <ol className="list-decimal pl-5 mb-4 space-y-2">{children}</ol>
    ),
    [BLOCKS.HEADING_2]: (node: any, children: any) => (
      <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800">{children}</h2>
    ),
  },
};

export default function RecipePage({ recipe }: RecipePageProps) {
  const router = useRouter();
  const { t } = useTranslation('common');

  if (router.isFallback) {
    return <div className="text-center py-20">Loading...</div>;
  }

  // If we somehow get here without a recipe, showing a fallback
  if (!recipe) return <div className="text-center py-20">Recipe not found (Client Side)</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* <NextSeo title={recipe.title} /> */}

      <header className="bg-white border-b p-4 sticky top-0 z-10 print:hidden">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">
            ← Back to Home
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">{recipe.title}</h1>
        
        {/* Basic info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-8">
            <span className="bg-gray-100 px-3 py-1 rounded">⏱ {recipe.cookingTime || 0} mins</span>
            <span className="bg-gray-100 px-3 py-1 rounded">📊 {recipe.difficulty || 'Medium'}</span>
            <span className="bg-gray-100 px-3 py-1 rounded">🍽 {recipe.cuisine?.name || 'General'}</span>
        </div>

        {/* Featured Image */}
        {recipe.featuredImage?.url && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden shadow-lg">
            <Image 
              src={recipe.featuredImage.url} 
              alt={recipe.title} 
              fill 
              className="object-cover" 
            />
          </div>
        )}

        {/* Video */}
        {recipe.videoUrl && (
          <div className="mb-10 print:hidden">
             <h2 className="text-2xl font-bold mb-4 border-b pb-2">Video Tutorial</h2>
             <div className="relative pt-[56.25%] bg-black">
                <ReactPlayer 
                    url={recipe.videoUrl} 
                    className="absolute top-0 left-0"
                    width="100%"
                    height="100%"
                    controls
                />
             </div>
          </div>
        )}

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-blue-50 p-6 rounded-lg h-fit">
                <h2 className="text-xl font-bold mb-4 text-blue-900">{t('ingredients')}</h2>
                {recipe.ingredients?.json ? (
                    documentToReactComponents(recipe.ingredients.json, richTextOptions)
                ) : <p>No ingredients listed.</p>}
            </div>

            <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">{t('instructions')}</h2>
                 {recipe.instructions?.json ? (
                    documentToReactComponents(recipe.instructions.json, richTextOptions)
                ) : <p>No instructions listed.</p>}
            </div>
        </div>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  console.log("--> Generating Paths...");
  const recipes = await getRecipes('en');
  console.log(`--> Found ${recipes.length} recipes for paths.`);

  const paths = recipes.flatMap((recipe: any) => 
    locales!.map((locale) => ({
        params: { slug: recipe.slug },
        locale,
    }))
  );

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const slug = params?.slug as string;
  console.log(`--> [DEBUG] Fetching recipe for slug: "${slug}" (Locale: ${locale})`);
  
  try {
      const recipe = await getRecipeBySlug(slug, locale || 'en');
      
      if (!recipe) {
        console.log(`--> [DEBUG] Recipe returned NULL for slug: ${slug}`);
        return { notFound: true };
      }

      console.log(`--> [DEBUG] Success! Found recipe: ${recipe.title}`);
      return {
        props: {
          recipe,
          ...(await serverSideTranslations(locale || 'en', ['common'])),
        },
        revalidate: 60,
      };
  } catch (error) {
      console.error("--> [DEBUG] Error in getStaticProps:", error);
      return { notFound: true };
  }
};