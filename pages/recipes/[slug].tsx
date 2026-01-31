import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { getRecipes, getRecipeBySlug } from '@/lib/api';
import { Recipe } from '@/types';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

const richTextOptions = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => (
      <p className="mb-6 text-slate-700 leading-relaxed text-lg">{children}</p>
    ),
    [BLOCKS.UL_LIST]: (node: any, children: any) => (
      <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-700">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node: any, children: any) => (
      <ol className="list-decimal pl-6 mb-6 space-y-2 text-slate-700">{children}</ol>
    ),
    [BLOCKS.HEADING_2]: (node: any, children: any) => (
      <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900 border-l-4 border-emerald-500 pl-4">{children}</h2>
    ),
  },
};

interface RecipePageProps {
  recipe: Recipe;
}

export default function RecipePage({ recipe }: RecipePageProps) {
  const router = useRouter();
  const { t } = useTranslation('common');
  
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}${router.asPath}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(recipe?.title || '')}`;

  if (router.isFallback) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!recipe) return <div className="text-center py-20">{t('no_recipes')}</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/" className="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-2">
            ← <span className="hidden sm:inline">{t('back_to_home')}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {recipe.featuredImage?.url && (
            <div className="relative w-full h-[400px] md:h-[500px]">
              <Image 
                src={recipe.featuredImage.url} 
                alt={recipe.title} 
                fill 
                className="object-cover" 
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-3 inline-block">
                  {recipe.cuisine?.name}
                </span>
                <h1 data-testid="recipe-title" className="text-4xl md:text-5xl font-bold mb-4 shadow-black drop-shadow-lg">
                  {recipe.title}
                </h1>
                <div className="flex gap-6 text-sm md:text-base font-medium">
                  <span className="flex items-center gap-2">⏱ {recipe.cookingTime} {t('mins')}</span>
                  <span className="flex items-center gap-2">📊 {recipe.difficulty}</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex justify-end mb-8 print:hidden">
               <a 
                 href={twitterUrl}
                 data-testid="social-share-twitter"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm"
               >
                 {t('share_recipe')}
               </a>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                  <h2 className="text-xl font-bold mb-4 text-emerald-900 flex items-center gap-2">
                    🥕 {t('ingredients')}
                  </h2>
                  <div data-testid="recipe-ingredients" className="prose-sm prose-emerald">
                    {recipe.ingredients?.json ? (
                        documentToReactComponents(recipe.ingredients.json, richTextOptions)
                    ) : <p className="text-slate-500 italic">No ingredients listed.</p>}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                  📝 {t('instructions')}
                </h2>
                <div data-testid="recipe-instructions" className="prose prose-slate max-w-none">
                   {recipe.instructions?.json ? (
                      documentToReactComponents(recipe.instructions.json, richTextOptions)
                  ) : <p className="text-slate-500 italic">No instructions listed.</p>}
                </div>

                {recipe.videoUrl && (
                  <div className="mt-12 print:hidden rounded-2xl overflow-hidden shadow-lg border border-slate-200">
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const recipes = await getRecipes('en');
  const paths = recipes.flatMap((recipe: any) => 
    locales!.map((locale) => ({ params: { slug: recipe.slug }, locale }))
  );
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const recipe = await getRecipeBySlug(params?.slug as string, locale || 'en');
  if (!recipe) return { notFound: true };
  return {
    props: {
      recipe,
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
    revalidate: 60,
  };
};