'use client';

import type { ReactElement } from 'react';
import { ReferenceLine, Label } from 'recharts';

/* ------------------------------------------------------------------ */
/*  TIME_EVENTS — canonical historical events for patent time-series  */
/* ------------------------------------------------------------------ */

export type TimeEventKey = 'dotcom' | 'gfc' | 'aia' | 'alice' | 'covid';

interface TimeEvent {
  year: number;
  label: string;
}

export const TIME_EVENTS: Record<TimeEventKey, TimeEvent> = {
  dotcom: { year: 2000, label: 'Dot-com' },
  gfc:    { year: 2008, label: 'GFC' },
  aia:    { year: 2011, label: 'AIA' },
  alice:  { year: 2014, label: 'Alice' },
  covid:  { year: 2020, label: 'COVID-19' },
};

/* ------------------------------------------------------------------ */
/*  timeAnnotations — returns an array of <ReferenceLine> elements    */
/*                                                                     */
/*  Usage inside any Recharts chart:                                  */
/*    <LineChart data={data}>                                         */
/*      {timeAnnotations(['dotcom', 'gfc', 'aia'])}                   */
/*    </LineChart>                                                    */
/* ------------------------------------------------------------------ */

const ANNOTATION_STROKE = '#d1d5db';
const ANNOTATION_DASH = '4 4';
const ANNOTATION_WIDTH = 1;
const ANNOTATION_FONT_SIZE = 10;

export function timeAnnotations(
  events: TimeEventKey[],
  opts?: { yAxisId?: string }
): (ReactElement | null)[] {
  return events
    .map((key) => {
      const event = TIME_EVENTS[key];
      if (!event) return null;
      return (
        <ReferenceLine
          key={`ta-${key}`}
          x={event.year}
          stroke={ANNOTATION_STROKE}
          strokeDasharray={ANNOTATION_DASH}
          strokeWidth={ANNOTATION_WIDTH}
          {...(opts?.yAxisId ? { yAxisId: opts.yAxisId } : {})}
        >
          <Label
            value={event.label}
            position="insideTopRight"
            fill={ANNOTATION_STROKE}
            fontSize={ANNOTATION_FONT_SIZE}
            offset={4}
          />
        </ReferenceLine>
      );
    })
    .filter(Boolean);
}
