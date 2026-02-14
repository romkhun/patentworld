import type { MetadataRoute } from 'next';
import { CHAPTERS } from '@/lib/constants';

const BASE_URL = 'https://patentworld.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const chapterEntries = CHAPTERS.map((ch) => ({
    url: `${BASE_URL}/chapters/${ch.slug}/`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/explore/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/faq/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...chapterEntries,
  ];
}
