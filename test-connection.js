require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const SPACE = process.env.CONTENTFUL_SPACE_ID;
const TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

console.log("---------------------------------------------------");
console.log("Testing Contentful Connection...");
console.log("Space ID:", SPACE);
console.log("Token:", TOKEN ? TOKEN.substring(0, 10) + "..." : "MISSING");
console.log("---------------------------------------------------");

async function testConnection() {
  try {
    const response = await axios.post(
      `https://graphql.contentful.com/content/v1/spaces/${SPACE}`,
      {
        query: `query { recipeCollection { items { title slug } } }`
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("✅ SUCCESS! Connected to Contentful.");
    console.log("Recipes Found:", response.data.data.recipeCollection.items);
  } catch (error) {
    console.log("❌ ERROR: Could not connect.");
    if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Message:", error.response.data);
    } else {
        console.log("Error:", error.message);
    }
  }
}

testConnection();