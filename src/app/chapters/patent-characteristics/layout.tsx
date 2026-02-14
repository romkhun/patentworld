import { chapterMetadata, chapterJsonLd } from '@/lib/seo';

const SLUG = 'patent-characteristics';
export const metadata = chapterMetadata(SLUG);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(chapterJsonLd(SLUG)) }}
      />
      {children}
    </>
  );
}
