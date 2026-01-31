require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

async function checkLocales() {
  console.log("🔍 Checking Contentful Locales...");

  try {
    // 1. Fetch the Space Details to see available Locales
    const response = await axios.get(
      `https://api.contentful.com/spaces/${SPACE_ID}/locales`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CONTENTFUL_MANAGEMENT_TOKEN || ACCESS_TOKEN}`, 
          // Note: Standard Delivery Token (ACCESS_TOKEN) might not allow listing locales. 
          // If this fails, we will try a different trick below.
        }
      }
    );
    
    console.log("\n✅ AVAILABLE LOCALES IN CONTENTFUL:");
    response.data.items.forEach(locale => {
      console.log(`- Name: ${locale.name} | Code: ${locale.code} | Default: ${locale.default}`);
    });

  } catch (e) {
    // Fallback: If we can't list locales (permissions), let's try to fetch a recipe with different codes
    console.log("⚠️ Could not list locales directly (Permission issue). Trying to guess by fetching...");
    
    const codesToTry = ['es', 'es-ES', 'es-US', 'es-419', 'fr', 'fr-FR'];
    
    for (const code of codesToTry) {
        await testFetch(code);
    }
  }
}

async function testFetch(localeCode) {
    const query = `
    query($locale: String!) {
      recipeCollection(locale: $locale, limit: 1) {
        items {
          title
          ingredients { json }
        }
      }
    }
  `;
    
    try {
        const res = await axios.post(
            `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}`,
            { query, variables: { locale: localeCode } },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                },
            }
        );
        
        const items = res.data.data.recipeCollection.items;
        if (items.length > 0) {
             console.log(`\n✅ Testing Locale: "${localeCode}" -> SUCCESS`);
             console.log(`   Title: ${items[0].title}`);
             // check if it looks Spanish
        } else {
             console.log(`\n❌ Testing Locale: "${localeCode}" -> No items found`);
        }
    } catch (err) {
        console.log(`\n❌ Testing Locale: "${localeCode}" -> Failed (Likely invalid code)`);
    }
}

checkLocales();