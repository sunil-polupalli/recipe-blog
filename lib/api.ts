import axios from 'axios';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

const GRAPHQL_ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}`;

// Helper: Fix locale mismatch
// We map 'en' -> 'en-US' because that is your default.
// We map 'es' -> 'es' (NOT es-US) because that is what your logs say you have.
const fixLocale = (locale: string) => {
  if (locale === 'en') return 'en-US'; 
  if (locale === 'es') return 'es'; // <--- CHANGED THIS back to 'es'
  if (locale === 'fr') return 'fr';
  return locale;
};

const fetchGraphQL = async (query: string, variables = {}) => {
  try {
    const response = await axios.post(
      GRAPHQL_ENDPOINT,
      { query, variables },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.errors) {
        console.error("❌ CONTENTFUL API ERROR:", JSON.stringify(response.data.errors, null, 2));
    }

    return response.data;
  } catch (error) {
    console.error('Error connecting to Contentful:', error);
    throw error;
  }
};

export const getRecipes = async (locale: string = 'en', preview: boolean = false) => {
  const contentfulLocale = fixLocale(locale);
  
  const query = `
    query($locale: String!, $preview: Boolean!) {
      recipeCollection(locale: $locale, preview: $preview, order: sys_publishedAt_DESC) {
        items {
          title
          slug
          featuredImage { url width height }
          cuisine { name slug }
          difficulty
          cookingTime
          isFeatured
          tagsCollection { items { name } }
          description { json }
        }
      }
    }
  `;

  const response = await fetchGraphQL(query, { locale: contentfulLocale, preview });
  return response?.data?.recipeCollection?.items || [];
};

export const getRecipeBySlug = async (slug: string, locale: string = 'en', preview: boolean = false) => {
  const contentfulLocale = fixLocale(locale);

  const query = `
    query($slug: String!, $locale: String!, $preview: Boolean!) {
      recipeCollection(where: { slug: $slug }, locale: $locale, preview: $preview, limit: 1) {
        items {
          title
          slug
          featuredImage { url width height }
          videoUrl
          cuisine { name slug }
          difficulty
          cookingTime
          tagsCollection { items { name } }
          ingredients { json }
          instructions { json }
          description { json }
        }
      }
    }
  `;

  const response = await fetchGraphQL(query, { slug, locale: contentfulLocale, preview });
  return response?.data?.recipeCollection?.items[0] || null;
};