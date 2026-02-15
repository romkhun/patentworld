'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useChapterData } from '@/hooks/useChapterData';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { Narrative } from '@/components/chapter/Narrative';
import { StatCallout } from '@/components/chapter/StatCallout';
import { DataNote } from '@/components/chapter/DataNote';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { PWLineChart } from '@/components/charts/PWLineChart';
import { SectionDivider } from '@/components/chapter/SectionDivider';
import { KeyInsight } from '@/components/chapter/KeyInsight';
import { ChapterNavigation } from '@/components/layout/ChapterNavigation';
import { PWTimeline, type TimelineEvent } from '@/components/charts/PWTimeline';
import { KeyFindings } from '@/components/chapter/KeyFindings';
import { RelatedChapters } from '@/components/chapter/RelatedChapters';
import { GlossaryTooltip } from '@/components/chapter/GlossaryTooltip';
import { PATENT_EVENTS, filterEvents } from '@/lib/referenceEvents';
import type { ApplicationsVsGrants } from '@/lib/types';

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: 1980,
    title: 'Bayh-Dole Act',
    category: 'Legislation',
    description: 'Permitted universities and small businesses to patent federally funded inventions. Transformed university technology transfer and substantially increased academic patenting.',
    research: [
      {
        citation: 'Jensen, R., & Thursby, M. (2001). Proofs and prototypes for sale: The licensing of university inventions. American Economic Review, 91(1), 240\u2013259. https://doi.org/10.1257/aer.91.1.240',
        summary: 'Most licensed university technologies are embryonic, requiring inventor cooperation for commercialization. A moral-hazard problem with inventor effort means development does not occur unless income is tied to output through royalties or equity.',
      },
      {
        citation: 'Thursby, J. G., & Thursby, M. C. (2002). Who is selling the ivory tower? Sources of growth in university licensing. Management Science, 48(1), 90\u2013104. https://doi.org/10.1287/mnsc.48.1.90.14271',
        summary: 'Post-Bayh-Dole growth in university licensing resulted primarily from faculty becoming more willing to engage in commercialization, rather than from a shift in underlying inventive productivity\u2014suggesting changes in incentives and institutional infrastructure played a major role.',
      },
      {
        citation: 'Zucker, L. G., Darby, M. R., & Brewer, M. B. (1998). Intellectual human capital and the birth of U.S. biotechnology enterprises. American Economic Review, 88(1), 290\u2013306. https://doi.org/10.1257/aer.88.1.290',
        summary: 'The timing and location of biotech firm births was determined primarily by the presence of highly productive "star" scientists publishing genetic sequence discoveries, demonstrating that tacit knowledge transfer\u2014not just patents\u2014drives university-industry innovation.',
      },
      {
        citation: 'Agrawal, A., & Henderson, R. M. (2002). Putting patents in context: Exploring knowledge transfer from MIT. Management Science, 48(1), 44\u201360. https://doi.org/10.1287/mnsc.48.1.44.14279',
        summary: 'Patenting is a minority activity at MIT: most faculty estimate patents account for less than 10% of knowledge that transfers from their labs. Firms citing MIT papers are generally not the same as those citing MIT patents, suggesting patents capture only a narrow channel of university knowledge transfer.',
      },
    ],
  },
  {
    year: 1980,
    title: 'Stevenson-Wydler Act',
    category: 'Legislation',
    description: 'Required federal labs to actively participate in technology transfer. Created Office of Research and Technology Applications in major federal labs.',
    research: [
      {
        citation: 'Cohen, W. M., Nelson, R. R., & Walsh, J. P. (2002). Links and impacts: The influence of public research on industrial R&D. Management Science, 48(1), 1\u201323. https://doi.org/10.1287/mnsc.48.1.1.14273',
        summary: 'Public research significantly influences industrial R&D, but primarily through published papers, conferences, and informal interactions rather than patents. Only 7 of 34 industries rated patents from universities or government labs as an important channel, highlighting the limited role of formal IP in broader knowledge transfer.',
      },
    ],
  },
  {
    year: 1982,
    title: 'Federal Circuit Created',
    category: 'Legislation',
    description: 'Established the Court of Appeals for the Federal Circuit (CAFC) as the single appellate court for patent cases, unifying patent law and generally strengthening patent rights.',
    research: [
      {
        citation: 'Galasso, A., & Schankerman, M. (2015). Patents and cumulative innovation: Causal evidence from the courts. The Quarterly Journal of Economics, 130(1), 317\u2013369. https://doi.org/10.1093/qje/qju029',
        summary: 'Exploiting random judge allocation at the Federal Circuit, patent invalidation leads to a 50% increase in follow-on citations. The effect is concentrated in computers, electronics, and medical instruments, driven by invalidation of patents owned by large patentees triggering more innovation by small firms.',
      },
      {
        citation: 'Hou, Y., Png, I. P. L., & Xiong, X. (2023). When stronger patent law reduces patenting: Empirical evidence. Strategic Management Journal, 44(4), 977\u20131012. https://doi.org/10.1002/smj.3464',
        summary: 'Using the Federal Circuit\u2019s creation as a quasi-natural experiment, businesses reduced strategic patenting by 23.3% on average\u2014stronger legal protection makes each patent more effective, reducing demand for large portfolios.',
      },
      {
        citation: 'Hall, B. H., & Ziedonis, R. H. (2001). The patent paradox revisited: An empirical study of patenting in the U.S. semiconductor industry, 1979\u20131995. RAND Journal of Economics, 32(1), 101\u2013128. https://doi.org/10.2307/2696400',
        summary: 'Stronger patent rights ushered in by the CAFC reshaped incentives to patent in the semiconductor industry, increasing patent propensity by approximately 10 percent per year after 1986. The strengthening of patent rights spawned \u201Cpatent portfolio races\u201D among capital-intensive firms but also facilitated entry by specialized design firms.',
      },
      {
        citation: 'Somaya, D., & McDaniel, C. A. (2012). Tribunal specialization and institutional targeting in patent enforcement. Organization Science, 23(3), 869\u2013887. https://doi.org/10.1287/orsc.1110.0669',
        summary: 'Firms strategically target different patent enforcement tribunals based on institutional characteristics, directly engaging with the Federal Circuit\u2019s role as a specialized court and documenting how firms choose enforcement strategies in response to the court\u2019s precedents.',
      },
    ],
  },
  {
    year: 1984,
    title: 'Hatch-Waxman Act',
    category: 'Legislation',
    description: 'Balanced generic drug entry with patent term restoration for pharma patents delayed by FDA review. Created the modern framework for pharmaceutical patent litigation.',
    research: [
      {
        citation: 'Budish, E., Roin, B. N., & Williams, H. L. (2015). Do firms underinvest in long-term research? Evidence from cancer clinical trials. American Economic Review, 105(7), 2044\u20132085. https://doi.org/10.1257/aer.20131176',
        summary: 'Fixed patent terms distort R&D investment away from long-term projects. Private research investments are skewed toward late-stage cancer treatments with shorter clinical trials and longer effective patent terms, while early-stage prevention research is underinvested.',
      },
      {
        citation: 'Acemoglu, D., & Linn, J. (2004). Market size in innovation: Theory and evidence from the pharmaceutical industry. The Quarterly Journal of Economics, 119(3), 1049\u20131090. https://doi.org/10.1162/0033553041502144',
        summary: 'Potential market size has a large and significant effect on pharmaceutical innovation. Policies affecting expected market size for branded drugs\u2014such as Hatch-Waxman\u2019s generic entry timing\u2014have meaningful effects on upstream innovation investment.',
      },
      {
        citation: 'Grabowski, H. G., & Vernon, J. M. (1990). A new look at the returns and risks to pharmaceutical R&D. Management Science, 36(7), 804\u2013821. https://doi.org/10.1287/mnsc.36.7.804',
        summary: 'Returns to pharma R&D are highly skewed\u2014only the top 30 of 100 new drugs covered mean R&D costs. Any erosion of effective patent life through regulatory delays has outsized effects on the overall return to pharmaceutical innovation, motivating Hatch-Waxman\u2019s patent term restoration.',
      },
      {
        citation: 'Cockburn, I. M., Lanjouw, J. O., & Schankerman, M. (2016). Patents and the global diffusion of new drugs. American Economic Review, 106(1), 136\u2013164. https://doi.org/10.1257/aer.20141482',
        summary: 'Longer and more extensive patent rights accelerate drug launch across countries, while price regulation delays it. Demonstrates that the duration of effective patent protection\u2014the core concern of Hatch-Waxman\u2014has real consequences for drug availability.',
      },
      {
        citation: 'Scott Morton, F. M. (1999). Entry decisions in the generic pharmaceutical industry. RAND Journal of Economics, 30(3), 421\u2013440. https://doi.org/10.2307/2556056',
        summary: 'Analyzing all generic drug approvals from 1984 to 1994 under Hatch-Waxman\u2019s ANDA pathway, prior experience with a drug or therapeutic class significantly reduces the cost of preparing an application and increases the probability of entry\u2014firms specialize along both scientific and marketing dimensions.',
      },
    ],
  },
  {
    year: 1994,
    title: 'TRIPS Agreement',
    category: 'International',
    description: 'The Agreement on Trade-Related Aspects of Intellectual Property Rights established minimum patent protection standards globally.',
    research: [
      {
        citation: 'Branstetter, L. G., Fisman, R., & Foley, C. F. (2006). Do stronger intellectual property rights increase international technology transfer? Empirical evidence from U.S. firm-level panel data. The Quarterly Journal of Economics, 121(1), 321\u2013349. https://doi.org/10.1093/qje/121.1.321',
        summary: 'U.S. multinationals respond to TRIPS-related IP reforms abroad by significantly increasing technology transfer. Royalty payments to affiliates increase by over 30% for affiliates of parent companies that use U.S. patents most extensively prior to reform.',
      },
      {
        citation: 'Cockburn, I. M., Lanjouw, J. O., & Schankerman, M. (2016). Patents and the global diffusion of new drugs. American Economic Review, 106(1), 136\u2013164. https://doi.org/10.1257/aer.20141482',
        summary: 'Patent and price regulation regimes strongly affect how quickly new drugs become commercially available globally. Longer patent rights (as promoted by TRIPS) accelerate drug launch, highlighting TRIPS\u2019s role in driving global pharmaceutical diffusion.',
      },
      {
        citation: 'Moser, P., & Voena, A. (2012). Compulsory licensing: Evidence from the Trading with the Enemy Act. American Economic Review, 102(1), 396\u2013427. https://doi.org/10.1257/aer.102.1.396',
        summary: 'Using a WWI natural experiment, compulsory licensing increased domestic invention by 20%. Directly relevant to TRIPS Article 31, which allows compulsory licenses for public health needs.',
      },
      {
        citation: 'Chaudhuri, S., Goldberg, P. K., & Jia, P. (2006). Estimating the effects of global patent protection in pharmaceuticals: A case study of quinolones in India. American Economic Review, 96(5), 1477\u20131514. https://doi.org/10.1257/aer.96.5.1477',
        summary: 'Using structural demand estimation on the Indian fluoroquinolones market, the withdrawal of domestic generic products following TRIPS-mandated patent protection would cause substantial consumer welfare losses, even in the presence of price regulation\u2014providing direct empirical evidence on the distributional consequences of TRIPS in developing countries.',
      },
    ],
  },
  {
    year: 1995,
    title: 'GATT Patent Term Change',
    category: 'Legislation',
    description: 'US patent term changed from 17 years from grant date to 20 years from earliest filing date, aligning with international standards.',
    research: [
      {
        citation: 'Budish, E., Roin, B. N., & Williams, H. L. (2015). Do firms underinvest in long-term research? Evidence from cancer clinical trials. American Economic Review, 105(7), 2044\u20132085. https://doi.org/10.1257/aer.20131176',
        summary: 'The shift from 17 years from grant to 20 years from filing altered effective patent life. Fixed patent terms distort R&D incentives, particularly disadvantaging long-duration projects where much of the patent term is consumed during regulatory approval.',
      },
    ],
  },
  {
    year: 1998,
    title: 'State Street Bank v. Signature Financial Group',
    category: 'Court',
    description: 'The Court of Appeals for the Federal Circuit held that business methods are patentable if they produce a "useful, concrete, and tangible result." This holding precipitated a substantial increase in software and business method patent filings.',
    research: [
      {
        citation: 'Cockburn, I. M., & MacGarvie, M. J. (2011). Entry and patenting in the software industry. Management Science, 57(5), 915\u2013933. https://doi.org/10.1287/mnsc.1110.1321',
        summary: 'A 10% increase in patents relevant to a software market reduces the entry rate by 3\u20138%, intensifying after expansions in software patentability during the mid-1990s. However, potential entrants holding their own patents are more likely to enter, suggesting patents serve as both barriers and entry tickets.',
      },
    ],
  },
  {
    year: 1999,
    title: 'American Inventors Protection Act',
    category: 'Legislation',
    description: 'Required publication of patent applications 18 months after filing (with opt-out for US-only filers). Introduced inter partes reexamination.',
    research: [
      {
        citation: 'Hegde, D., Herkenhoff, K., & Zhu, C. (2023). Patent publication and innovation. Journal of Political Economy, 131(7), 1845\u20131903. https://doi.org/10.1086/723636',
        summary: 'Exploiting the AIPA\u2019s 18-month publication mandate as a natural experiment, US patents received more and faster follow-on citations, technological overlap increased between distant but related patents, and firms exposed to longer grant delays increased R&D by 4%.',
      },
      {
        citation: 'Hegde, D., & Luo, H. (2018). Patent publication and the market for ideas. Management Science, 64(2), 652\u2013672. https://doi.org/10.1287/mnsc.2016.2622',
        summary: 'Post-AIPA biomedical patent applications were significantly more likely to be licensed before grant, with licensing delays reduced by about 10 months. Standardized disclosure mitigated information costs and facilitated the market for ideas.',
      },
      {
        citation: 'Luck, S., Balsmeier, B., Seliger, F., & Fleming, L. (2020). Early disclosure of invention and reduced duplication: An empirical test. Management Science, 66(6), 2677\u20132685. https://doi.org/10.1287/mnsc.2019.3521',
        summary: 'AIPA\u2019s early disclosure requirement reduced duplicative patent applications, which in turn reduced abandonments and similarity between closely related inventions\u2014providing causal evidence that disclosure decreases wasteful R&D duplication.',
      },
    ],
  },
  {
    year: 2003,
    title: 'USPTO 21st Century Strategic Plan',
    category: 'Policy',
    description: 'USPTO launched comprehensive reform to address growing patent backlog and pendency concerns.',
    research: [
      {
        citation: 'Hegde, D., Ljungqvist, A., & Raj, M. (2022). Quick or broad patents? Evidence from U.S. startups. The Review of Financial Studies, 35(6), 2705\u20132742. https://doi.org/10.1093/rfs/hhab097',
        summary: 'Using quasi-random assignment of patent applications to examiners, grant delays reduce a startup\u2019s employment growth, sales growth, survival chances, and access to external capital. Patent pendency imposes substantial costs on the innovation ecosystem.',
      },
      {
        citation: 'Gans, J. S., Hsu, D. H., & Stern, S. (2008). The impact of uncertain intellectual property rights on the market for ideas: Evidence from patent grant delays. Management Science, 54(5), 982\u2013997. https://doi.org/10.1287/mnsc.1070.0814',
        summary: 'The hazard rate for achieving a cooperative licensing agreement increases significantly upon formal patent grant, suggesting that patent pendency creates real frictions in the market for ideas\u2014a key motivation for USPTO reforms.',
      },
    ],
  },
  {
    year: 2006,
    title: 'eBay v. MercExchange',
    category: 'Court',
    description: 'The Court held that patent holders are not automatically entitled to injunctive relief, ending the presumption of permanent injunctions in patent cases. This holding significantly affected non-practicing entity litigation strategies.',
    research: [
      {
        citation: 'Mezzanotti, F. (2021). Roadblock to innovation: The role of patent litigation in corporate R&D. Management Science, 67(12), 7362\u20137390. https://doi.org/10.1287/mnsc.2020.3816',
        summary: 'Exploiting the eBay decision as a natural experiment, the ruling led to a general increase in innovation by reducing distortions caused by patent litigation. Patent litigation negatively affects R&D investment by lowering returns and exacerbating financing constraints.',
      },
      {
        citation: 'Aydin Ozden, S., & Khashabi, P. (2023). Patent remedies and technology licensing: Evidence from a supreme court decision. Strategic Management Journal, 44(9), 2311\u20132338. https://doi.org/10.1002/smj.3493',
        summary: 'The eBay decision reduced U.S. firms\u2019 propensity to license, driven mainly by small firms in discrete technology industries. Injunctions serve as a credible threat that enhances licensor bargaining power.',
      },
      {
        citation: 'Cohen, L., Gurun, U. G., & Kominers, S. D. (2019). Patent trolls: Evidence from targeted firms. Management Science, 65(12), 5461\u20135486. https://doi.org/10.1287/mnsc.2018.3147',
        summary: 'NPEs target cash-rich firms, asserting lower-quality patents and engaging in forum shopping. NPE litigation significantly reduces innovation at targeted firms\u2014the hold-up concerns that motivated the eBay ruling.',
      },
      {
        citation: 'Farrell, J., & Shapiro, C. (2008). How strong are weak patents? American Economic Review, 98(4), 1347\u20131369. https://doi.org/10.1257/aer.98.4.1347',
        summary: 'When downstream users compete, even probabilistic (weak) patents can extract high running royalties. Examining patent validity prior to licensing is socially beneficial both ex post and ex ante\u2014providing the theoretical foundation for why reducing automatic injunctions, as the eBay ruling accomplished, can improve welfare.',
      },
    ],
  },
  {
    year: 2007,
    title: 'KSR v. Teleflex',
    category: 'Court',
    description: 'The Court held that the rigid "teaching-suggestion-motivation" test previously employed by the Federal Circuit was not the exclusive standard for obviousness under 35 U.S.C. \u00a7 103, thereby broadening the grounds for patent invalidation.',
    research: [
      {
        citation: 'Schankerman, M., & Schuett, F. (2022). Patent screening, innovation, and welfare. The Review of Economic Studies, 89(4), 2101\u20132148. https://doi.org/10.1093/restud/rdab073',
        summary: 'Almost half of all issued patents are on inventions that do not require the patent incentive. Raising examination intensity (making the obviousness standard stricter, as KSR did) significantly improves welfare, according to simulations calibrated on U.S. data.',
      },
    ],
  },
  {
    year: 2010,
    title: 'Bilski v. Kappos',
    category: 'Court',
    description: 'The Court held that the "machine-or-transformation" test is not the sole test for patent eligibility under 35 U.S.C. \u00a7 101, while narrowing the scope of patentable subject matter for business methods. No empirical study of this provision\u2019s effects has been identified in a leading peer-reviewed journal.',
    research: [],
  },
  {
    year: 2011,
    title: 'America Invents Act (AIA)',
    category: 'Legislation',
    description: 'The most comprehensive patent reform since the Patent Act of 1952. Transitioned the United States from a "first to invent" to a "first inventor to file" system. Established inter partes review (IPR) and post-grant review (PGR) proceedings at the Patent Trial and Appeal Board (PTAB).',
    research: [
      {
        citation: 'Schankerman, M., & Schuett, F. (2022). Patent screening, innovation, and welfare. The Review of Economic Studies, 89(4), 2101\u20132148. https://doi.org/10.1093/restud/rdab073',
        summary: 'Screening is highly imperfect, with almost half of all patents issued on inventions that do not require the patent incentive. The introduction of cheaper validity challenge mechanisms like PTAB results in welfare increases of approximately 0.8%.',
      },
      {
        citation: 'Gaessler, F., Harhoff, D., Sorg, S., & von Graevenitz, G. (2025). Patents, freedom to operate, and follow-on innovation: Evidence from post-grant opposition. Management Science, 71(2), 1315\u20131334. https://doi.org/10.1287/mnsc.2019.02294',
        summary: 'Patent invalidation through post-grant opposition increases follow-on innovation by 16% on average. Provides directly applicable evidence for evaluating the AIA\u2019s IPR and post-grant review proceedings, which serve analogous functions.',
      },
      {
        citation: 'Cohen, L., Gurun, U. G., & Kominers, S. D. (2019). Patent trolls: Evidence from targeted firms. Management Science, 65(12), 5461\u20135486. https://doi.org/10.1287/mnsc.2018.3147',
        summary: 'NPE litigation causes real harm to innovation at targeted firms, providing the economic justification for the AIA\u2019s inter partes review as a lower-cost alternative to district court litigation.',
      },
      {
        citation: 'Huang, K. G., Li, M.-X., Shen, C. H.-H., & Wang, Y. (2024). Escaping the patent trolls: The impact of non-practicing entity litigation on firm innovation strategies. Strategic Management Journal, 45(10), 1954\u20131987. https://doi.org/10.1002/smj.3606',
        summary: 'Firms targeted by NPEs shift toward in-house technologies to reduce legal exposure, while non-target firms redirect innovation away from targeted areas. These distortions underscore why the AIA introduced IPR proceedings.',
      },
      {
        citation: 'Helmers, C., & Love, B. J. (2023). Patent validity and litigation: Evidence from US inter partes review. Journal of Law & Economics, 66(1), 53\u201381. https://doi.org/10.1086/721911',
        summary: 'Analyzing the AIA\u2019s inter partes review mechanism directly, both the decision to file an IPR petition and the PTAB\u2019s initial institution decision have large, positive effects on the settlement rate of concurrent court proceedings\u2014demonstrating that IPR generates valuable validity information that facilitates case resolution.',
      },
    ],
  },
  {
    year: 2013,
    title: 'AIA First-Inventor-to-File',
    category: 'Policy',
    description: 'The AIA\'s first-inventor-to-file provision took effect March 16, 2013, fundamentally changing patent priority rules. No empirical study of this provision\u2019s effects has been identified in a leading peer-reviewed journal.',
    research: [],
  },
  {
    year: 2013,
    title: 'Association for Molecular Pathology v. Myriad',
    category: 'Court',
    description: 'The Court held that naturally occurring DNA segments are not patent-eligible under 35 U.S.C. \u00a7 101, but that synthetically created complementary DNA (cDNA) is patent-eligible. This holding had substantial implications for biotechnology patenting.',
    research: [
      {
        citation: 'Sampat, B. N., & Williams, H. L. (2019). How do patents affect follow-on innovation? Evidence from the human genome. American Economic Review, 109(1), 203\u2013236. https://doi.org/10.1257/aer.20151398',
        summary: 'While patented genes appear more valuable prior to being patented, two quasi-experimental approaches suggest that gene patents had no quantitatively important effect on follow-on innovation on average.',
      },
      {
        citation: 'Williams, H. L. (2013). Intellectual property rights and innovation: Evidence from the human genome. Journal of Political Economy, 121(1), 1\u201327. https://doi.org/10.1086/669706',
        summary: 'Celera\u2019s short-term IP on gene sequences led to 20\u201330% reductions in subsequent scientific research and product development, with negative effects persisting even after the IP was removed.',
      },
      {
        citation: 'Huang, K. G., & Murray, F. E. (2009). Does patent strategy shape the long-run supply of public knowledge? Evidence from human genetics. Academy of Management Journal, 52(6), 1193\u20131221. https://doi.org/10.5465/amj.2009.47084665',
        summary: 'Gene patents decrease public genetic knowledge, with broader scope, private sector ownership, and commercial relevance exacerbating the effect\u2014directly documenting the innovation costs that the Myriad decision addressed.',
      },
    ],
  },
  {
    year: 2014,
    title: 'Alice Corp. v. CLS Bank International',
    category: 'Court',
    description: 'The Court held that claims directed to an abstract idea implemented on a generic computer are not patent-eligible under 35 U.S.C. \u00a7 101, establishing a two-step framework for patent eligibility analysis. This holding led to a substantial increase in \u00a7 101 rejections and invalidations, particularly for software patents.',
    research: [
      {
        citation: 'Schankerman, M., & Schuett, F. (2022). Patent screening, innovation, and welfare. The Review of Economic Studies, 89(4), 2101\u20132148. https://doi.org/10.1093/restud/rdab073',
        summary: 'Nearly half of issued patents are on inventions that do not require patent incentives. Improving screening (which the Alice Corp. holding effectively accomplished for software patents) can significantly improve welfare.',
      },
      {
        citation: 'Mezzanotti, F. (2021). Roadblock to innovation: The role of patent litigation in corporate R&D. Management Science, 67(12), 7362\u20137390. https://doi.org/10.1287/mnsc.2020.3816',
        summary: 'Patent litigation deters R&D investment by lowering returns and exacerbating financing constraints. The overly broad software patents addressed by the Alice Corp. holding were a significant source of such litigation-driven innovation costs.',
      },
    ],
  },
  {
    year: 2017,
    title: 'TC Heartland v. Kraft Foods',
    category: 'Court',
    description: 'The Court held that patent infringement suits must be filed where the defendant is incorporated, restricting venue rules. This holding substantially reduced filings in the previously plaintiff-favorable Eastern District of Texas.',
    research: [
      {
        citation: 'Cohen, L., Gurun, U. G., & Kominers, S. D. (2019). Patent trolls: Evidence from targeted firms. Management Science, 65(12), 5461\u20135486. https://doi.org/10.1287/mnsc.2018.3147',
        summary: 'Documents NPE forum shopping as a key element of strategic patent trolling, with the Eastern District of Texas as a favored venue. TC Heartland directly curtailed this behavior by restricting patent venue.',
      },
      {
        citation: 'Mezzanotti, F. (2021). Roadblock to innovation: The role of patent litigation in corporate R&D. Management Science, 67(12), 7362\u20137390. https://doi.org/10.1287/mnsc.2020.3816',
        summary: 'Patent litigation negatively affects R&D investment. Venue reforms that reduce litigation costs and forum-shopping incentives\u2014such as TC Heartland\u2014can increase innovation by lowering enforcement distortions.',
      },
    ],
  },
  {
    year: 2018,
    title: 'Oil States v. Greene\'s Energy',
    category: 'Court',
    description: 'The Court held that inter partes review (IPR) proceedings at the PTAB are constitutional, affirming Congress\'s authority to create administrative patent validity challenges.',
    research: [
      {
        citation: 'Schankerman, M., & Schuett, F. (2022). Patent screening, innovation, and welfare. The Review of Economic Studies, 89(4), 2101\u20132148. https://doi.org/10.1093/restud/rdab073',
        summary: 'Courts alone cannot solve the patent screening problem. Administrative patent validity mechanisms like IPR\u2014whose constitutionality Oil States upheld\u2014generate welfare improvements by providing a cheaper alternative to litigation for challenging weak patents.',
      },
    ],
  },
  {
    year: 2018,
    title: 'SAS Institute v. Iancu',
    category: 'Court',
    description: 'The Court held that the PTAB must review all claims challenged in an IPR petition, not merely a subset, thereby altering PTAB practice.',
  },
  {
    year: 2021,
    title: 'Executive Order on Competition',
    category: 'Policy',
    description: 'The Executive Order on Promoting Competition directed federal agencies to address the misuse of patents and strengthened patent system transparency initiatives.',
    research: [
      {
        citation: 'Lerner, J., & Tirole, J. (2015). Standard-essential patents. Journal of Political Economy, 123(3), 547\u2013586. https://doi.org/10.1086/680995',
        summary: 'Patents that become standard-essential create inefficiencies from lack of price commitments. Structured commitments can restore competition\u2014providing the economic foundation for the Executive Order\u2019s directive to reconsider policies on standard-essential patents and FRAND commitments.',
      },
    ],
  },
  {
    year: 2023,
    title: 'Proposed PREVAIL Act & Patent Eligibility Restoration Act (PERA)',
    category: 'Legislation',
    description: 'Congressional proposals to reform the PTAB system and patent eligibility under 35 U.S.C. \u00a7 101, reflecting the ongoing policy debate regarding the balance of innovation incentives.',
  },
];

