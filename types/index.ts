import { Document } from '@contentful/rich-text-types';

export interface Category {
  name: string;
  slug: string;
}

export interface Tag {
  name: string;
}

export interface Recipe {
  title: string;
  slug: string;
  description: {
    json: Document;
  };
  ingredients: {
    json: Document;
  };
  instructions: {
    json: Document;
  };
  featuredImage: {
    url: string;
    width: number;
    height: number;
  };
  videoUrl?: string;
  cuisine: Category;
  difficulty: string;
  cookingTime: number;
  tags: {
    items: Tag[];
  };
  isFeatured: boolean;
  sys: {
    publishedAt: string;
  };
}

export interface RecipeCollection {
  recipeCollection: {
    items: Recipe[];
  };
}