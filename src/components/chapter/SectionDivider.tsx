interface SectionDividerProps {
  label?: string;
  id?: string;
}

export function SectionDivider({ label, id }: SectionDividerProps) {
  const sectionId = id ?? (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined);

  return (
    <div
      className="relative my-12 flex items-center scroll-mt-20"
      id={sectionId}
      data-section-label={label}
    >
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
