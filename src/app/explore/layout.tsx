import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Patent Data — Search Assignees, Inventors & Technologies',
  description: 'Search and sort 9.36M US patents by assignee, inventor, CPC technology class, and WIPO field. Interactive data tables with filtering and ranking.',
  alternates: {
    canonical: 'https://patentworld.vercel.app/explore/',
  },
  openGraph: {
    type: 'website',
    title: 'Explore Patent Data | PatentWorld',
    description: 'Search and sort 9.36M US patents by assignee, inventor, CPC technology class, and WIPO field.',
    url: 'https://patentworld.vercel.app/explore/',
    siteName: 'PatentWorld',
    images: [{ url: 'https://patentworld.vercel.app/og/home.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Patent Data | PatentWorld',
    description: 'Search and sort 9.36M US patents by assignee, inventor, CPC technology class, and WIPO field.',
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
