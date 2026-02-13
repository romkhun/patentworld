import { ChapterSidebar } from '@/components/layout/ChapterSidebar';

export default function ChaptersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <ChapterSidebar />
      <div className="lg:ml-64">
        <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
