'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface PWCompanySelectorProps {
  companies: string[];
  selected: string;
  onSelect: (company: string) => void;
}

export function PWCompanySelector({
  companies,
  selected,
  onSelect,
}: PWCompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = 'pw-company-selector-listbox';

  const filtered = query
    ? companies.filter((c) =>
        c.toLowerCase().includes(query.toLowerCase())
      )
    : companies;

  // Reset activeIndex when filtered list changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [filtered.length, query]);

  const handleSelect = useCallback(
    (company: string) => {
      onSelect(company);
      setQuery('');
      setOpen(false);
      setActiveIndex(-1);
    },
    [onSelect]
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery('');
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen(true);
          return;
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < filtered.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : filtered.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < filtered.length) {
            handleSelect(filtered[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setQuery('');
          setActiveIndex(-1);
          break;
        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(filtered.length - 1);
          break;
      }
    },
    [open, filtered, activeIndex, handleSelect]
  );

  const activeDescendantId =
    activeIndex >= 0 && activeIndex < filtered.length
      ? `pw-company-option-${activeIndex}`
      : undefined;

  return (
    <div ref={containerRef} className="relative w-full max-w-sm" onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={open ? activeDescendantId : undefined}
        className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-accent/50 transition-colors"
      >
        <span className="truncate">{selected || 'Select a company...'}</span>
        <svg
          className={`ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border bg-card shadow-lg">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies..."
              aria-label="Search companies"
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-activedescendant={activeDescendantId}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Companies"
            className="max-h-60 overflow-y-auto px-1 pb-1"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground" role="presentation">
                No companies found
              </li>
            )}
            {filtered.map((company, index) => (
              <li
                key={company}
                id={`pw-company-option-${index}`}
                role="option"
                aria-selected={company === selected}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => handleSelect(company)}
                  className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent/50 ${
                    company === selected
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-foreground'
                  } ${index === activeIndex ? 'bg-accent/70 outline-none' : ''}`}
                >
                  {company}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
