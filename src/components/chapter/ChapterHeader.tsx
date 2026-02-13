interface ChapterHeaderProps {
  number: number;
  title: string;
  subtitle: string;
}

export function ChapterHeader({ number, title, subtitle }: ChapterHeaderProps) {
  return (
    <div className="mb-10">
      <div className="mb-2 font-mono text-sm uppercase tracking-widest text-muted-foreground">
        Chapter {String(number).padStart(2, '0')}
      </div>
      <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p>
    </div>
  );
}
