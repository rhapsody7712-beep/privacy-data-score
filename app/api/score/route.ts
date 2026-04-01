import { NextRequest, NextResponse } from 'next/server';

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h ^= h << 13; h ^= h >> 17; h ^= h << 5;
    return (h >>> 0) / 0xFFFFFFFF;
  };
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

const HIGH_VALUE_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];
const BUSINESS_DOMAINS_MARKERS = ['.edu', '.gov', '.org'];
const DATA_BROKERS = [
  'Acxiom', 'Experian', 'LexisNexis', 'Equifax', 'TransUnion',
  'CoreLogic', 'Epsilon', 'Oracle Data Cloud', 'Nielsen', 'IRI',
  'Dun & Bradstreet', 'Spokeo', 'BeenVerified', 'Intelius', 'PeopleFinder',
  'Whitepages', 'ZoomInfo', 'Clearbit', 'FullContact', 'LiveRamp'
];

export async function POST(req: NextRequest) {
  const { name, email, phone } = await req.json();

  const rand = seededRandom(email + name);
  const domain = email.split('@')[1] || '';
  const isHighValueDomain = HIGH_VALUE_DOMAINS.includes(domain.toLowerCase());
  const isBusinessDomain = BUSINESS_DOMAINS_MARKERS.some(m => domain.includes(m));
  const hasPhone = !!phone;
  const nameLengthFactor = clamp(name.replace(/\s/g, '').length / 15, 0.5, 1.0);

  // Demographic value (0-100): older accounts on mainstream domains score higher
  const demographicBase = isHighValueDomain ? 65 : isBusinessDomain ? 45 : 55;
  const demographicValue = clamp(
    Math.round(demographicBase + (rand() * 30 - 5) + (nameLengthFactor * 10)),
    20, 100
  );

  // Behavioral signals (0-100): mainstream emails correlate with more tracked behavior
  const behavioralBase = isHighValueDomain ? 70 : 50;
  const behavioralSignals = clamp(
    Math.round(behavioralBase + (rand() * 25 - 5) + (hasPhone ? 8 : 0)),
    15, 100
  );

  // Purchase intent (0-100): phone presence raises this
  const purchaseBase = 45;
  const purchaseIntent = clamp(
    Math.round(purchaseBase + (rand() * 35) + (hasPhone ? 15 : 0) + (isHighValueDomain ? 5 : 0)),
    10, 100
  );

  // Data exposure (0-100): how many places your data appears
  const exposureBase = isHighValueDomain ? 60 : 40;
  const dataExposure = clamp(
    Math.round(exposureBase + (rand() * 30) + (hasPhone ? 10 : 0)),
    20, 100
  );

  // Consent level (0-100): lower = less control (worse for privacy)
  const consentBase = isBusinessDomain ? 50 : 30;
  const consentLevel = clamp(
    Math.round(consentBase + (rand() * 40)),
    10, 90
  );

  // Weighted score formula
  const rawScore = (
    (demographicValue * 0.25) +
    (behavioralSignals * 0.30) +
    (purchaseIntent * 0.20) +
    (dataExposure * 0.15) +
    (consentLevel * 0.10)
  );

  const totalScore = Math.round(clamp(rawScore * 10, 100, 950));
  const dataValue = Math.round((totalScore / 1000) * 850 * 100) / 100;

  const riskLevel: 'Low' | 'Medium' | 'High' =
    totalScore > 650 ? 'High' : totalScore > 400 ? 'Medium' : 'Low';

  // Which brokers have data - seeded selection
  const exposureCount = Math.round(5 + rand() * 12);
  const shuffled = [...DATA_BROKERS].sort(() => rand() - 0.5);
  const brokersFound = shuffled.slice(0, exposureCount);

  return NextResponse.json({
    totalScore,
    dataValue,
    breakdown: {
      demographicValue,
      behavioralSignals,
      purchaseIntent,
      dataExposure,
      consentLevel,
    },
    riskLevel,
    exposureCount,
    brokersFound,
  });
}
