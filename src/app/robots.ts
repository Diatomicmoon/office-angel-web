import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/crm/',
        '/dispatch/',
        '/financials/',
        '/canvassing/',
        '/settings/',
        '/api/'
      ],
    },
    sitemap: 'https://hardhat-solutions.com/sitemap.xml',
  };
}
