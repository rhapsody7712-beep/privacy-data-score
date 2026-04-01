import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const {
    name,
    totalScore,
    dataValue,
    riskLevel,
    breakdown,
    breachMeta,
  } = await req.json();

  // Build a rich breach context string for Claude
  const breachContext = breachMeta?.totalBreaches > 0
    ? `
REAL BREACH DATA (from HaveIBeenPwned):
- Found in ${breachMeta.totalBreaches} known data breaches
- ${breachMeta.verifiedBreaches} verified breaches, ${breachMeta.sensitiveBreaches} sensitive breaches
- Most recent breach: ${breachMeta.mostRecentBreach ?? 'unknown'}
- Exposed data types: ${breachMeta.exposedDataTypes?.join(', ') || 'unknown'}
- Password exposed: ${breachMeta.hasPasswordExposure ? 'YES — critical' : 'No'}
- Financial data exposed: ${breachMeta.hasFinancialExposure ? 'YES — critical' : 'No'}
- Behavioral data exposed: ${breachMeta.hasBehavioralExposure ? 'YES' : 'No'}
- Sensitive breaches: ${breachMeta.hasSensitiveExposure ? 'YES' : 'No'}
- Top breaches: ${breachMeta.topBreaches?.map((b: { name: string; date: string; dataTypes: string[] }) =>
    `${b.name} (${b.date}, exposed: ${b.dataTypes.join(', ')})`
  ).join(' | ') || 'none'}
`
    : `
BREACH DATA: This email was NOT found in any known data breaches (clean record).
`;

  const prompt = `You are a data privacy expert analyzing someone's Privacy Data Score.

User: ${name}
Privacy Score: ${totalScore}/1000
Estimated Data Value: $${dataValue}
Risk Level: ${riskLevel}

Score Breakdown:
- Demographic Value: ${breakdown.demographicValue}/100
- Behavioral Signals: ${breakdown.behavioralSignals}/100
- Purchase Intent: ${breakdown.purchaseIntent}/100
- Data Exposure: ${breakdown.dataExposure}/100
- Consent Control: ${breakdown.consentLevel}/100

${breachContext}

Generate a JSON object ONLY — no markdown, no backticks, no explanation. Use this exact structure:
{
  "insights": [
    "Specific insight about their breach exposure using the real data above",
    "Specific insight about behavioral/demographic data risks",
    "Specific insight about their overall financial risk from this exposure"
  ],
  "recommendations": [
    "Specific action based on their actual breach history",
    "Specific action to reduce behavioral tracking",
    "Specific action to protect their most exposed data type"
  ]
}

Rules:
- Be specific — use the actual breach names, data types, and dates from above
- If passwords were exposed, lead with urgency about credential stuffing
- If financial data was exposed, mention specific fraud risks
- Keep each item to 1-2 punchy sentences
- Use numbers and specifics — avoid generic advice`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = (response.content[0] as { type: string; text: string }).text;
    const parsed = JSON.parse(text.trim());
    return NextResponse.json(parsed);

  } catch (err) {
    console.error('Insights API error:', err);

    // Intelligent fallback using real breach data
    const hasBreaches   = breachMeta?.totalBreaches > 0;
    const breachNames   = breachMeta?.topBreaches?.map((b: { name: string }) => b.name).join(', ') || '';
    const exposedTypes  = breachMeta?.exposedDataTypes?.slice(0, 3).join(', ') || 'personal data';

    return NextResponse.json({
      insights: hasBreaches ? [
        `Your email appeared in ${breachMeta.totalBreaches} data breaches (${breachNames}) — your profile is actively circulating among data brokers and on dark web markets.`,
        `The breach exposure of your ${exposedTypes} means advertisers and data brokers can cross-reference your identity across ${Math.round(breachMeta.totalBreaches * 3)} linked databases.`,
        `At $${dataValue} estimated value, your data profile is ${dataValue > 400 ? 'significantly above' : 'near'} the US average — making you a recurring target for credential stuffing and targeted phishing.`,
      ] : [
        `Your email has no known breach history — that's rare and valuable. Your score of ${totalScore} is driven primarily by ambient data broker activity rather than direct breach exposure.`,
        `Even without breach exposure, your behavioral and demographic data is estimated at $${dataValue} — data brokers build profiles from public records, social signals, and purchase behavior.`,
        `Your clean breach record is an asset to protect. Maintaining strong password hygiene and limiting third-party app permissions will keep your score low.`,
      ],
      recommendations: hasBreaches ? [
        `${breachMeta.hasPasswordExposure ? 'URGENT: Change passwords on all accounts immediately — your credentials were directly exposed. Use a password manager like 1Password or Bitwarden.' : `Submit opt-out requests to the top 5 data brokers that hold your ${exposedTypes} — this can reduce your score by 15–20% within 30 days.`}`,
        'Enable login alerts and two-factor authentication on all financial, email, and social accounts — your exposed data makes credential stuffing attacks 3x more likely.',
        `Monitor your credit report at annualcreditreport.com and consider a credit freeze at all three bureaus${breachMeta.hasFinancialExposure ? ' — your financial data was directly exposed' : ''}.`,
      ] : [
        'Submit opt-out requests to Acxiom, Spokeo, BeenVerified, and Whitepages — even without breach exposure, these brokers build profiles from public records.',
        'Enable Global Privacy Control (GPC) in your browser settings and audit third-party app permissions on your phone quarterly.',
        'Review and minimize data sharing on Google, Amazon, and Meta accounts — these are the primary feeds into commercial data broker databases.',
      ],
    });
  }
}
