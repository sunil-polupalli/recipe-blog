import fs from 'fs';
import { Feed } from 'feed';
import { getRecipes } from './api';

export const generateRssFeed = async () => {
  const recipes = await getRecipes('en');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const feed = new Feed({
    title: "Recipe Blog",
    description: "Delicious recipes from around the world",
    id: siteUrl,
    link: siteUrl,
    language: "en",
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    updated: new Date(),
    generator: "Next.js using Feed for Node.js",
  });

  recipes.forEach((recipe: any) => {
    feed.addItem({
      title: recipe.title,
      id: `${siteUrl}/recipes/${recipe.slug}`,
      link: `${siteUrl}/recipes/${recipe.slug}`,
      description: `Check out this delicious recipe for ${recipe.title}!`,
      date: new Date(),
      image: recipe.featuredImage?.url
    });
  });

  fs.writeFileSync('./public/rss.xml', feed.rss2());
};