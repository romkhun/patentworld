interface SectionDividerProps {
  label?: string;
}

export function SectionDivider({ label }: SectionDividerProps) {
  return (
    <div className="relative my-12 flex items-center">
      <div className="flex-grow border-t border-border" />
      {label && (
        <span className="mx-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      )}
      <div className="flex-grow border-t border-border" />
    </div>
  );
}
