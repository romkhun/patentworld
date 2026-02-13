'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useChapterData } from '@/hooks/useChapterData';
import { formatCompact } from '@/lib/formatters';
import type { ExploreAssignee, ExploreInventor, CPCClassSummary, WIPOFieldSummary } from '@/lib/types';

type TabId = 'organizations' | 'inventors' | 'technologies' | 'wipo';

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
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter((d) => !q || d.organization.toLowerCase().includes(q));
  }, [data, search]);

  if (loading) return <TableSkeleton />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">#</th>
            <th className="pb-2 pr-4 font-medium">Organization</th>
            <th className="pb-2 pr-4 font-medium text-right">Patents</th>
            <th className="pb-2 pr-4 font-medium text-right">First Year</th>
            <th className="pb-2 font-medium text-right">Last Year</th>
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
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter((d) => !q || `${d.first_name} ${d.last_name}`.toLowerCase().includes(q));
  }, [data, search]);

  if (loading) return <TableSkeleton />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">#</th>
            <th className="pb-2 pr-4 font-medium">Inventor</th>
            <th className="pb-2 pr-4 font-medium text-right">Patents</th>
            <th className="pb-2 pr-4 font-medium text-right">Career Span</th>
            <th className="pb-2 font-medium text-center">Gender</th>
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
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter((d) => !q || d.cpc_class.toLowerCase().includes(q) || (d.class_name ?? '').toLowerCase().includes(q));
  }, [data, search]);

  if (loading) return <TableSkeleton />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Class</th>
            <th className="pb-2 pr-4 font-medium">Title</th>
            <th className="pb-2 font-medium text-right">Patents</th>
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
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter((d) => !q || d.field.toLowerCase().includes(q) || d.sector.toLowerCase().includes(q));
  }, [data, search]);

  if (loading) return <TableSkeleton />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Sector</th>
            <th className="pb-2 pr-4 font-medium">Field</th>
            <th className="pb-2 font-medium text-right">Patents</th>
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
