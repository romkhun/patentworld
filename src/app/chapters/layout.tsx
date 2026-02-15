import { ChapterSidebar } from '@/components/layout/ChapterSidebar';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ChapterTableOfContents } from '@/components/chapter/ChapterTableOfContents';

export default function ChaptersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <ChapterSidebar />
      <div className="lg:ml-64">
        <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
          <Breadcrumb />
          <ChapterTableOfContents />
          <article itemScope itemType="https://schema.org/ScholarlyArticle">
            {children}
          </article>
        </div>
      </div>
    </div>
  );
}
