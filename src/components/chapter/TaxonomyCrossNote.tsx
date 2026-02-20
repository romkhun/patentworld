'use client';

interface TaxonomyCrossNoteProps {
  taxonomy?: 'CPC' | 'WIPO' | 'NMF';
  children?: React.ReactNode;
}

const TAXONOMY_INFO: Record<string, { name: string; description: string }> = {
  CPC: {
    name: 'Cooperative Patent Classification',
    description: 'Hierarchical system: 9 sections → ~660 classes → ~7,200 subclasses. Each patent receives one primary and zero or more secondary codes. We use sections (A-H) for broad comparisons and subclasses for fine-grained analysis.',
  },
  WIPO: {
    name: 'WIPO Technology Sectors',
    description: 'Five broad sectors (Electrical engineering, Instruments, Chemistry, Mechanical engineering, Other fields) mapped from IPC codes. Useful for cross-country comparisons but less granular than CPC.',
  },
  NMF: {
    name: 'NMF Topic Model',
    description: 'Data-driven topics extracted via Non-negative Matrix Factorization on patent abstracts. Captures semantic content that rigid classification systems may miss, but topics are corpus-specific.',
  },
};

export function TaxonomyCrossNote({ taxonomy = 'CPC', children }: TaxonomyCrossNoteProps) {
  const info = TAXONOMY_INFO[taxonomy];
  if (!info) return <>{children}</>;

  return (
    <span className="group relative inline">
      <span className="cursor-help border-b border-dashed border-muted-foreground/50">
        {children ?? info.name}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-md border bg-card px-3 py-2 text-xs leading-relaxed text-foreground shadow-lg opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <strong className="font-semibold">{info.name}</strong>
        <span className="mt-1 block text-muted-foreground">{info.description}</span>
      </span>
    </span>
  );
}
