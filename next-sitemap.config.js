/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  generateRobotsTxt: true,
  // This ensures we get sitemaps for all languages
  i18n: {
    locales: ['en', 'es', 'fr'],
    defaultLocale: 'en',
  },
}