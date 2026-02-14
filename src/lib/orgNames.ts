/**
 * Centralized organization name cleaning utility.
 *
 * Raw PatentsView data uses formal legal names (e.g. "SAMSUNG ELECTRONICS CO., LTD.").
 * This module maps those to short display names (e.g. "Samsung") for use in chart
 * labels, legends, tooltips, and annotations.
 *
 * The mapping is case-insensitive and handles common variations.
 * Names not found in the map are returned with simple title-case cleaning.
 */

/** Canonical mapping from raw PatentsView organization names to short display names. */
const ORG_NAME_MAP: Record<string, string> = {
  // --- Top patent holders (from company_name_mapping.json + supplements) ---
  'international business machines corporation': 'IBM',
  'samsung electronics co., ltd.': 'Samsung',
  'canon kabushiki kaisha': 'Canon',
  'sony group corporation': 'Sony',
  'fujitsu limited': 'Fujitsu',
  'intel corporation': 'Intel',
  'kabushiki kaisha toshiba': 'Toshiba',
  'general electric company': 'General Electric',
  'hitachi, ltd.': 'Hitachi',
  'mitsubishi electric corporation': 'Mitsubishi Electric',
  'lg electronics inc.': 'LG Electronics',
  'qualcomm incorporated': 'Qualcomm',
  'taiwan semiconductor manufacturing company ltd.': 'TSMC',
  'taiwan semiconductor manufacturing co., ltd.': 'TSMC',
  'micron technology, inc.': 'Micron Technology',
  'nec corporation': 'NEC',
  'sumitomo electric industries, ltd.': 'Sumitomo Electric',
  'apple inc.': 'Apple',
  'toyota jidosha kabushiki kaisha': 'Toyota',
  'seiko epson corporation': 'Seiko Epson',
  'siemens aktiengesellschaft': 'Siemens',
  'google llc': 'Google',
  'texas instruments incorporated': 'Texas Instruments',
  'ricoh company, ltd.': 'Ricoh',
  'honda motor co., ltd.': 'Honda',
  'robert bosch gmbh': 'Bosch',
  'hewlett-packard development company, l.p.': 'HP',
  'huawei technologies co., ltd.': 'Huawei',
  'microsoft corporation': 'Microsoft',
  'telefonaktiebolaget lm ericsson (publ)': 'Ericsson',
  'sharp kabushiki kaisha': 'Sharp',
  'microsoft technology licensing, llc': 'Microsoft (Licensing)',
  'ford global technologies, llc': 'Ford',
  'xerox corporation': 'Xerox',
  'the boeing company': 'Boeing',
  'eastman kodak company': 'Eastman Kodak',
  'amazon technologies, inc.': 'Amazon',
  'cisco technology, inc.': 'Cisco',
  'united states of america as represented by the secretary of the air force': 'US Air Force',
  'motorola, inc.': 'Motorola',
  'denso corporation': 'Denso',
  'basf se': 'BASF',
  'brother kogyo kabushiki kaisha': 'Brother Industries',
  'gm global technology operations llc': 'General Motors',
  'hyundai motor company': 'Hyundai',
  'sk hynix inc.': 'SK Hynix',
  'semiconductor energy laboratory co., ltd.': 'Semiconductor Energy Lab',
  'at&t intellectual property i, l.p.': 'AT&T',
  'e.i. du pont de nemours and company': 'DuPont',
  'panasonic holdings corporation': 'Panasonic',
  'honeywell international inc.': 'Honeywell',
  'fujifilm corporation': 'Fujifilm',
  'infineon technologies ag': 'Infineon',
  'bayer healthcare llc': 'Bayer Healthcare',
  'the regents of the university of california': 'UC System',
  'the procter & gamble company': 'Procter & Gamble',
  'murata manufacturing co., ltd.': 'Murata Manufacturing',
  'u.s. philips corporation': 'U.S. Philips',
  'applied materials, inc.': 'Applied Materials',
  'korea advanced institute of science and technology': 'KAIST',
  'boe technology group co., ltd.': 'BOE Technology',
  'advanced micro devices, inc.': 'AMD',
  'panasonic intellectual property management co., ltd.': 'Panasonic IP',
  '3m innovative properties company': '3M',
  'lg display co., ltd.': 'LG Display',
  'dell products l.p.': 'Dell',
  'tencent technology (shenzhen) company limited': 'Tencent',
  'nissan motor co., ltd.': 'Nissan',
  'halliburton energy services, inc.': 'Halliburton',
  'fuji xerox co., ltd.': 'Fuji Xerox',
  'broadcom corporation': 'Broadcom',
  'general motors llc': 'General Motors',
  'oracle international corporation': 'Oracle',
  'united technologies corporation': 'United Technologies',
  'tokyo electron limited': 'Tokyo Electron',
  'koniniklijke philips n.v.': 'Philips',
  'koninklijke philips electronics nv': 'Philips',
  'schlumberger technology corporation': 'Schlumberger',
  'hewlett-packard company, l.p.': 'HP',
  'lucent technologies inc.': 'Lucent Technologies',
  'united microelectronics corp.': 'United Microelectronics',
  'industrial technology research institute': 'ITRI',
  'caterpillar inc.': 'Caterpillar',
  'medtronic, inc.': 'Medtronic',
  'seagate technology llc': 'Seagate',
  'westinghouse electric company llc': 'Westinghouse',
  'nikon corporation': 'Nikon',
  'sanyo electric co., ltd.': 'Sanyo',
  'lg chem, ltd.': 'LG Chem',
  'raytheon company': 'Raytheon',
  'covidien lp': 'Covidien',
  'yazaki corporation': 'Yazaki',
  'commissariat a l\'energie atomique et aux energies alternatives': 'CEA',
  'deere & company': 'Deere',
  'olympus corporation': 'Olympus',
  'the united states of america as represented by the secretary of the army': 'US Army',
  'tdk corporation': 'TDK',
  'the dow chemical company': 'Dow Chemical',
  'stmicroelectronics sa': 'STMicroelectronics',
  'minnesota mining and manufacturing company': '3M',
  'sun microsystems inc.': 'Sun Microsystems',
  'massachusetts institute of technology': 'MIT',
  'shell oil compny': 'Shell',
  'renesas electronics corporation': 'Renesas',
  'corning incorporated': 'Corning',
  'nokia': 'Nokia',
  'illinois tool works inc.': 'Illinois Tool Works',
  'sumitomo chemical company, limited': 'Sumitomo Chemical',
  'saudi arabian oil company': 'Saudi Aramco',
  'monsanto technology llc': 'Monsanto',
  'verizon patent and licensing inc.': 'Verizon',
  'pioneer hi-bred international, inc.': 'Pioneer Hi-Bred',
  'kyocera corporation': 'Kyocera',
  'nortel networks limited': 'Nortel',
  'boston scientific scimed, inc.': 'Boston Scientific',
  'rohm co., ltd.': 'Rohm',
  'kyocera document solutions inc.': 'Kyocera Document Solutions',
  'baker hughes holdings llc': 'Baker Hughes',
  'mobil oil corporation': 'Mobil Oil',
  'fanuc corporation': 'Fanuc',
  'hon hai precision industry co., ltd.': 'Foxconn',
  'nike, inc.': 'Nike',
  'capital one services, llc': 'Capital One',
  'lockheed martin corporation': 'Lockheed Martin',
  'shin-etsu chemical co., ltd.': 'Shin-Etsu Chemical',
  'eaton corporation': 'Eaton',
  'bank of america corporation': 'Bank of America',
  'sap se': 'SAP',
  'blackberry limited': 'BlackBerry',
  'japan display inc.': 'Japan Display',
  'olympus optical co., ltd.': 'Olympus Optical',
  'uop llc': 'UOP',
  'nokia technologies oy': 'Nokia Technologies',
  'vmware llc': 'VMware',
  'globalfoundries inc.': 'GlobalFoundries',
  'rca corporation': 'RCA',
  'zte corporation': 'ZTE',
  'nvidia corporation': 'Nvidia',
  'western digital technologies, inc.': 'Western Digital',
  'delphi technologies': 'Delphi',
  'marvell international ltd.': 'Marvell',
  'ford motor company': 'Ford Motor',
  'hewlett packard enterprise development lp': 'HPE',
  'lg innotek co., ltd.': 'LG Innotek',
  'facebook, inc.': 'Meta',
  'phillips petroleum company': 'Phillips Petroleum',
  'nxp b.v.': 'NXP',
  'alcatel lucent': 'Alcatel Lucent',
  'xilinx, inc.': 'Xilinx',
  'emc corporation': 'EMC',
  'aisin seiki kabushiki kaisha': 'Aisin',
  'yamaha corporation': 'Yamaha',
  'konica minolta, inc.': 'Konica Minolta',
  'whirlpool corporation': 'Whirlpool',
  "l'oreal": "L'Oreal",
  'nippon telegraph and telephone corporation': 'NTT',
  'mediatek inc.': 'MediaTek',
  'hoffmann-la roche inc.': 'Roche',
  'casio computer co., ltd.': 'Casio',
  'national semiconductor corporation': 'National Semiconductor',
  'merck & co., inc.': 'Merck',
  'hon hai precision ind. co., ltd.': 'Foxconn',
  'kimberly-clark worldwide, inc.': 'Kimberly-Clark',
  'juniper networks, inc.': 'Juniper Networks',
  'asml netherlands b.v.': 'ASML',
  'fuji electric co., ltd.': 'Fuji Electric',
  'agilent technologies, inc.': 'Agilent',
  'ntt docomo, inc.': 'NTT Docomo',
  'the board of regents of the university of texas system': 'UT System',
  'becton, dickinson and company': 'Becton Dickinson',
  'au optronics corporation': 'AU Optronics',
  'pfizer inc.': 'Pfizer',
  'altera corporation': 'Altera',
  'the goodyear tire & rubber company': 'Goodyear',
  'dow global technologies llc': 'Dow',
  'eli lilly and company': 'Eli Lilly',
  'guangdong oppo mobile telecommunications corp., ltd.': 'OPPO',
  'california institute of technology': 'Caltech',
  'mazda motor corporation': 'Mazda',
  'at&t corp.': 'AT&T',
  'hughes aircraft company': 'Hughes Aircraft',
  'bridgestone corporation': 'Bridgestone',
  'cardiac pacemakers, inc.': 'Cardiac Pacemakers',
  'the board of trustees of the leland stanford junior university': 'Stanford',
  'alps electric co., ltd.': 'Alps Electric',
  'merck patent gmbh': 'Merck Patent',
  'united states department of energy': 'US DOE',
  'rolls-royce plc': 'Rolls-Royce',
  'toyota motor engineering & manufacturing north america, inc.': 'Toyota NA',
  'snap inc.': 'Snap',
  'nuance communications, inc.': 'Nuance',
  'accenture global solutions limited': 'Accenture',
  'adobe inc.': 'Adobe',
  'adobe systems incorporated': 'Adobe',
  'state farm mutual automobile insurance company': 'State Farm',
  'intuit inc.': 'Intuit',
  'beijing baidu netcom science technology co., ltd.': 'Baidu',
  'freeescale semiconductor, inc.': 'Freescale',
  'emc ip holding company llc': 'EMC',
  'silverbrook research pty ltd': 'Silverbrook',
  'hamilton sundstrand corporation (hsc)': 'Hamilton Sundstrand',
  'thomson licensing': 'Thomson',
  'sandisk technologies, inc.': 'SanDisk',
  'ncr corporation': 'NCR',
  'ciba-geigy': 'Ciba-Geigy',
  'hoechst gmbh': 'Hoechst',
};

