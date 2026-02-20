import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ACT 6 Overview — Cross-Domain Comparison | PatentWorld',
  description:
    'A comparative overview of twelve technology domains examined in the ACT 6 Deep Dives, with shared metric definitions, volume comparisons, quality benchmarks, and cross-domain spillover analysis.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
