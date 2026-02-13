interface StatCalloutProps {
  value: string;
}

export function StatCallout({ value }: StatCalloutProps) {
  return (
    <span className="font-semibold text-foreground bg-primary/5 px-1 rounded">
      {value}
    </span>
  );
}
