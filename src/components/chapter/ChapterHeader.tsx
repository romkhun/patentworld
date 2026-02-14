const CHAPTER_GRADIENT_COLORS: Record<number, string> = {
  1: 'rgba(59,130,246,0.08)',
  2: 'rgba(34,197,94,0.08)',
  3: 'rgba(245,158,11,0.08)',
  4: 'rgba(168,85,247,0.08)',
  5: 'rgba(236,72,153,0.08)',
  6: 'rgba(20,184,166,0.08)',
  7: 'rgba(249,115,22,0.08)',
  8: 'rgba(14,165,233,0.08)',
  9: 'rgba(234,179,8,0.08)',
  10: 'rgba(107,114,128,0.08)',
  11: 'rgba(99,102,241,0.08)',
  12: 'rgba(6,182,212,0.08)',
  13: 'rgba(168,162,235,0.08)',
  14: 'rgba(239,68,68,0.08)',
  15: 'rgba(236,72,153,0.08)',
  16: 'rgba(20,184,166,0.08)',
  17: 'rgba(249,115,22,0.08)',
  18: 'rgba(14,165,233,0.08)',
  19: 'rgba(234,179,8,0.08)',
  20: 'rgba(107,114,128,0.08)',
  21: 'rgba(99,102,241,0.08)',
  22: 'rgba(6,182,212,0.08)',
  23: 'rgba(168,162,235,0.08)',
  24: 'rgba(239,68,68,0.08)',
};

interface ChapterHeaderProps {
  number: number;
  title: string;
  subtitle: string;
}

export function ChapterHeader({ number, title, subtitle }: ChapterHeaderProps) {
  const gradientColor = CHAPTER_GRADIENT_COLORS[number] ?? 'rgba(59,130,246,0.08)';

  return (
    <header
      className="relative mb-10 -mx-4 px-4 py-8 sm:-mx-6 sm:px-6 rounded-lg overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at top left, ${gradientColor} 0%, transparent 70%)`,
      }}
    >
      <div className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-3">
        Chapter {String(number).padStart(2, '0')}
      </div>
      <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p>
      <div className="mt-4 h-0.5 w-16 rounded-full bg-primary/40" aria-hidden="true" />
    </header>
  );
}
