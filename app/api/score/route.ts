import { NextRequest, NextResponse } from 'next/server';

// ─── Types ───────────────────────────────────────────────────────────────────

interface HIBPBreach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsSensitive: boolean;
}

interface ScoreBreakdown {
  demographicValue: number;
  behavioralSignals: number;
  purchaseIntent: number;
  dataExposure: number;
  consentLevel: number;
  companyExposure: number;
  assetOwnership: number;
  investmentExposure: number;
  aiPowerUser: number;
  ageGroup: number;
  phoneType: number;
}

// ─── HIBP Fetcher ─────────────────────────────────────────────────────────────

async function fetchHIBPBreaches(email: string): Promise<HIBPBreach[]> {
  const apiKey = process.env.HIBP_API_KEY;

  if (!apiKey) {
    console.warn('HIBP_API_KEY not set — skipping breach lookup');
    return [];
  }

  try {
    const res = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          'hibp-api-key': apiKey,
          'user-agent': 'PrivacyDataScore/1.0',
        },
        next: { revalidate: 3600 }, // cache for 1 hour
      }
    );

    // 404 = clean email, not in any breach
    if (res.status === 404) return [];

    if (!res.ok) {
      console.error(`HIBP API error: ${res.status} ${res.statusText}`);
      return [];
    }

    return await res.json();
  } catch (err) {
    console.error('HIBP fetch failed:', err);
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRand(seed: number, min: number, max: number, offset = 0): number {
  const r = ((seed + offset) % 1000) / 1000;
  return Math.round(min + r * (max - min));
}

// Sensitivity weights per HIBP data class
const DATA_CLASS_WEIGHTS: Record<string, number> = {
  'Passwords':              10,
  'Email addresses':         6,
  'Phone numbers':           8,
  'Physical addresses':      9,
  'Credit card details':    10,
  'Social security numbers':10,
  'Bank account numbers':   10,
  'Health records':         10,
  'Sexual preferences':     10,
  'IP addresses':            5,
  'Usernames':               4,
  'Dates of birth':          7,
  'Geographic locations':    6,
  'Device information':      4,
  'Purchase history':        7,
  'Browsing histories':      8,
  'Education levels':        3,
  'Employers':               4,
  'Job titles':              3,
  'Names':                   5,
  'Genders':                 3,
  'Ethnicities':             6,
  'Financial investments':   8,
  'Income levels':           7,
  'Marital statuses':        4,
  'Profile photos':          5,
  'Social media profiles':   6,
};

function scoreDataClasses(dataClasses: string[]): number {
  if (!dataClasses.length) return 0;
  const total = dataClasses.reduce((sum, dc) => sum + (DATA_CLASS_WEIGHTS[dc] ?? 3), 0);
  return Math.min(100, Math.round((total / (dataClasses.length * 10)) * 100));
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { name, email, phone } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Fetch real HIBP breach data
  const breaches = await fetchHIBPBreaches(email);

  // ── Real signals from HIBP ──────────────────────────────────────────────────

  const breachCount        = breaches.length;
  const verifiedBreaches   = breaches.filter(b => b.IsVerified);
  const sensitiveBreaches  = breaches.filter(b => b.IsSensitive);
  const allDataClasses     = [...new Set(breaches.flatMap(b => b.DataClasses))];
  const dataClassScore     = scoreDataClasses(allDataClasses);

  const hasPasswordExposure   = allDataClasses.includes('Passwords');
  const hasFinancialExposure  = allDataClasses.some(dc =>
    ['Credit card details', 'Bank account numbers', 'Financial investments'].includes(dc)
  );
  const hasBehavioralExposure = allDataClasses.some(dc =>
    ['Browsing histories', 'Purchase history', 'IP addresses'].includes(dc)
  );
  const hasSensitiveExposure  = sensitiveBreaches.length > 0;
  const hasPhysicalExposure   = allDataClasses.some(dc =>
    ['Physical addresses', 'Phone numbers', 'Dates of birth'].includes(dc)
  );

  const sortedBreaches = [...breaches].sort(
    (a, b) => new Date(b.BreachDate).getTime() - new Date(a.BreachDate).getTime()
  );
  const mostRecentBreach = sortedBreaches[0]?.BreachDate ?? null;

  const realBreachSources = verifiedBreaches
    .filter(b => b.Title || b.Name)
    .map(b => b.Title || b.Name)
    .slice(0, 8);

  // ── Heuristic signals ───────────────────────────────────────────────────────

  const seed        = hashString(email + name);
  const hasPhone    = !!phone;
  const emailLower  = email.toLowerCase();
  const isGmail     = emailLower.includes('gmail');
  const domainBoost = isGmail ? 15 : emailLower.includes('yahoo') ? 10 : 5;

  const breachBoost    = Math.min(40, breachCount * 4);
  const sensitiveBoost = Math.min(25, sensitiveBreaches.length * 8);
  const financialBoost = hasFinancialExposure ? 15 : 0;
  const behavBoost     = hasBehavioralExposure ? 12 : 0;

  // ── New dimension signals ────────────────────────────────────────────────────

  // Company exposure — how many organizations likely hold your data
  // More breaches = more companies, corporate email = more B2B exposure
  const isCorporateEmail = !['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud', 'proton'].some(p => emailLower.includes(p));
  const companyExposureScore = Math.min(100,
    seededRand(seed, 30, 55, 6)
    + Math.min(35, breachCount * 3)
    + (isCorporateEmail ? 20 : 0)
    + (hasPhone ? 8 : 0)
  );

  // Asset ownership (home/vehicle) — inferred from physical address exposure, age signals, corporate email
  const assetOwnershipScore = Math.min(100,
    seededRand(seed, 20, 50, 7)
    + (hasPhysicalExposure ? 20 : 0)
    + (isCorporateEmail ? 12 : 0)
    + (allDataClasses.includes('Geographic locations') ? 10 : 0)
  );

  // Investment exposure — financial data classes + purchase history signals
  const investmentExposureScore = Math.min(100,
    seededRand(seed, 15, 45, 8)
    + (hasFinancialExposure ? 30 : 0)
    + (allDataClasses.includes('Financial investments') ? 25 : 0)
    + (allDataClasses.includes('Income levels') ? 15 : 0)
    + (isCorporateEmail ? 10 : 0)
  );

  // AI power user — tech-savvy email domains, behavioral data exposure, multiple breach sources
  const techDomains = ['gmail', 'proton', 'hey.com', 'fastmail'];
  const isTechEmail = techDomains.some(p => emailLower.includes(p));
  const aiPowerUserScore = Math.min(100,
    seededRand(seed, 20, 50, 9)
    + (isTechEmail ? 20 : 0)
    + (hasBehavioralExposure ? 15 : 0)
    + (allDataClasses.includes('Browsing histories') ? 15 : 0)
    + (breachCount > 3 ? 10 : 0)
  );

  // Age group — older accounts have longer digital trails and more breaches
  // Proxied via breach recency spread, name length, email patterns
  const nameParts   = name.trim().split(/\s+/);
  const nameLength  = name.replace(/\s/g, '').length;
  const ageGroupScore = Math.min(100,
    seededRand(seed, 25, 55, 10)
    + (nameParts.length >= 2 ? 10 : 0)       // full name = more mature profile
    + (nameLength > 10 ? 8 : 0)              // longer name = more established
    + (breachCount > 5 ? 15 : 0)             // many breaches = longer online history
    + (allDataClasses.includes('Dates of birth') ? 20 : 0)
  );

  // Phone type (prepaid vs postpaid) — prepaid numbers have fewer data trails
  // Postpaid = more identity linkage, more data broker exposure
  // Heuristic: having a phone at all + physical/financial exposure = likely postpaid
  const phoneTypeScore = !hasPhone ? 0 : Math.min(100,
    seededRand(seed, 30, 60, 11)
    + (hasPhysicalExposure ? 15 : 0)
    + (hasFinancialExposure ? 15 : 0)
    + (allDataClasses.includes('Phone numbers') ? 20 : 0)
  );

  // ── Breakdown ───────────────────────────────────────────────────────────────

  const breakdown: ScoreBreakdown = {
    demographicValue: Math.min(100,
      seededRand(seed, 40, 70, 1)
      + (hasPhone ? 8 : 0)
      + domainBoost
      + (hasPhysicalExposure ? 10 : 0)
    ),
    behavioralSignals: Math.min(100,
      seededRand(seed, 40, 65, 2)
      + (isGmail ? 12 : 0)
      + behavBoost
      + Math.round(hasBehavioralExposure ? dataClassScore * 0.3 : 0)
    ),
    purchaseIntent: Math.min(100,
      seededRand(seed, 35, 65, 3)
      + (hasPhone ? 10 : 0)
      + financialBoost
    ),
    dataExposure: Math.min(100,
      seededRand(seed, 30, 55, 4)
      + domainBoost
      + breachBoost
      + sensitiveBoost
    ),
    consentLevel: Math.min(100,
      seededRand(seed, 15, 45, 5)
      + (breachCount > 5 ? 15 : 0)
      + (hasSensitiveExposure ? 10 : 0)
    ),
    companyExposure:     companyExposureScore,
    assetOwnership:      assetOwnershipScore,
    investmentExposure:  investmentExposureScore,
    aiPowerUser:         aiPowerUserScore,
    ageGroup:            ageGroupScore,
    phoneType:           phoneTypeScore,
  };

  // ── Final score ─────────────────────────────────────────────────────────────

  const rawScore =
    breakdown.demographicValue   * 0.15 +
    breakdown.behavioralSignals  * 0.15 +
    breakdown.purchaseIntent     * 0.10 +
    breakdown.dataExposure       * 0.10 +
    breakdown.consentLevel       * 0.05 +
    breakdown.companyExposure    * 0.15 +
    breakdown.assetOwnership     * 0.10 +
    breakdown.investmentExposure * 0.10 +
    breakdown.aiPowerUser        * 0.05 +
    breakdown.ageGroup           * 0.05 +
    breakdown.phoneType          * 0.00; // informational only, no score weight

  const breachFloor = Math.min(400, breachCount * 30);
  const totalScore  = Math.max(
    breachFloor,
    Math.min(980, Math.round(rawScore * 10))
  );

  const dataValue  = parseFloat(((totalScore / 1000) * 850).toFixed(2));
  const riskLevel  =
    totalScore > 750 ? 'High'   :
    totalScore > 500 ? 'Medium' : 'Low';

  // ── Broker list ─────────────────────────────────────────────────────────────

  const knownBrokers = [
    'Acxiom', 'Experian Marketing', 'LexisNexis', 'Spokeo',
    'BeenVerified', 'Whitepages', 'Intelius', 'DataLogix',
    'Oracle Data Cloud', 'Epsilon', 'CoreLogic', 'TransUnion',
  ];

  const brokers = [
    ...new Set([...realBreachSources, ...knownBrokers])
  ].slice(0, Math.max(6, Math.min(16, breachCount + 6)));

  // ── Data Market Profile ──────────────────────────────────────────────────────
  // Models what categories of data brokers are actively packaging & selling
  // based on industry practices of Acxiom, Experian, Oracle, LexisNexis etc.

  type Likelihood = 'High' | 'Medium' | 'Low';

  function likelihood(score: number): Likelihood {
    return score >= 65 ? 'High' : score >= 40 ? 'Medium' : 'Low';
  }

  const dataMarketProfile = [
    {
      category: 'Identity & Demographics',
      icon: 'user',
      likelihood: 'High' as Likelihood, // always sold — everyone has this
      attributes: [
        'Full legal name', 'Estimated age range', 'Gender',
        'Ethnicity estimate', 'Marital status', 'Household size',
        'Education level', 'Occupation category',
      ],
      brokers: ['Acxiom', 'LexisNexis', 'Experian', 'TransUnion'],
      description: 'Basic identity attributes are the foundation of every data broker record. Your name, age, and demographics are sold to virtually every buyer.',
    },
    {
      category: 'Financial Profile',
      icon: 'dollar',
      likelihood: likelihood(breakdown.investmentExposure),
      attributes: [
        'Estimated income bracket', 'Net worth range', 'Credit tier',
        'Debt-to-income signal', 'Investment activity', 'Bank account type',
        'Mortgage status', 'Payment behavior',
      ],
      brokers: ['Experian', 'TransUnion', 'Equifax', 'Acxiom', 'CoreLogic'],
      description: 'Financial profile data commands the highest price per record. Income estimates, credit tiers, and investment signals are sold to lenders, insurers, and marketers.',
    },
    {
      category: 'Property & Real Estate',
      icon: 'home',
      likelihood: likelihood(breakdown.assetOwnership),
      attributes: [
        'Homeowner vs renter status', 'Estimated property value',
        'Mortgage holder', 'Length of residence', 'Neighborhood income tier',
        'Move history', 'Square footage estimate',
      ],
      brokers: ['CoreLogic', 'LexisNexis', 'Acxiom', 'Experian'],
      description: 'Property records are publicly available and heavily aggregated. Homeownership status significantly increases your data profile value.',
    },
    {
      category: 'Automotive Profile',
      icon: 'car',
      likelihood: likelihood(breakdown.assetOwnership * 0.8 + breakdown.demographicValue * 0.2),
      attributes: [
        'Vehicle ownership', 'Make, model & year', 'New vs used buyer',
        'Number of vehicles', 'Registration state', 'Loan vs lease status',
        'EV or ICE preference',
      ],
      brokers: ['IHS Markit / Polk', 'Experian Auto', 'LexisNexis', 'Acxiom'],
      description: 'Vehicle registration data is sourced from DMVs and resold. Auto insurers, dealers, and auto finance companies are major buyers.',
    },
    {
      category: 'Consumer Behavior',
      icon: 'shopping',
      likelihood: likelihood(breakdown.purchaseIntent * 0.6 + breakdown.behavioralSignals * 0.4),
      attributes: [
        'Purchase history categories', 'Brand affinity', 'Retail spending estimate',
        'Online vs in-store preference', 'Subscription services', 'Loyalty program data',
        'Catalog and direct mail response', 'Coupon and deal sensitivity',
      ],
      brokers: ['Acxiom', 'Oracle Data Cloud', 'Epsilon', 'Experian Marketing'],
      description: 'Purchase behavior is the most commercially valuable signal. Retailers, CPG brands, and e-commerce platforms pay top dollar for buyer intent and spending patterns.',
    },
    {
      category: 'Digital & Device Footprint',
      icon: 'device',
      likelihood: likelihood(breakdown.behavioralSignals * 0.5 + breakdown.aiPowerUser * 0.5),
      attributes: [
        'Device IDs (IDFA / GAID)', 'IP address history', 'Browser fingerprint',
        'Email engagement score', 'App usage patterns', 'Social media profiles',
        'Cookie-based segments', 'Cross-device graph',
      ],
      brokers: ['LiveRamp', 'Oracle BlueKai', 'Nielsen', 'The Trade Desk'],
      description: 'Digital identifiers link your online activity across devices and platforms. Ad tech companies use this to build persistent profiles for targeted advertising.',
    },
    {
      category: 'Health & Wellness (Inferred)',
      icon: 'health',
      likelihood: likelihood(
        (allDataClasses.some(d => ['Health records', 'Sexual preferences'].includes(d)) ? 80 : 0)
        + breakdown.ageGroup * 0.3
      ),
      attributes: [
        'Inferred health conditions', 'OTC & supplement purchases',
        'Fitness activity signals', 'Diet and nutrition interests',
        'Health insurance type', 'Prescription drug categories (inferred)',
        'Mental wellness signals',
      ],
      brokers: ['IQVIA', 'Acxiom Health', 'Solera Health', 'specialty brokers'],
      description: 'Health data is inferred from purchases, search behavior, and location visits (e.g. pharmacies, clinics). Pharma companies, insurers, and health marketers are primary buyers.',
    },
    {
      category: 'Political & Civic Profile',
      icon: 'civic',
      likelihood: likelihood(breakdown.ageGroup * 0.5 + breakdown.demographicValue * 0.3 + (hasPhysicalExposure ? 20 : 0)),
      attributes: [
        'Voter registration status', 'Party affiliation', 'Voting frequency',
        'Political donation history', 'Issue-based segments',
        'Civic engagement score', 'Precinct data',
      ],
      brokers: ['L2 Political', 'Catalist', 'i360', 'TargetSmart'],
      description: 'Voter file data is public record in most US states. Political campaigns, PACs, and advocacy groups purchase enriched voter profiles for micro-targeting.',
    },
    {
      category: 'Life Events & Triggers',
      icon: 'life',
      likelihood: likelihood(breakdown.demographicValue * 0.5 + breakdown.ageGroup * 0.3),
      attributes: [
        'Recent mover', 'New homeowner', 'New parent', 'Recent graduate',
        'Marriage or divorce signal', 'Retirement indicator',
        'Job change', 'New vehicle purchase',
      ],
      brokers: ['Epsilon', 'Acxiom', 'Experian', 'Equifax'],
      description: 'Life event triggers are gold for marketers. People in transition spend significantly more — movers, new parents, and recent grads are highly sought-after segments.',
    },
    {
      category: 'Professional & B2B Identity',
      icon: 'work',
      likelihood: likelihood(breakdown.companyExposure * 0.6 + (isCorporateEmail ? 30 : 0)),
      attributes: [
        'Job title and seniority', 'Employer and industry',
        'Company size and revenue', 'LinkedIn profile signals',
        'Professional certifications', 'Business email address',
        'Decision-maker flag', 'Technology stack used',
      ],
      brokers: ['ZoomInfo', 'Dun & Bradstreet', 'Bombora', 'Clearbit'],
      description: 'B2B data is among the most expensive per record. Sales and marketing teams pay $1–$5 per contact for enriched professional profiles used in outbound campaigns.',
    },
  ];

  // ── Response ─────────────────────────────────────────────────────────────────

  return NextResponse.json({
    totalScore,
    dataValue,
    riskLevel,
    exposureCount: brokers.length,
    brokers,
    breakdown: {
      demographicValue:   Math.round(breakdown.demographicValue),
      behavioralSignals:  Math.round(breakdown.behavioralSignals),
      purchaseIntent:     Math.round(breakdown.purchaseIntent),
      dataExposure:       Math.round(breakdown.dataExposure),
      consentLevel:       Math.round(breakdown.consentLevel),
      companyExposure:    Math.round(breakdown.companyExposure),
      assetOwnership:     Math.round(breakdown.assetOwnership),
      investmentExposure: Math.round(breakdown.investmentExposure),
      aiPowerUser:        Math.round(breakdown.aiPowerUser),
      ageGroup:           Math.round(breakdown.ageGroup),
      phoneType:          Math.round(breakdown.phoneType),
    },
    dataMarketProfile,
    // Real breach metadata — forwarded to the insights API
    breachMeta: {
      totalBreaches:      breachCount,
      verifiedBreaches:   verifiedBreaches.length,
      sensitiveBreaches:  sensitiveBreaches.length,
      mostRecentBreach,
      exposedDataTypes:   allDataClasses,
      hasPasswordExposure,
      hasFinancialExposure,
      hasBehavioralExposure,
      hasSensitiveExposure,
      topBreaches: sortedBreaches.slice(0, 5).map(b => ({
        name:      b.Title || b.Name,
        date:      b.BreachDate,
        dataTypes: b.DataClasses.slice(0, 4),
      })),
    },
  });
}
