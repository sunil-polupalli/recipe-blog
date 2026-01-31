import Link from 'next/link';
import Image from 'next/image';
import { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { title, slug, featuredImage, description, difficulty, cookingTime } = recipe;

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white" data-testid="recipe-card">
      <div className="relative h-48 w-full">
        {featuredImage?.url && (
          <Image
            src={featuredImage.url}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{difficulty}</span>
          <span>•</span>
          <span>{cookingTime} mins</span>
        </div>
        <div className="text-gray-600 line-clamp-2 mb-4">
          {/* Render simple text from rich text if needed, here we just show a snippet */}
          View recipe for details...
        </div>
        <Link 
          href={`/recipes/${slug}`}
          className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          View Recipe
        </Link>
      </div>
    </div>
  );
}