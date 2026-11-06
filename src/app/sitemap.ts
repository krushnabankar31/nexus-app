import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nexus-app-ashy-theta.vercel.app';
  const currentDate = new Date().toISOString();

  const publicRoutes = [
    '',
    '/login',
    '/signup',
    '/discover',
    '/status',
    '/privacy',
    '/terms',
    '/security',
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/discover' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/discover' ? 0.8 : 0.5,
  }));
}
