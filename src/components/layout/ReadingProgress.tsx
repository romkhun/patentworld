'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const isChapter = pathname?.startsWith('/chapters/');

  useEffect(() => {
    if (!isChapter) return;

    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isChapter]);

  if (!isChapter) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-0.5" aria-hidden="true">
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
