import type { MetadataRoute } from 'next';
import { execSync } from 'child_process';
import { CHAPTERS } from '@/lib/constants';

const BASE_URL = 'https://patentworld.vercel.app';

function getGitDate(filePath: string): Date {
  try {
    const date = execSync(`git log -1 --format=%cI -- ${filePath}`, { encoding: 'utf-8' }).trim();
    return date ? new Date(date) : new Date('2026-02-20');
  } catch {
    return new Date('2026-02-20');
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const chapterEntries = CHAPTERS.map((ch) => ({
    url: `${BASE_URL}/chapters/${ch.slug}/`,
    lastModified: getGitDate(`src/app/chapters/${ch.slug}/page.tsx`),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: getGitDate('src/app/page.tsx'),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/methodology/`,
      lastModified: getGitDate('src/app/methodology/page.tsx'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about/`,
      lastModified: getGitDate('src/app/about/page.tsx'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/explore/`,
      lastModified: getGitDate('src/app/explore/page.tsx'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/chapters/deep-dive-overview/`,
      lastModified: getGitDate('src/app/chapters/deep-dive-overview/page.tsx'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...chapterEntries,
  ];
}