/**
 * Clean an organization name for display purposes.
 *
 * Performs case-insensitive lookup against the known mapping.
 * Falls back to a simple title-case transformation for unknown names,
 * with truncation at `maxLen` characters if specified.
 */
export function cleanOrgName(raw: string, maxLen?: number): string {
  const cleaned = ORG_NAME_MAP[raw.toLowerCase()];
  if (cleaned) return cleaned;

  // Fallback: if the raw name is already reasonably short and not all-caps, return it
  if (raw.length <= 30 && raw !== raw.toUpperCase()) return raw;

  // For unknown all-caps or long names, apply simple title case
  const titled = raw
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bLlc\b/g, 'LLC')
    .replace(/\bInc\b/g, 'Inc')
    .replace(/\bLtd\b/g, 'Ltd')
    .replace(/\bL\.p\.\b/gi, 'L.P.')
    .replace(/\bCo\.\b/g, 'Co.');

  if (maxLen && titled.length > maxLen) {
    return titled.slice(0, maxLen - 3) + '...';
  }
  return titled;
}

/**
 * Convenience: clean all organization names in an array of objects.
 * Mutates the data by adding a `label` field with the cleaned name.
 */
export function addOrgLabel<T extends Record<string, unknown>>(
  data: T[],
  orgKey: string = 'organization',
  maxLen?: number,
): (T & { label: string })[] {
  return data.map((d) => ({
    ...d,
    label: cleanOrgName(d[orgKey] as string, maxLen),
  }));
}
