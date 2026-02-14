'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface TocSection {
  id: string;
  label: string;
}

export function ChapterTableOfContents() {
  const [sections, setSections] = useState<TocSection[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = document.querySelectorAll('[data-section-label]');
    const found: TocSection[] = [];
    elements.forEach((el) => {
      const id = el.id;
      const label = el.getAttribute('data-section-label');
      if (id && label) {
        found.push({ id, label });
      }
    });
    setSections(found);

    if (found.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the first entry that is intersecting
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          setActiveId(intersecting[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    elements.forEach((el) => {
      if (el.id) {
        observerRef.current?.observe(el);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', `#${id}`);
    }
    setMobileOpen(false);
  }, []);

  if (sections.length === 0) return null;

  const linkList = (
    <nav aria-label="Chapter table of contents">
      <ul className="space-y-1">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={(e) => handleClick(e, section.id)}
              className={`block rounded px-2 py-1 text-sm transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                activeId === section.id
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Desktop: fixed side panel on xl+ screens */}
      <div className="hidden xl:block fixed right-8 top-20 w-52 z-40">
        <div className="rounded-lg border border-border bg-background/80 backdrop-blur-sm p-4">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            In this chapter
          </h2>
          {linkList}
        </div>
      </div>

      {/* Mobile/Tablet: collapsible block (below xl) */}
      <div className="xl:hidden mb-8">
        <details open={mobileOpen} onToggle={(e) => setMobileOpen((e.target as HTMLDetailsElement).open)}>
          <summary className="cursor-pointer rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            In this chapter ({sections.length} sections)
          </summary>
          <div className="mt-2 rounded-lg border border-border bg-background p-4">
            {linkList}
          </div>
        </details>
      </div>
    </>
  );
}
