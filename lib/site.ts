// The site's own address, for anything that needs an absolute URL: the
// link-preview image, the sitemap and the search-engine data on the home
// page. Vercel provides the project's production domain at build time, so
// this follows a domain change on the next deploy without any edit here.
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
