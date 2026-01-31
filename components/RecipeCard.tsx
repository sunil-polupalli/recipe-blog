import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { t } = useTranslation('common');

  return (
    <Link href={`/recipes/${recipe.slug}`} className="group block h-full">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {recipe.featuredImage?.url ? (
            <Image
              src={recipe.featuredImage.url}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
              No Image
            </div>
          )}
          
          {/* Difficulty Badge (Overlay) */}
          {recipe.difficulty && (
            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
              {recipe.difficulty}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider">
              {recipe.cuisine?.name || 'General'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-xs">
              {recipe.cookingTime} {t('mins')}
            </span>
          </div>

          <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-emerald-600 transition-colors">
            {recipe.title}
          </h3>

          <div className="mt-auto pt-4 flex items-center text-sm font-medium text-emerald-600 group-hover:underline decoration-2 underline-offset-2">
            {t('view_recipe')} →
          </div>
        </div>
      </div>
    </Link>
  );
}