export default function Chapter4() {
  const { data: pipelineData, loading: pipL } = useChapterData<ApplicationsVsGrants[]>('chapter10/applications_vs_grants.json');

  // Filter pipeline data to exclude the last partial year (2025 has distorted ratio)
  const pipelineFiltered = useMemo(() => {
    if (!pipelineData) return [];
    return pipelineData.filter((d) => d.year <= 2024);
  }, [pipelineData]);

  return (
    <div>
      <ChapterHeader
        number={6}
        title="Patent Law & Policy"
        subtitle="Legislation and jurisprudence shaping the patent system"
      />

      <KeyFindings>
        <li>The <GlossaryTooltip term="Bayh-Dole Act">Bayh-Dole Act</GlossaryTooltip> (1980) transformed university patenting, enabling academic institutions to retain patent rights from federally funded research.</li>
        <li>The America Invents Act (2011) constituted the most significant patent reform since 1952, transitioning the United States from a first-to-invent to a first-inventor-to-file system.</li>
        <li>In <GlossaryTooltip term="Alice decision">Alice Corp. v. CLS Bank International</GlossaryTooltip> (2014), the Court held that abstract ideas implemented on generic computers are not patent-eligible under 35 U.S.C. &sect; 101, substantially curtailing patent eligibility for software and business method patents.</li>
        <li>Legislative and judicial changes exhibit measurable effects on patent filing patterns, with impacts observable in the data within one to two years of major rulings.</li>
      </KeyFindings>

      <aside className="my-8 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          A half-century of patent law reveals two broad regulatory phases: an era of expansion from the early 1980s through 2000 -- during which university patenting, strengthened enforcement, and broadened subject-matter eligibility contributed to the volume growth documented in <Link href="/chapters/system-patent-count" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">the preceding chapters</Link> -- followed by an era of recalibration in which the Supreme Court narrowed eligibility doctrine and Congress introduced lower-cost administrative validity challenges at the PTAB. The data confirm that these legal shifts produce measurable effects within one to two years of enactment: the already-rising trend in applications around the 1998 State Street decision, pendency declines after AIA-era reforms, and a potential moderation in software-related patenting following the 2014 Alice eligibility restriction.
        </p>
      </aside>

      <Narrative>
        <p>
          The patent system operates within a dynamic legal and institutional context. Over the past half century,{' '}
          <StatCallout value="landmark legislation" />, Supreme Court decisions, and policy
          changes have fundamentally reshaped the rules governing patents -- who may obtain them,
          what subject matter is patent-eligible, and how patents may be enforced. These legal shifts have had
          substantial effects on patenting behavior, with observable impacts on the trends documented
          throughout this book.
        </p>
      </Narrative>

      <Narrative>
        <p>
          The timeline below chronicles the most consequential changes to United States patent law and
          policy from 1980 to the present. Each event entry includes a description of its impact
          and references to published academic research examining its effects.
        </p>
      </Narrative>

      <div className="my-10">
        <PWTimeline events={TIMELINE_EVENTS} />
      </div>

      <KeyInsight>
        <p>
          The trajectory of patent law over the past four decades exhibits a discernible pattern: an era of
          expansion and strengthening (1982-2000) driven by the Court of Appeals for the Federal Circuit and pro-patent
          legislative reforms, followed by an era of recalibration (2006-present) as the Supreme
          Court narrowed patent scope, and Congress established administrative
          alternatives to costly litigation through the <GlossaryTooltip term="AIA">AIA</GlossaryTooltip>.
        </p>
      </KeyInsight>

      <SectionDivider label="Impact on Patent Activity" />

      <Narrative>
        <p>
          Several of the legal events documented above exhibit observable effects on the patent data examined
          in earlier chapters:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>
            <strong>Bayh-Dole Act (1980):</strong> Precipitated a substantial increase in university patenting.
            Government-funded patents (Patent Quality) began rising in the 1980s as universities
            established technology transfer offices.
          </li>
          <li>
            <strong>Court of Appeals for the Federal Circuit (1982):</strong> Unified and strengthened patent rights,
            contributing to the overall upward trend in patent grants through the 1990s and
            2000s (The Innovation Landscape).
          </li>
          <li>
            <strong>State Street Bank v. Signature Financial Group (1998):</strong> Established the patentability of business
            methods, precipitating a rapid expansion in software patent filings observable as
            the acceleration of Section G (Physics) and H (Electricity) patents in the late
            1990s (The Technology Revolution).
          </li>
          <li>
            <strong>America Invents Act (2011):</strong> Created the PTAB inter partes review
            system, providing a faster and cheaper alternative to litigation for challenging
            patent validity. The shift to first-inventor-to-file changed priority rules for
            all patents filed after March 2013.
          </li>
          <li>
            <strong>Alice Corp. v. CLS Bank International (2014):</strong> The Court held that abstract ideas implemented on generic computers are not patent-eligible under 35 U.S.C. &sect; 101, substantially narrowing patent
            eligibility. This holding may have contributed to a moderation in software-related patenting in subsequent years, though Sections G and H continued to grow in absolute terms.
          </li>
        </ul>
      </Narrative>

      <KeyInsight>
        <p>
          The patent system reflects a persistent tension between encouraging innovation
          through strong patent rights and preventing the misuse of overly broad patents
          that may impede competition. Each major legal change represents a recalibration
          of this balance, with measurable consequences for the pace, direction, and character
          of patenting activity.
        </p>
      </KeyInsight>

      <SectionDivider label="The Patent Pipeline" />

      <Narrative>
        <p>
          The efficiency of the patent system in processing inventions warrants examination. Comparing the number of
          patent applications filed each year against the grants issued enables tracking of the USPTO&apos;s
          throughput and the growing gap between filing and granting activity. The ratio of grants
          to applications indicates how the system&apos;s selectivity and backlog have evolved over time.
        </p>
      </Narrative>

      <ChartContainer
        id="fig-patent-law-applications-vs-grants"
        subtitle="Annual patent applications (by filing date) and grants (by grant date) with the grant-to-application ratio, tracking USPTO throughput over time."
        title="Applications Grew from 66,000 to 349,000 (1976-2019) While the Grant-to-Application Ratio Fell from Over 100% in the Mid-1970s to 66% by 1997, Reflecting Increasing Examination Lag"
        caption="This chart displays annual filings (by filing date) and grants (by grant date) for utility patents, with the grant-to-application ratio. Only patents that were eventually granted appear in this dataset. The growing gap between applications and grants since the mid-1990s reflects the increasing duration between filing and grant."
        insight="Major legislative changes create observable inflection points in patent filing data, demonstrating the direct impact of policy on innovation incentives. The growing gap between applications and grants is consistent with increasing examination complexity and backlog."
        loading={pipL}
      >
        <PWLineChart
          data={pipelineFiltered}
          xKey="year"
          lines={[
            { key: 'applications', name: 'Applications (filing date)', color: '#0072B2' },
            { key: 'grants', name: 'Grants (grant date)', color: '#009E73' },
            { key: 'grant_to_application_ratio', name: 'Grant/Application Ratio (%)', color: '#E69F00', yAxisId: 'right' },
          ]}
          yLabel="Number of Patents"
          rightYLabel="Ratio (%)"
          rightYFormatter={(v: number) => `${v.toFixed(0)}%`}
          referenceLines={filterEvents(PATENT_EVENTS)}
        />
      </ChartContainer>

      <KeyInsight>
        <p>
          In the early years, grants and applications tracked closely because the dataset only
          captures successful filings. The growing divergence from the mid-1990s onward reflects
          the increasing time lag between filing and grant; applications filed in a given year
          may not be granted for two to four years. The increase in grants around 2012-2015 coincides with
          the USPTO clearing a significant backlog, while the America Invents Act&apos;s procedural
          reforms reshaped the pipeline.
        </p>
      </KeyInsight>

      <Narrative>
        Having examined the legal and policy framework that governs the patent system, the analysis turns to the role of public investment in driving innovation. The <Link href="/chapters/system-public-investment" className="underline decoration-muted-foreground/50 hover:decoration-foreground transition-colors">following chapter</Link> investigates how government funding and public research expenditures have shaped patenting activity, and what the evolving relationship between federal investment and patent output reveals about the foundations of the innovation ecosystem.
      </Narrative>

      <DataNote>
        Legal information synthesized from primary sources including congressional records,
        Supreme Court opinions, and the USPTO. Event descriptions focus on patent-relevant
        impacts. This timeline is not exhaustive and focuses on the most consequential
        changes affecting the US patent system. Academic research summaries draw from
        published studies in leading economics and management journals including the
        American Economic Review, Quarterly Journal of Economics, Journal of Political
        Economy, Review of Economic Studies, Management Science, Strategic Management
        Journal, and Academy of Management Journal. Applications vs. grants data uses
        PatentsView, which only includes patents that were eventually granted -- the
        &quot;applications&quot; count therefore represents successful filings rather than total
        submissions to the USPTO.
      </DataNote>

      <RelatedChapters currentChapter={6} />
      <ChapterNavigation currentChapter={6} />
    </div>
  );
}
