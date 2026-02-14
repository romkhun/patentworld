'use client';

import { useMemo, useState } from 'react';
import chartTheme from '@/lib/chartTheme';

interface PWRankHeatmapProps {
  data: any[];
  nameKey: string;
  yearKey: string;
  rankKey: string;
  maxRank?: number;
  yearInterval?: number;
}

export function PWRankHeatmap({
  data,
  nameKey,
  yearKey,
  rankKey,
  maxRank = 15,
  yearInterval = 5,
}: PWRankHeatmapProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ org: string; year: number; rank: number; x: number; y: number } | null>(null);

  const { years, orgs, matrix } = useMemo(() => {
    const allYears = [...new Set(data.map((d) => d[yearKey]))].sort((a, b) => a - b);
    // Sample years at interval
    const minYear = allYears[0];
    const maxYear = allYears[allYears.length - 1];
    const sampledYears: number[] = [];
    for (let y = minYear; y <= maxYear; y += yearInterval) {
      if (allYears.includes(y)) sampledYears.push(y);
    }
    // Always include the latest year
    if (!sampledYears.includes(maxYear)) sampledYears.push(maxYear);

    // Get unique orgs sorted by latest rank
    const latestYear = maxYear;
    const orgRanks: Record<string, number> = {};
    data.forEach((d) => {
      if (d[yearKey] === latestYear && d[rankKey] <= maxRank) {
        orgRanks[d[nameKey]] = d[rankKey];
      }
    });
    // Also include orgs that appear in the data but not in latest year
    data.forEach((d) => {
      if (d[rankKey] <= maxRank && !(d[nameKey] in orgRanks)) {
        orgRanks[d[nameKey]] = maxRank + 1;
      }
    });
    const sortedOrgs = Object.entries(orgRanks)
      .sort((a, b) => a[1] - b[1])
      .map(([name]) => name)
      .slice(0, maxRank);

    // Build matrix
    const mat: Record<string, Record<number, number | null>> = {};
    sortedOrgs.forEach((org) => {
      mat[org] = {};
      sampledYears.forEach((y) => {
        const entry = data.find((d) => d[nameKey] === org && d[yearKey] === y && d[rankKey] <= maxRank);
        mat[org][y] = entry ? entry[rankKey] : null;
      });
    });

    return { years: sampledYears, orgs: sortedOrgs, matrix: mat };
  }, [data, nameKey, yearKey, rankKey, maxRank, yearInterval]);

  const cellColor = (rank: number | null) => {
    if (rank == null) return 'transparent';
    // Darker = higher rank (lower number)
    const t = 1 - (rank - 1) / maxRank;
    return chartTheme.sequentialScale(t);
  };

  const textColor = (rank: number | null) => {
    if (rank == null) return 'hsl(var(--muted-foreground))';
    const color = cellColor(rank);
    return chartTheme.textColorForHsl(color);
  };

  return (
    <div className="w-full h-full overflow-x-auto relative">
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 rounded-md border bg-card px-3 py-2 text-xs shadow-md"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <div className="font-semibold text-sm">{tooltip.org}</div>
          <div className="text-muted-foreground">Year: {tooltip.year}</div>
          <div className="text-muted-foreground">Rank: #{tooltip.rank}</div>
        </div>
      )}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground border-b min-w-[180px]">
              Organization
            </th>
            {years.map((y) => (
              <th
                key={y}
                className="px-2 py-2 text-center text-xs font-medium text-muted-foreground border-b min-w-[52px]"
              >
                {y}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orgs.map((org) => {
            const isHovered = hoveredRow === org;
            return (
              <tr
                key={org}
                className={`transition-colors ${isHovered ? 'bg-accent/40' : ''}`}
                onMouseEnter={() => setHoveredRow(org)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="sticky left-0 z-10 bg-card px-3 py-1.5 text-xs font-medium border-b whitespace-nowrap">
                  <span className={isHovered ? 'text-foreground' : 'text-foreground/80'}>
                    {org.length > 28 ? org.slice(0, 25) + '...' : org}
                  </span>
                </td>
                {years.map((y) => {
                  const rank = matrix[org]?.[y] ?? null;
                  return (
                    <td
                      key={y}
                      className="px-1 py-1.5 text-center border-b"
                      onMouseEnter={(e) => {
                        if (rank != null) {
                          const rect = (e.currentTarget.closest('.overflow-x-auto') as HTMLElement)?.getBoundingClientRect();
                          const cellRect = e.currentTarget.getBoundingClientRect();
                          if (rect) {
                            setTooltip({ org, year: y, rank, x: cellRect.left - rect.left + cellRect.width / 2, y: cellRect.top - rect.top });
                          }
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <div
                        className="mx-auto flex items-center justify-center rounded-md w-10 h-7 text-xs font-semibold transition-transform"
                        style={{
                          backgroundColor: cellColor(rank),
                          color: textColor(rank),
                          transform: isHovered && rank != null ? 'scale(1.1)' : undefined,
                        }}
                      >
                        {rank != null ? `#${rank}` : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Gradient legend */}
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>#1</span>
        <div
          className="h-3 rounded-sm"
          style={{
            width: 120,
            background: `linear-gradient(90deg, ${chartTheme.sequentialScale(1)}, ${chartTheme.sequentialScale(0.5)}, ${chartTheme.sequentialScale(0)})`,
          }}
        />
        <span>#{maxRank}</span>
      </div>
    </div>
  );
}
