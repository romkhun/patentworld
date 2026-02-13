'use client';

import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { PWTimeline, type TimelineEvent } from '@/components/charts/PWTimeline';

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: 1980,
    title: 'Bayh-Dole Act',
    category: 'Legislation',
    description: 'Allowed universities and small businesses to patent federally funded inventions. Transformed university tech transfer and dramatically increased academic patenting.',
  },
  {
    year: 1980,
    title: 'Stevenson-Wydler Act',
    category: 'Legislation',
    description: 'Required federal labs to actively participate in technology transfer. Created Office of Research and Technology Applications in major federal labs.',
  },
  {
    year: 1982,
    title: 'Federal Circuit Created',
    category: 'Legislation',
    description: 'Established the Court of Appeals for the Federal Circuit (CAFC) as the single appellate court for patent cases, unifying patent law and generally strengthening patent rights.',
  },
  {
    year: 1984,
    title: 'Hatch-Waxman Act',
    category: 'Legislation',
    description: 'Balanced generic drug entry with patent term restoration for pharma patents delayed by FDA review. Created the modern framework for pharmaceutical patent litigation.',
  },
  {
    year: 1994,
    title: 'TRIPS Agreement',
    category: 'International',
    description: 'The Agreement on Trade-Related Aspects of Intellectual Property Rights established minimum patent protection standards globally. Changed US patent term from 17 years from grant to 20 years from filing.',
  },
  {
    year: 1995,
    title: 'GATT Patent Term Change',
    category: 'Legislation',
    description: 'US patent term changed from 17 years from grant date to 20 years from earliest filing date, aligning with international standards.',
  },
  {
    year: 1998,
    title: 'State Street Bank v. Signature',
    category: 'Court',
    description: 'Federal Circuit held that business methods are patentable if they produce a "useful, concrete, and tangible result." Opened floodgates for software and business method patents.',
  },
  {
    year: 1999,
    title: 'American Inventors Protection Act',
    category: 'Legislation',
    description: 'Required publication of patent applications 18 months after filing (with opt-out for US-only filers). Introduced inter partes reexamination.',
  },
  {
    year: 2003,
    title: 'USPTO 21st Century Strategic Plan',
    category: 'Policy',
    description: 'USPTO launched comprehensive reform to address growing patent backlog and pendency concerns.',
  },
  {
    year: 2006,
    title: 'eBay v. MercExchange',
    category: 'Court',
    description: 'Supreme Court ruled that patent holders are not automatically entitled to injunctive relief. Ended the presumption of permanent injunctions in patent cases, significantly impacting patent troll litigation strategies.',
  },
  {
    year: 2007,
    title: 'KSR v. Teleflex',
    category: 'Court',
    description: 'Supreme Court broadened the obviousness standard, making it easier to invalidate patents by rejecting the rigid "teaching-suggestion-motivation" test previously used by the Federal Circuit.',
  },
  {
    year: 2010,
    title: 'Bilski v. Kappos',
    category: 'Court',
    description: 'Supreme Court narrowed patentable subject matter for business methods, ruling that the "machine-or-transformation" test is not the sole test for patent eligibility under \u00a7101.',
  },
  {
    year: 2011,
    title: 'America Invents Act (AIA)',
    category: 'Legislation',
    description: 'Most sweeping patent reform since 1952. Switched from "first to invent" to "first inventor to file." Created inter partes review (IPR) and post-grant review (PGR) proceedings at the Patent Trial and Appeal Board (PTAB).',
  },
  {
    year: 2013,
    title: 'AIA First-Inventor-to-File',
    category: 'Policy',
    description: 'The AIA\'s first-inventor-to-file provision took effect March 16, 2013, fundamentally changing patent priority rules.',
  },
  {
    year: 2013,
    title: 'Association for Molecular Pathology v. Myriad',
    category: 'Court',
    description: 'Supreme Court held that naturally occurring DNA segments are not patent eligible, but synthetically created complementary DNA (cDNA) is. Major impact on biotech patenting.',
  },
  {
    year: 2014,
    title: 'Alice Corp. v. CLS Bank',
    category: 'Court',
    description: 'Supreme Court established the two-step framework for patent eligibility under \u00a7101, invalidating abstract idea patents implemented on generic computers. Led to dramatic increase in \u00a7101 rejections and invalidations, especially for software patents.',
  },
  {
    year: 2017,
    title: 'TC Heartland v. Kraft Foods',
    category: 'Court',
    description: 'Supreme Court restricted patent venue rules, requiring suits to be filed where the defendant is incorporated. Dramatically reduced filings in plaintiff-friendly Eastern District of Texas.',
  },
  {
    year: 2018,
    title: 'Oil States v. Greene\'s Energy',
    category: 'Court',
    description: 'Supreme Court upheld the constitutionality of inter partes review (IPR) proceedings at the PTAB, affirming Congress\'s power to create administrative patent validity challenges.',
  },
  {
    year: 2018,
    title: 'SAS Institute v. Iancu',
    category: 'Court',
    description: 'Supreme Court ruled that PTAB must review all claims challenged in an IPR petition, not just a subset, changing PTAB practice significantly.',
  },
  {
    year: 2021,
    title: 'Executive Order on Competition',
    category: 'Policy',
    description: 'President Biden\'s Executive Order on Promoting Competition directed agencies to address the misuse of patents and strengthened patent system transparency initiatives.',
  },
  {
    year: 2023,
    title: 'Proposed PREVAIL & PATENT Acts',
    category: 'Legislation',
    description: 'Congressional proposals to reform the PTAB system and patent eligibility under \u00a7101, reflecting ongoing policy debate about balancing innovation incentives.',
  },
];

