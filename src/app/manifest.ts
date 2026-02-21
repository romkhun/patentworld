import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PatentWorld',
    short_name: 'PatentWorld',
    description: 'Interactive exploration of 9.36 million US patents (1976–2025)',
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#1e293b',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
  };
}
