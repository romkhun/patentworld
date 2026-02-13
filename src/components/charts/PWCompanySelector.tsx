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
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? companies.filter((c) =>
        c.toLowerCase().includes(query.toLowerCase())
      )
    : companies;

  const handleSelect = useCallback(
    (company: string) => {
      onSelect(company);
      setQuery('');
      setOpen(false);
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

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-accent/50 transition-colors"
      >
        <span className="truncate">{selected || 'Select a company...'}</span>
        <svg
          className={`ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
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
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto px-1 pb-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                No companies found
              </li>
            )}
            {filtered.map((company) => (
              <li key={company}>
                <button
                  type="button"
                  onClick={() => handleSelect(company)}
                  className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent/50 ${
                    company === selected
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-foreground'
                  }`}
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