export default function Chapter10() {
  return (
    <div>
      <ChapterHeader
        number={10}
        title="Patent Law & Policy"
        subtitle="The rules that shape innovation"
      />

      <Narrative>
        <p>
          The patent system does not exist in a vacuum. Over the past half century,{' '}
          <StatCallout value="landmark legislation" />, Supreme Court decisions, and policy
          changes have fundamentally reshaped the rules governing patents -- who can get them,
          what can be patented, and how they can be enforced. These legal shifts have had
          profound effects on patenting behavior, with visible impacts on the trends shown
          throughout this book.
        </p>
      </Narrative>

      <Narrative>
        <p>
          The timeline below chronicles the most consequential changes to US patent law and
          policy from 1980 to the present. Click on any event to learn more about its impact.
        </p>
      </Narrative>

      <div className="my-10">
        <PWTimeline events={TIMELINE_EVENTS} />
      </div>

      <KeyInsight>
        <p>
          The arc of patent law over the past four decades follows a clear pattern: an era of
          expansion and strengthening (1982-2000) driven by the Federal Circuit and pro-patent
          legislative reforms, followed by a rebalancing era (2006-present) as the Supreme
          Court stepped in to narrow patent scope, and Congress created administrative
          alternatives to costly litigation through the AIA.
        </p>
      </KeyInsight>

      <SectionDivider label="Impact on Patent Activity" />

      <Narrative>
        <p>
          Several of the legal events above left visible marks on the patent data explored
          in earlier chapters:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>
            <strong>Bayh-Dole Act (1980):</strong> Triggered a surge in university patenting.
            Government-funded patents (Chapter 6) began climbing in the 1980s as universities
            established technology transfer offices.
          </li>
          <li>
            <strong>Federal Circuit (1982):</strong> Unified and strengthened patent rights,
            contributing to the overall upward trend in patent grants through the 1990s and
            2000s (Chapter 1).
          </li>
          <li>
            <strong>State Street Bank (1998):</strong> Opened the door to business method and
            software patents, visible as the acceleration of Section G (Physics) and H
            (Electricity) patents in the late 1990s (Chapter 2).
          </li>
          <li>
            <strong>America Invents Act (2011):</strong> Created the PTAB inter partes review
            system, providing a faster and cheaper alternative to litigation for challenging
            patent validity. The shift to first-inventor-to-file changed priority rules for
            all patents filed after March 2013.
          </li>
          <li>
            <strong>Alice Corp. v. CLS Bank (2014):</strong> Dramatically narrowed patent
            eligibility for abstract ideas implemented on computers. Contributed to a visible
            slowdown in software-related patent grants in subsequent years.
          </li>
        </ul>
      </Narrative>

      <KeyInsight>
        <p>
          The patent system reflects an ongoing tension between encouraging innovation
          through strong patent rights and preventing the abuse of overly broad patents
          that can stifle competition. Each major legal change represents a recalibration
          of this balance, with measurable consequences for the pace, direction, and nature
          of patenting activity.
        </p>
      </KeyInsight>

      <DataNote>
        Legal information synthesized from primary sources including congressional records,
        Supreme Court opinions, and the USPTO. Event descriptions focus on patent-relevant
        impacts. This timeline is not exhaustive and focuses on the most consequential
        changes affecting the US patent system.
      </DataNote>

      <ChapterNavigation currentChapter={10} />
    </div>
  );
}
