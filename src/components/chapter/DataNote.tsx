import { ReactNode } from 'react';
import { Info } from 'lucide-react';

interface DataNoteProps {
  children: ReactNode;
}

export function DataNote({ children }: DataNoteProps) {
  return (
    <div className="my-6 flex gap-3 rounded-md border bg-muted/50 p-4 text-sm text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
