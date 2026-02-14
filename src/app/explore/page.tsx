'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useChapterData } from '@/hooks/useChapterData';
import { formatCompact } from '@/lib/formatters';
import type { ExploreAssignee, ExploreInventor, CPCClassSummary, WIPOFieldSummary } from '@/lib/types';

type TabId = 'organizations' | 'inventors' | 'technologies' | 'wipo';
type SortDir = 'asc' | 'desc';
interface SortState { key: string; dir: SortDir; }

function SortIcon({ active, dir }: { active: boolean; dir?: SortDir }) {
  if (!active) return <ArrowUpDown className="inline h-3 w-3 ml-1 opacity-40" />;
  return dir === 'asc'
    ? <ArrowUp className="inline h-3 w-3 ml-1" />
    : <ArrowDown className="inline h-3 w-3 ml-1" />;
}

function sortData<T extends Record<string, any>>(data: T[], sort: SortState | null): T[] {
  if (!sort) return data;
  return [...data].sort((a, b) => {
    const av = a[sort.key];
    const bv = b[sort.key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
    return sort.dir === 'asc' ? cmp : -cmp;
  });
}

function useSort() {
  const [sort, setSort] = useState<SortState | null>(null);
  const toggle = useCallback((key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return prev.dir === 'desc' ? { key, dir: 'asc' } : null;
      }
      return { key, dir: 'desc' };
    });
  }, []);
  return { sort, toggle };
}

function SortableHeader({ label, sortKey, sort, onToggle, className = '' }: {
  label: string;
  sortKey: string;
  sort: SortState | null;
  onToggle: (key: string) => void;
  className?: string;
}) {
  return (
    <th
      className={`pb-2 pr-4 font-medium cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
      onClick={() => onToggle(sortKey)}
    >
      {label}
      <SortIcon active={sort?.key === sortKey} dir={sort?.dir} />
    </th>
  );
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<TabId>('organizations');
  const [search, setSearch] = useState('');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'organizations', label: 'Organizations' },
    { id: 'inventors', label: 'Inventors' },
    { id: 'technologies', label: 'CPC Classes' },
    { id: 'wipo', label: 'WIPO Fields' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <h1 className="font-serif text-4xl font-bold tracking-tight">Explore</h1>
      <p className="mt-2 text-muted-foreground">Browse and search the patent data.</p>

      <div className="mt-8 flex items-center gap-2 rounded-md border bg-card px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-6 flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(''); }}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'organizations' && <OrganizationsTable search={search} />}
        {activeTab === 'inventors' && <InventorsTable search={search} />}
        {activeTab === 'technologies' && <CPCTable search={search} />}
        {activeTab === 'wipo' && <WIPOTable search={search} />}
      </div>
    </div>
  );
}

function OrganizationsTable({ search }: { search: string }) {
  const { data, loading } = useChapterData<ExploreAssignee[]>('explore/top_assignees_all.json');
  const { sort, toggle } = useSort();
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    const f = data.filter((d) => !q || d.organization.toLowerCase().includes(q));
    return sortData(f, sort);
  }, [data, search, sort]);

  if (loading) return <TableSkeleton />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">#</th>
            <SortableHeader label="Organization" sortKey="organization" sort={sort} onToggle={toggle} />
            <SortableHeader label="Patents" sortKey="total_patents" sort={sort} onToggle={toggle} className="text-right" />
            <SortableHeader label="First Year" sortKey="first_year" sort={sort} onToggle={toggle} className="text-right" />
            <SortableHeader label="Last Year" sortKey="last_year" sort={sort} onToggle={toggle} className="text-right" />
          </tr>
        </thead>
        <tbody>
          {filtered.slice(0, 100).map((d, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-accent/50">
              <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{i + 1}</td>
              <td className="py-2 pr-4 font-medium">{d.organization}</td>
              <td className="py-2 pr-4 text-right font-mono">{formatCompact(d.total_patents)}</td>
              <td className="py-2 pr-4 text-right font-mono">{d.first_year}</td>
              <td className="py-2 text-right font-mono">{d.last_year}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length > 100 && (
        <p className="mt-4 text-sm text-muted-foreground">Showing 100 of {filtered.length} results.</p>
      )}
    </div>
  );
}

function InventorsTable({ search }: { search: string }) {
  const { data, loading } = useChapterData<ExploreInventor[]>('explore/top_inventors_all.json');
  const { sort, toggle } = useSort();
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    const f = data.filter((d) => !q || `${d.first_name} ${d.last_name}`.toLowerCase().includes(q));
    return sortData(f, sort);
  }, [data, search, sort]);

  if (loading) return <TableSkeleton />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">#</th>
            <SortableHeader label="Inventor" sortKey="last_name" sort={sort} onToggle={toggle} />
            <SortableHeader label="Patents" sortKey="total_patents" sort={sort} onToggle={toggle} className="text-right" />
            <SortableHeader label="First Year" sortKey="first_year" sort={sort} onToggle={toggle} className="text-right" />
            <SortableHeader label="Gender" sortKey="gender" sort={sort} onToggle={toggle} className="text-center" />
          </tr>
        </thead>
        <tbody>
          {filtered.slice(0, 100).map((d, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-accent/50">
              <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{i + 1}</td>
              <td className="py-2 pr-4 font-medium">{d.first_name} {d.last_name}</td>
              <td className="py-2 pr-4 text-right font-mono">{formatCompact(d.total_patents)}</td>
              <td className="py-2 pr-4 text-right font-mono">{d.first_year}-{d.last_year}</td>
              <td className="py-2 text-center">{d.gender}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CPCTable({ search }: { search: string }) {
  const { data, loading } = useChapterData<CPCClassSummary[]>('explore/cpc_class_summary.json');
  const { sort, toggle } = useSort();
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    const f = data.filter((d) => !q || d.cpc_class.toLowerCase().includes(q) || (d.class_name ?? '').toLowerCase().includes(q));
    return sortData(f, sort);
  }, [data, search, sort]);

  if (loading) return <TableSkeleton />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <SortableHeader label="Class" sortKey="cpc_class" sort={sort} onToggle={toggle} />
            <SortableHeader label="Title" sortKey="class_name" sort={sort} onToggle={toggle} />
            <SortableHeader label="Patents" sortKey="total_patents" sort={sort} onToggle={toggle} className="text-right" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((d, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-accent/50">
              <td className="py-2 pr-4 font-mono font-medium">{d.cpc_class}</td>
              <td className="py-2 pr-4">{d.class_name}</td>
              <td className="py-2 text-right font-mono">{formatCompact(d.total_patents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WIPOTable({ search }: { search: string }) {
  const { data, loading } = useChapterData<WIPOFieldSummary[]>('explore/wipo_field_summary.json');
  const { sort, toggle } = useSort();
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    const f = data.filter((d) => !q || d.field.toLowerCase().includes(q) || d.sector.toLowerCase().includes(q));
    return sortData(f, sort);
  }, [data, search, sort]);

  if (loading) return <TableSkeleton />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <SortableHeader label="Sector" sortKey="sector" sort={sort} onToggle={toggle} />
            <SortableHeader label="Field" sortKey="field" sort={sort} onToggle={toggle} />
            <SortableHeader label="Patents" sortKey="total_patents" sort={sort} onToggle={toggle} className="text-right" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((d, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-accent/50">
              <td className="py-2 pr-4 text-muted-foreground">{d.sector}</td>
              <td className="py-2 pr-4 font-medium">{d.field}</td>
              <td className="py-2 text-right font-mono">{formatCompact(d.total_patents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-8 animate-pulse rounded bg-muted" />
      ))}
    </div>
  );
}
