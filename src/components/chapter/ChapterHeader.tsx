const CHAPTER_GRADIENT_COLORS: Record<number, string> = {
  1: 'rgba(59,130,246,0.08)',
  2: 'rgba(34,197,94,0.08)',
  3: 'rgba(245,158,11,0.08)',
  4: 'rgba(168,85,247,0.08)',
  5: 'rgba(236,72,153,0.08)',
  6: 'rgba(20,184,166,0.08)',
  7: 'rgba(249,115,22,0.08)',
};

interface ChapterHeaderProps {
  number: number;
  title: string;
  subtitle: string;
}

export function ChapterHeader({ number, title, subtitle }: ChapterHeaderProps) {
  const gradientColor = CHAPTER_GRADIENT_COLORS[number] ?? 'rgba(59,130,246,0.08)';

  return (
    <div
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
      <div className="mt-4 h-0.5 w-16 rounded-full bg-primary/40" />
    </div>
  );
}
