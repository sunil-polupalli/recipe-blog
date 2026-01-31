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
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}${router.asPath}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(recipe?.title || '')}`;

  if (router.isFallback) return <div>Loading...</div>;
  if (!recipe) return <div>Not Found</div>;

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b p-4 sticky top-0 z-10 print:hidden">
         {/* ... header content ... */}
         <LanguageSwitcher />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* ADD DATA-TESTID HERE */}
        <h1 data-testid="recipe-title" className="text-4xl font-bold mb-4">{recipe.title}</h1>
        
        {/* ... image ... */}

        {/* ADD SHARE BUTTON */}
        <div className="my-4 print:hidden">
            <a 
              href={twitterUrl}
              data-testid="social-share-twitter" // <--- REQUIRED ID
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-400 text-white px-4 py-2 rounded"
            >
              Share on Twitter
            </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-blue-50 p-6 rounded-lg h-fit">
                <h2 className="text-xl font-bold mb-4">{t('ingredients')}</h2>
                {/* ADD DATA-TESTID HERE */}
                <div data-testid="recipe-ingredients">
                    {recipe.ingredients?.json ? documentToReactComponents(recipe.ingredients.json, richTextOptions) : null}
                </div>
            </div>

            <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-4">{t('instructions')}</h2>
                 {/* ADD DATA-TESTID HERE */}
                 <div data-testid="recipe-instructions">
                    {recipe.instructions?.json ? documentToReactComponents(recipe.instructions.json, richTextOptions) : null}
                 </div>
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