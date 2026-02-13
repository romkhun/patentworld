'use client';

import { useMemo, useState } from 'react';

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
    // Darker blue = higher rank (lower number)
    const intensity = 1 - (rank - 1) / maxRank;
    const lightness = 92 - intensity * 52; // range: 40% (rank 1) to 92% (rank maxRank)
    return `hsl(221, 70%, ${lightness}%)`;
  };

  const textColor = (rank: number | null) => {
    if (rank == null) return 'hsl(var(--muted-foreground))';
    const intensity = 1 - (rank - 1) / maxRank;
    return intensity > 0.55 ? '#fff' : 'hsl(var(--foreground))';
  };

  return (
    <div className="w-full h-full overflow-x-auto">
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
    </div>
  );
}
