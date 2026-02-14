'use client';

import { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { CPC_SECTION_COLORS, TOOLTIP_STYLE } from '@/lib/colors';
import { CPC_SECTION_NAMES } from '@/lib/constants';
import { formatCompact } from '@/lib/formatters';
import type { CPCTreemapEntry } from '@/lib/types';

interface PWTreemapProps {
  data: CPCTreemapEntry[];
}

interface TreeNode {
  name: string;
  children: { name: string; size: number; section: string; fullName: string; [key: string]: any }[];
  [key: string]: any;
}

interface TreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  section?: string;
}

function CustomContent(props: TreemapContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name, section } = props;
  if (width < 30 || height < 20) return null;
  const fill = (section && CPC_SECTION_COLORS[section]) ?? '#888';
  const maxChars = Math.floor(width / 7);
  const label = name && name.length > maxChars ? name.slice(0, maxChars - 1) + '\u2026' : name;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.85} stroke="hsl(var(--background))" strokeWidth={1.5} rx={2} />
      {width > 40 && height > 24 && (
        <text x={x + 4} y={y + 14} fill="#fff" fontSize={11} fontWeight={500}>
          {label}
        </text>
      )}
    </g>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { fullName?: string; name?: string; section?: string; size?: number } }[] }) {
  if (!active || !payload?.[0]) return null;
  const item = payload[0].payload;
  const sectionLabel = item.section ? (CPC_SECTION_NAMES[item.section] ?? item.section) : '';
  return (
    <div style={TOOLTIP_STYLE}>
      <div className="font-medium">{item.fullName ?? item.name}</div>
      <div className="text-muted-foreground text-xs mt-0.5">
        {sectionLabel} &middot; {formatCompact(item.size ?? 0)} patents
      </div>
    </div>
  );
}

export function PWTreemap({ data }: PWTreemapProps) {
  const treeData = useMemo(() => {
    const sectionMap: Record<string, TreeNode> = {};
    data.forEach((d) => {
      if (!sectionMap[d.section]) {
        sectionMap[d.section] = { name: `${d.section}: ${CPC_SECTION_NAMES[d.section] ?? d.section}`, children: [] };
      }
      sectionMap[d.section].children.push({
        name: d.cpc_class,
        size: d.patent_count,
        section: d.section,
        fullName: d.class_name,
      });
    });
    return Object.values(sectionMap);
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={treeData}
        dataKey="size"
        aspectRatio={4 / 3}
        stroke="hsl(var(--background))"
        content={<CustomContent />}
        isAnimationActive={false}
      >
        <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
}
