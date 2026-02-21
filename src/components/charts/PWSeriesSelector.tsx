'use client';

import { useState, useMemo } from 'react';

interface SeriesItem {
  key: string;
  name: string;
  color: string;
}

interface PWSeriesSelectorProps {
  items: SeriesItem[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
  defaultCount?: number;
}

export function PWSeriesSelector({ items, selected, onChange, defaultCount = 5 }: PWSeriesSelectorProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, search]);

  const handleToggle = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(next);
  };

  const handleShowAll = () => onChange(new Set(items.map((i) => i.key)));
  const handleReset = () => onChange(new Set(items.slice(0, defaultCount).map((i) => i.key)));

  return (
    <div className="mb-4 max-w-[960px] mx-auto">
      <div className="flex items-center gap-2 mb-2">
        {items.length > 6 && (
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search series..."
            className="rounded-md border bg-card px-2 py-1 text-xs w-36"
          />
        )}
        <button
          onClick={handleShowAll}
          className="rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-foreground/70 hover:bg-accent transition-colors"
        >
          Show all
        </button>
        <button
          onClick={handleReset}
          className="rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-foreground/70 hover:bg-accent transition-colors"
        >
          Reset
        </button>
        <span className="text-xs text-muted-foreground ml-auto">
          {selected.size} of {items.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {filtered.map((item) => {
          const isSelected = selected.has(item.key);
          return (
            <button
              key={item.key}
              onClick={() => handleToggle(item.key)}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-foreground/10 text-foreground'
                  : 'bg-muted/50 text-foreground/50 line-through'
              }`}
            >
              <span
                className="inline-block h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: isSelected ? item.color : '#d1d5db' }}
              />
              {item.name.length > 20 ? item.name.slice(0, 18) + '...' : item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
