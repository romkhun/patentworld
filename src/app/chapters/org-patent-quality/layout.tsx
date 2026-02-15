import { chapterMetadata, chapterJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';

const SLUG = 'org-patent-quality';
export const metadata = chapterMetadata(SLUG);

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = chapterJsonLd(SLUG);
  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      {children}
    </>
  );
}
