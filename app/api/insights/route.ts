import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { breakdown, totalScore, riskLevel, dataValue } = await req.json();

  const prompt = `You are a privacy expert analyzing someone's data exposure profile. Based on their privacy score data, generate personalized insights and recommendations.

Data Profile:
- Total Privacy Score: ${totalScore}/1000 (higher = more exposed)
- Risk Level: ${riskLevel}
- Estimated Data Value: $${dataValue}
- Breakdown scores (0-100, higher = more exposed):
  * Demographic Value: ${breakdown.demographicValue}
  * Behavioral Signals: ${breakdown.behavioralSignals}
  * Purchase Intent Score: ${breakdown.purchaseIntent}
  * Data Exposure Level: ${breakdown.dataExposure}
  * Consent Control Level: ${breakdown.consentLevel}

Generate exactly this JSON structure (no markdown, no extra text):
{
  "insights": [
    "First specific insight about their data situation (2 sentences, specific to their scores)",
    "Second specific insight about their highest risk area (2 sentences)",
    "Third insight about market implications of their data value (2 sentences)"
  ],
  "recommendations": [
    "First actionable recommendation with specific steps",
    "Second actionable recommendation",
    "Third actionable recommendation"
  ]
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    // Fallback insights if API fails
    return NextResponse.json({
      insights: [
        `With a score of ${totalScore}/1000 and ${riskLevel} risk level, your data profile is actively traded among data brokers. Your behavioral signals score of ${breakdown.behavioralSignals}/100 suggests significant online activity is being tracked.`,
        `Your estimated data value of $${dataValue} puts you in the ${riskLevel === 'High' ? 'top tier' : 'mid-range'} of consumer data profiles. Data brokers typically sell profiles like yours to advertisers, insurers, and financial institutions.`,
        `Your consent control score of ${breakdown.consentLevel}/100 indicates you have ${breakdown.consentLevel > 50 ? 'some' : 'very limited'} control over how your data is used. Most data sharing happens without your explicit knowledge.`
      ],
      recommendations: [
        'Submit opt-out requests to the top 10 data brokers listed below — this alone can reduce your exposure score by 30-40% within 90 days.',
        'Enable two-factor authentication and use a unique email alias (like yourname+shopping@gmail.com) for retail and newsletter signups to segment your data trail.',
        'Review and revoke app permissions monthly. Many apps sell location and behavioral data — focus on shopping, weather, and gaming apps first.'
      ]
    });
  }
}
