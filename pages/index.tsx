import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getRecipes } from '@/lib/api';
import { Recipe } from '@/types';
import RecipeCard from '@/components/RecipeCard';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface RecipesIndexProps {
  recipes: Recipe[];
  categories: string[];
}

export default function RecipesIndex({ recipes, categories }: RecipesIndexProps) {
  const { t } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory 
      ? recipe.cuisine?.name === selectedCategory 
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Head><title>All Recipes</title></Head>
      <header className="bg-white shadow-sm p-4 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Recipe Blog</h1>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            data-testid="search-input" // <--- REQUIRED ID
            placeholder="Search..."
            className="border p-3 rounded-lg w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            data-testid="category-filter" // <--- REQUIRED ID
            className="border p-3 rounded-lg w-full md:w-1/3"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const recipes = await getRecipes(locale || 'en');
  const categories = Array.from(new Set(recipes.map((r: any) => r.cuisine?.name).filter(Boolean)));
  return {
    props: {
      recipes,
      categories,
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
    revalidate: 60,
  };
};