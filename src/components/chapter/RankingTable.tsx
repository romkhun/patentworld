'use client';

interface RankingTableProps {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  caption?: string;
}

export function RankingTable({ title, headers, rows, caption }: RankingTableProps) {
  if (rows.length === 0) return null;

  return (
    <details className="my-6 max-w-3xl mx-auto rounded-lg border bg-card">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        {title}
      </summary>
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-right py-2 pr-3 font-medium text-muted-foreground w-10">#</th>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`py-2 px-3 font-medium text-muted-foreground ${i === 0 ? 'text-left' : 'text-right'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="text-right py-1.5 pr-3 font-mono text-xs text-muted-foreground">{i + 1}</td>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`py-1.5 px-3 ${j === 0 ? 'text-left font-medium' : 'text-right font-mono'}`}
                  >
                    {typeof cell === 'number' ? cell.toLocaleString('en-US') : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {caption && (
          <figcaption className="mt-2 text-xs text-muted-foreground">{caption}</figcaption>
        )}
      </div>
    </details>
  );
}
