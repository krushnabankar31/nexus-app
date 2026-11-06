import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://nexus-app-ashy-theta.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/discover',
          '/login',
          '/signup',
          '/privacy',
          '/terms',
          '/security',
          '/status',
        ],
        disallow: [
          '/messages/',
          '/messages/*',
          '/settings/',
          '/settings/*',
          '/c/*/admin',
          '/c/*/voice/*',
          '/api/',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
