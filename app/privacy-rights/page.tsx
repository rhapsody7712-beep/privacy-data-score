'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, ExternalLink, CheckCircle, Search, Filter, ChevronDown } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Category =
  | 'Data Broker'
  | 'Ad Tech'
  | 'Big Tech'
  | 'Financial'
  | 'Telecom'
  | 'Retail & Commerce'
  | 'Health'
  | 'Background Check'
  | 'AI & Machine Learning';

interface Company {
  name: string;
  category: Category;
  description: string;
  dsr_url: string;
  rights: string[];
  difficulty: Difficulty;
  notes?: string;
}

const COMPANIES: Company[] = [
  // ── Data Brokers ──────────────────────────────────────────────────────────
  {
    name: 'Acxiom',
    category: 'Data Broker',
    description: 'One of the largest data brokers in the world, selling demographic, financial, and behavioral data to thousands of companies.',
    dsr_url: 'https://isapps.acxiom.com/optout/optout.aspx',
    rights: ['Opt Out', 'Access', 'Delete'],
    difficulty: 'Medium',
    notes: 'Requires email verification. Covers Acxiom InfoBase products.',
  },
  {
    name: 'LexisNexis',
    category: 'Data Broker',
    description: 'Aggregates public records, court data, and identity data used by insurers, employers, and law enforcement.',
    dsr_url: 'https://optout.lexisnexis.com/',
    rights: ['Opt Out', 'Access', 'Delete'],
    difficulty: 'Medium',
  },
  {
    name: 'Experian Marketing Services',
    category: 'Data Broker',
    description: 'Sells consumer data for marketing targeting including income, lifestyle, and purchase behavior segments.',
    dsr_url: 'https://www.experian.com/privacy/center.html',
    rights: ['Opt Out', 'Access', 'Delete', 'Correct'],
    difficulty: 'Medium',
  },
  {
    name: 'Epsilon',
    category: 'Data Broker',
    description: 'Powers loyalty programs and sells purchase history and life event data to CPG and retail brands.',
    dsr_url: 'https://us.epsilon.com/privacy/consumer-data-request',
    rights: ['Opt Out', 'Access', 'Delete'],
    difficulty: 'Easy',
  },
  {
    name: 'Oracle Data Cloud',
    category: 'Data Broker',
    description: 'Formerly Datalogix — sells data segments for online ad targeting across demographics, purchase intent, and behavior.',
    dsr_url: 'https://datacloudoptout.oracle.com/',
    rights: ['Opt Out'],
    difficulty: 'Easy',
    notes: 'Simple opt-out form. Applies to Oracle AddThis and Moat products too.',
  },
  {
    name: 'CoreLogic',
    category: 'Data Broker',
    description: 'Largest aggregator of property and real estate data. Used by insurers, lenders, and real estate companies.',
    dsr_url: 'https://www.corelogic.com/privacy-center/',
    rights: ['Opt Out', 'Access', 'Delete'],
    difficulty: 'Medium',
  },
  {
    name: 'Equifax (Marketing)',
    category: 'Data Broker',
    description: 'Beyond credit — Equifax sells consumer segmentation data including income estimates and purchase behavior.',
    dsr_url: 'https://www.equifax.com/personal/privacy/',
    rights: ['Opt Out', 'Access', 'Delete', 'Correct'],
    difficulty: 'Medium',
  },
  {
    name: 'TransUnion (Marketing)',
    category: 'Data Broker',
    description: 'Sells consumer data products for insurance, marketing, and identity verification beyond credit reporting.',
    dsr_url: 'https://www.transunion.com/consumer-privacy',
    rights: ['Opt Out', 'Access', 'Delete'],
    difficulty: 'Medium',
  },

  // ── Background Check ──────────────────────────────────────────────────────
  {
    name: 'Spokeo',
    category: 'Background Check',
    description: 'Aggregates phone, address, email, relatives, and social profiles into public background reports.',
    dsr_url: 'https://www.spokeo.com/optout',
    rights: ['Opt Out', 'Delete'],
    difficulty: 'Easy',
    notes: 'Search for your listing, then submit the opt-out form. Takes 24–48 hours.',
  },
  {
    name: 'BeenVerified',
    category: 'Background Check',
    description: 'Sells background reports including criminal records, address history, and social profiles.',
    dsr_url: 'https://www.beenverified.com/app/optout/search',
    rights: ['Opt Out', 'Delete'],
    difficulty: 'Easy',
  },
  {
    name: 'Whitepages',
    category: 'Background Check',
    description: 'One of the oldest people-search sites. Sells name, address, phone, and relatives data.',
    dsr_url: 'https://www.whitepages.com/suppression_requests',
    rights: ['Opt Out', 'Delete'],
    difficulty: 'Easy',
    notes: 'Requires phone verification to suppress your listing.',
  },
  {
    name: 'Intelius',
    category: 'Background Check',
    description: 'Provides background checks, reverse phone lookup, and people search. Widely used by employers.',
    dsr_url: 'https://www.intelius.com/opt-out',
    rights: ['Opt Out', 'Delete'],
    difficulty: 'Easy',
  },
  {
    name: 'TruthFinder',
    category: 'Background Check',
    description: 'Sells detailed reports including criminal history, contact info, and social media profiles.',
    dsr_url: 'https://www.truthfinder.com/opt-out/',
    rights: ['Opt Out', 'Delete'],
    difficulty: 'Easy',
  },
  {
    name: 'InstantCheckmate',
    category: 'Background Check',
    description: 'Background check service aggregating public records, criminal history, and contact information.',
    dsr_url: 'https://www.instantcheckmate.com/opt-out/',
    rights: ['Opt Out', 'Delete'],
    difficulty: 'Easy',
  },
  {
    name: 'Radaris',
    category: 'Background Check',
    description: 'People search engine that indexes addresses, relatives, court records, and social profiles.',
    dsr_url: 'https://radaris.com/control/privacy',
    rights: ['Opt Out', 'Delete'],
    difficulty: 'Medium',
  },
  {
    name: 'MyLife',
    category: 'Background Check',
    description: 'Publishes reputation scores and background data for individuals. Widely indexed by search engines.',
    dsr_url: 'https://www.mylife.com/privacy/optout-request',
    rights: ['Opt Out', 'Delete'],
    difficulty: 'Hard',
    notes: 'MyLife has historically made opt-out difficult. May require phone call.',
  },
  {
    name: 'PeopleFinders',
    category: 'Background Check',
    description: 'Aggregates public records, addresses, relatives, and criminal history into public-facing reports.',
    dsr_url: 'https://www.peoplefinders.com/opt-out',
    rights: ['Opt Out', 'Delete'],
    difficulty: 'Easy',
  },
  {
    name: 'ZabaSearch',
    category: 'Background Check',
    description: 'Free people search site indexing public records. Owned by Intelius.',
    dsr_url: 'https://www.zabasearch.com/block_records/',
    rights: ['Opt Out'],
    difficulty: 'Easy',
  },

  // ── Ad Tech ───────────────────────────────────────────────────────────────
  {
    name: 'LiveRamp',
    category: 'Ad Tech',
    description: 'Builds cross-device identity graphs that link your online and offline activity for ad targeting.',
    dsr_url: 'https://liveramp.com/opt_out/',
    rights: ['Opt Out', 'Delete'],
    difficulty: 'Easy',
    notes: 'Opt-out removes you from their identity graph used by hundreds of brands.',
  },
  {
    name: 'The Trade Desk',
    category: 'Ad Tech',
    description: 'Major demand-side platform for programmatic advertising. Holds detailed behavioral segments.',
    dsr_url: 'https://www.thetradedesk.com/us/privacy',
    rights: ['Opt Out'],
    difficulty: 'Easy',
  },
  {
    name: 'Nielsen',
    category: 'Ad Tech',
    description: 'Tracks digital and TV audience behavior for media measurement and ad targeting.',
    dsr_url: 'https://www.nielsen.com/us/en/legal/privacy-statement/digital-measurement/',
    rights: ['Opt Out'],
    difficulty: 'Easy',
  },
  {
    name: 'Criteo',
    category: 'Ad Tech',
    description: 'Retargeting platform that tracks your shopping behavior across thousands of retail sites.',
    dsr_url: 'https://www.criteo.com/privacy/disable-criteo-services-on-internet-browsers/',
    rights: ['Opt Out'],
    difficulty: 'Easy',
  },
  {
    name: 'Bombora',
    category: 'Ad Tech',
    description: 'B2B intent data company — tracks your professional research activity across business sites.',
    dsr_url: 'https://bombora.com/privacy/',
    rights: ['Opt Out', 'Access', 'Delete'],
    difficulty: 'Easy',
  },

  // ── Big Tech ──────────────────────────────────────────────────────────────
  {
    name: 'Google',
    category: 'Big Tech',
    description: 'Holds extensive data across Search, YouTube, Maps, Gmail, and Android. One of the most comprehensive profiles in existence.',
    dsr_url: 'https://myaccount.google.com/data-and-privacy',
    rights: ['Access', 'Delete', 'Correct', 'Export', 'Opt Out of Ads'],
    difficulty: 'Easy',
    notes: 'Use "My Activity" to delete history and "Ad Settings" to opt out of personalization.',
  },
  {
    name: 'Meta (Facebook & Instagram)',
    category: 'Big Tech',
    description: 'Tracks social interactions, location, interests, and off-platform behavior via the Meta Pixel.',
    dsr_url: 'https://www.facebook.com/help/contact/2069523676594974',
    rights: ['Access', 'Delete', 'Correct', 'Export', 'Opt Out'],
    difficulty: 'Medium',
    notes: 'Visit Settings → Your Facebook Information → Access Your Information for full data.',
  },
  {
    name: 'Apple',
    category: 'Big Tech',
    description: 'Holds device data, app usage, health, location, and financial data via Apple Pay and iCloud.',
    dsr_url: 'https://privacy.apple.com/',
    rights: ['Access', 'Delete', 'Correct', 'Export'],
    difficulty: 'Easy',
    notes: 'Apple provides a dedicated privacy portal for data requests.',
  },
  {
    name: 'Amazon',
    category: 'Big Tech',
    description: 'Holds purchase history, Alexa voice data, Prime Video watch history, and browsing behavior.',
    dsr_url: 'https://www.amazon.com/gp/help/customer/display.html?nodeId=GYSDRGWQ2C2CNTNS',
    rights: ['Access', 'Delete', 'Correct', 'Opt Out of Ads'],
    difficulty: 'Medium',
  },
  {
    name: 'Microsoft',
    category: 'Big Tech',
    description: 'Collects data across Windows, Office, LinkedIn, Bing, and Xbox including productivity and behavioral data.',
    dsr_url: 'https://account.microsoft.com/privacy',
    rights: ['Access', 'Delete', 'Correct', 'Export', 'Opt Out'],
    difficulty: 'Easy',
  },
  {
    name: 'X (Twitter)',
    category: 'Big Tech',
    description: 'Holds social activity, DMs, interests, and inferred demographics used for ad targeting.',
    dsr_url: 'https://twitter.com/settings/your_twitter_data',
    rights: ['Access', 'Delete', 'Export', 'Opt Out of Ads'],
    difficulty: 'Easy',
  },
  {
    name: 'LinkedIn',
    category: 'Big Tech',
    description: 'Holds professional identity, employment history, and behavioral data shared with advertisers.',
    dsr_url: 'https://www.linkedin.com/psettings/privacy',
    rights: ['Access', 'Delete', 'Correct', 'Export', 'Opt Out'],
    difficulty: 'Easy',
  },

  // ── Financial ─────────────────────────────────────────────────────────────
  {
    name: 'Experian (Credit)',
    category: 'Financial',
    description: 'One of the three major credit bureaus. Holds your full credit history, score, and financial behavior.',
    dsr_url: 'https://www.experian.com/disputes/main.html',
    rights: ['Access', 'Correct', 'Freeze', 'Alert'],
    difficulty: 'Easy',
    notes: 'Free credit freeze available. Freezing prevents new accounts being opened in your name.',
  },
  {
    name: 'Equifax (Credit)',
    category: 'Financial',
    description: 'Major credit bureau holding credit history, employment data, and identity verification records.',
    dsr_url: 'https://www.equifax.com/personal/credit-report-services/',
    rights: ['Access', 'Correct', 'Freeze', 'Alert'],
    difficulty: 'Easy',
  },
  {
    name: 'TransUnion (Credit)',
    category: 'Financial',
    description: 'Credit bureau also providing identity protection, employment screening, and tenant screening.',
    dsr_url: 'https://www.transunion.com/credit-help',
    rights: ['Access', 'Correct', 'Freeze', 'Alert'],
    difficulty: 'Easy',
  },
  {
    name: 'Plaid',
    category: 'Financial',
    description: 'Connects to your bank accounts via apps like Venmo, Robinhood, and Coinbase. Holds transaction history.',
    dsr_url: 'https://plaid.com/legal/privacy-statement/',
    rights: ['Access', 'Delete'],
    difficulty: 'Medium',
    notes: 'Use the Plaid Portal at my.plaid.com to see and revoke app connections.',
  },
  {
    name: 'Early Warning Services (Zelle)',
    category: 'Financial',
    description: 'Runs Zelle and ChexSystems. Holds bank account history and payment behavior used by banks.',
    dsr_url: 'https://www.earlywarning.com/privacy/consumer-privacy',
    rights: ['Access', 'Correct', 'Dispute'],
    difficulty: 'Medium',
  },

  // ── Telecom ───────────────────────────────────────────────────────────────
  {
    name: 'AT&T',
    category: 'Telecom',
    description: 'Holds call records, location history, browsing data, and sells aggregated customer insights.',
    dsr_url: 'https://www.att.com/ecms/dam/att/consumer/privacy/att-privacy-notice-full.pdf',
    rights: ['Access', 'Opt Out', 'Delete'],
    difficulty: 'Hard',
    notes: 'Call AT&T privacy center or submit online. Opting out of data sharing is buried in settings.',
  },
  {
    name: 'Verizon',
    category: 'Telecom',
    description: 'Uses call data, app usage, and location to sell Custom Experience and Custom Experience Plus programs.',
    dsr_url: 'https://www.verizon.com/about/privacy/full-privacy-policy',
    rights: ['Opt Out', 'Access'],
    difficulty: 'Medium',
    notes: 'Opt out of Custom Experience programs in My Verizon account settings.',
  },
  {
    name: 'T-Mobile',
    category: 'Telecom',
    description: 'Sells anonymized and aggregated data via T-Mobile Advertising Solutions and partner programs.',
    dsr_url: 'https://www.t-mobile.com/privacy-center',
    rights: ['Opt Out', 'Access', 'Delete'],
    difficulty: 'Medium',
  },

  // ── Retail & Commerce ─────────────────────────────────────────────────────
  {
    name: 'Walmart',
    category: 'Retail & Commerce',
    description: 'Collects purchase history, location visits, and behavioral data across Walmart and Sam\'s Club.',
    dsr_url: 'https://www.walmart.com/help/article/walmart-us-privacy-notice/3ce0808a8ff146888b2e3d0136e8fc38',
    rights: ['Access', 'Delete', 'Opt Out'],
    difficulty: 'Medium',
  },
  {
    name: 'Target',
    category: 'Retail & Commerce',
    description: 'Famous for predictive analytics on purchase behavior including pregnancy prediction modeling.',
    dsr_url: 'https://corporate.target.com/about/contact-us/privacy-request',
    rights: ['Access', 'Delete', 'Opt Out'],
    difficulty: 'Easy',
  },
  {
    name: 'Mastercard',
    category: 'Retail & Commerce',
    description: 'Sells anonymized transaction data insights. SpendingPulse product is sold to hedge funds and retailers.',
    dsr_url: 'https://www.mastercard.us/en-us/personal/get-support/privacy-choices.html',
    rights: ['Opt Out', 'Access'],
    difficulty: 'Easy',
  },

  // ── Health ────────────────────────────────────────────────────────────────
  {
    name: 'IQVIA',
    category: 'Health',
    description: 'World\'s largest health data broker. Sells prescription, claims, and patient behavior data to pharma companies.',
    dsr_url: 'https://www.iqvia.com/privacy/privacy-notice',
    rights: ['Opt Out', 'Access'],
    difficulty: 'Hard',
    notes: 'Opt-out process is complex. Submit via their privacy portal or written request.',
  },
  {
    name: 'GoodRx',
    category: 'Health',
    description: 'Shares prescription data with advertisers and data brokers. FTC settled charges in 2023.',
    dsr_url: 'https://www.goodrx.com/privacy-rights-request',
    rights: ['Access', 'Delete', 'Opt Out'],
    difficulty: 'Easy',
    notes: 'GoodRx settled with FTC in 2023 for sharing health data with Facebook and Google.',
  },
  {
    name: '23andMe',
    category: 'Health',
    description: 'Holds genetic and ancestry data. Has faced data breaches and sells aggregate genetic research data.',
    dsr_url: 'https://customercare.23andme.com/hc/en-us/articles/212170838',
    rights: ['Access', 'Delete', 'Export', 'Opt Out'],
    difficulty: 'Medium',
    notes: 'You can delete your account and request destruction of your DNA sample.',
  },

  // ── AI & Machine Learning ─────────────────────────────────────────────────
  {
    name: 'Anthropic (Claude)',
    category: 'AI & Machine Learning',
    description: 'Maker of Claude. Conversations may be used to train models unless you opt out. Also holds account data and usage logs.',
    dsr_url: 'https://privacy.anthropic.com/',
    rights: ['Access', 'Delete', 'Opt Out of Training', 'Export'],
    difficulty: 'Easy',
    notes: 'Go to Settings → Privacy → toggle off "Improve Claude for everyone" to opt out of training data use.',
  },
  {
    name: 'OpenAI (ChatGPT)',
    category: 'AI & Machine Learning',
    description: 'Maker of ChatGPT and GPT-4. Chat history and interactions may be used for model training by default.',
    dsr_url: 'https://privacy.openai.com/policies',
    rights: ['Access', 'Delete', 'Opt Out of Training', 'Export'],
    difficulty: 'Easy',
    notes: 'In ChatGPT Settings → Data Controls → disable "Improve the model for everyone". You can also delete all chat history.',
  },
  {
    name: 'Google DeepMind / Gemini',
    category: 'AI & Machine Learning',
    description: 'Google\'s AI assistant. Gemini conversations are stored and may be reviewed by human reviewers by default.',
    dsr_url: 'https://myaccount.google.com/data-and-privacy',
    rights: ['Access', 'Delete', 'Opt Out of Training', 'Export'],
    difficulty: 'Easy',
    notes: 'Go to myaccount.google.com → Data & Privacy → Gemini Apps Activity to review or pause activity storage.',
  },
  {
    name: 'Microsoft Copilot',
    category: 'AI & Machine Learning',
    description: 'Microsoft\'s AI integrated into Windows, Office, Edge, and Bing. Holds conversation data and usage telemetry.',
    dsr_url: 'https://account.microsoft.com/privacy',
    rights: ['Access', 'Delete', 'Opt Out', 'Export'],
    difficulty: 'Easy',
    notes: 'Visit Microsoft Privacy Dashboard to delete Copilot activity. Enterprise users have additional controls via M365 admin.',
  },
  {
    name: 'Meta AI',
    category: 'AI & Machine Learning',
    description: 'Meta\'s AI assistant embedded in WhatsApp, Instagram, Messenger, and Facebook. Interactions linked to your Meta account.',
    dsr_url: 'https://www.facebook.com/privacy/policy/',
    rights: ['Access', 'Delete', 'Opt Out'],
    difficulty: 'Medium',
    notes: 'Data is governed by Meta\'s main privacy policy. Use Facebook\'s "Access Your Information" tool to review AI interaction data.',
  },
  {
    name: 'Character.AI',
    category: 'AI & Machine Learning',
    description: 'Conversational AI platform with millions of users. Conversations are stored and used to train their models.',
    dsr_url: 'https://character.ai/privacy',
    rights: ['Access', 'Delete', 'Opt Out'],
    difficulty: 'Medium',
    notes: 'Submit a data deletion request via their privacy page. No self-serve opt-out from training data use as of 2025.',
  },
  {
    name: 'Midjourney',
    category: 'AI & Machine Learning',
    description: 'AI image generation platform. All prompts and generated images are public by default and used for training.',
    dsr_url: 'https://docs.midjourney.com/hc/en-us/articles/18338559570957',
    rights: ['Delete', 'Opt Out of Public Display'],
    difficulty: 'Medium',
    notes: 'Use /private mode (paid plans only) to prevent prompts from being public. Request deletion via support.',
  },
  {
    name: 'Stability AI',
    category: 'AI & Machine Learning',
    description: 'Maker of Stable Diffusion. Operates DreamStudio and APIs used by many third-party apps for image generation.',
    dsr_url: 'https://stability.ai/privacy-policy',
    rights: ['Access', 'Delete', 'Opt Out'],
    difficulty: 'Medium',
  },
  {
    name: 'Cohere',
    category: 'AI & Machine Learning',
    description: 'Enterprise-focused AI company providing NLP models to businesses. Holds API usage data and enterprise customer data.',
    dsr_url: 'https://cohere.com/privacy',
    rights: ['Access', 'Delete', 'Opt Out'],
    difficulty: 'Easy',
  },
  {
    name: 'Perplexity AI',
    category: 'AI & Machine Learning',
    description: 'AI-powered search engine. Stores search queries, conversation history, and usage patterns.',
    dsr_url: 'https://www.perplexity.ai/privacy',
    rights: ['Access', 'Delete', 'Opt Out'],
    difficulty: 'Easy',
    notes: 'Disable "AI Data for Model Training" in Settings → Account to opt out of training use.',
  },
  {
    name: 'Runway ML',
    category: 'AI & Machine Learning',
    description: 'AI video and image generation platform. Uploaded content and prompts may be used for model improvement.',
    dsr_url: 'https://runwayml.com/privacy',
    rights: ['Access', 'Delete', 'Opt Out'],
    difficulty: 'Medium',
  },
  {
    name: 'Hugging Face',
    category: 'AI & Machine Learning',
    description: 'AI model hub and collaboration platform. Holds account data, model usage, and dataset uploads.',
    dsr_url: 'https://huggingface.co/privacy',
    rights: ['Access', 'Delete', 'Export'],
    difficulty: 'Easy',
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  'Data Broker', 'Background Check', 'Ad Tech', 'Big Tech',
  'Financial', 'Telecom', 'Retail & Commerce', 'Health', 'AI & Machine Learning',
];

const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  'Data Broker':       { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20' },
  'Background Check':  { bg: 'bg-orange-500/10',  text: 'text-orange-400',  border: 'border-orange-500/20' },
  'Ad Tech':           { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/20' },
  'Big Tech':          { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20' },
  'Financial':         { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'Telecom':           { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/20' },
  'Retail & Commerce':    { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20' },
  'Health':               { bg: 'bg-pink-500/10',   text: 'text-pink-400',   border: 'border-pink-500/20' },
  'AI & Machine Learning':{ bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
};

const DIFFICULTY_COLORS: Record<Difficulty, { text: string; bg: string }> = {
  Easy:   { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  Medium: { text: 'text-amber-400',   bg: 'bg-amber-500/10' },
  Hard:   { text: 'text-red-400',     bg: 'bg-red-500/10' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyRightsPage() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('privacy-rights-completed');
    if (stored) setCompleted(new Set(JSON.parse(stored)));
  }, []);

  const toggleCompleted = (name: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      localStorage.setItem('privacy-rights-completed', JSON.stringify([...next]));
      return next;
    });
  };

  const filtered = COMPANIES.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const matchesCompleted = showCompleted || !completed.has(c.name);
    return matchesSearch && matchesCategory && matchesCompleted;
  });

  const completedCount = completed.size;
  const totalCount = COMPANIES.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Shield className="w-3 h-3" />
          </div>
          <span className="font-bold">Privacy Rights Center</span>
        </div>
        <div className="w-20" />
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Exercise Your Privacy Rights</h1>
          <p className="text-white/50 max-w-2xl">
            Every company below has a legal obligation to honor your data subject rights.
            Visit each page to opt out of data sales, request deletion, or access what they hold on you.
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-2xl font-bold">{completedCount}</span>
              <span className="text-white/40 text-sm ml-1">/ {totalCount} completed</span>
            </div>
            <span className={`text-sm font-semibold ${progressPct >= 75 ? 'text-emerald-400' : progressPct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
              {progressPct}% done
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-violet-500 to-blue-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-white/30 mt-2">
            Progress is saved in your browser. Mark items done as you complete each opt-out.
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {(['All', ...CATEGORIES] as (Category | 'All')[]).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  activeCategory === cat
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'bg-white/3 border-white/10 text-white/50 hover:text-white/80'
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1.5 text-white/30">
                    {COMPANIES.filter(c => c.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Show completed toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/40">
              Showing <span className="text-white/70 font-medium">{filtered.length}</span> companies
            </p>
            <button
              onClick={() => setShowCompleted(p => !p)}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              {showCompleted ? 'Hide completed' : 'Show completed'}
            </button>
          </div>
        </div>

        {/* Company Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(company => {
            const isDone = completed.has(company.name);
            const catColor = CATEGORY_COLORS[company.category];
            const diffColor = DIFFICULTY_COLORS[company.difficulty];

            return (
              <div
                key={company.name}
                className={`bg-white/3 border rounded-xl p-4 flex flex-col gap-3 transition-all ${
                  isDone ? 'border-emerald-500/20 opacity-60' : 'border-white/8 hover:border-white/15'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className={`font-bold text-sm ${isDone ? 'line-through text-white/40' : ''}`}>
                        {company.name}
                      </h3>
                      {isDone && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-md border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
                        {company.category}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-md ${diffColor.bg} ${diffColor.text}`}>
                        {company.difficulty} opt-out
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-white/45 leading-relaxed">{company.description}</p>

                {/* Notes */}
                {company.notes && (
                  <p className="text-xs text-amber-400/70 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2 leading-relaxed">
                    {company.notes}
                  </p>
                )}

                {/* Rights */}
                <div className="flex flex-wrap gap-1.5">
                  {company.rights.map(right => (
                    <span key={right} className="text-xs bg-white/5 border border-white/8 text-white/50 px-2 py-0.5 rounded-md">
                      {right}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={company.dsr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 text-xs font-medium px-3 py-2 rounded-lg transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Go to Privacy Page
                  </a>
                  <button
                    onClick={() => toggleCompleted(company.name)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400'
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {isDone ? 'Done' : 'Mark done'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <p>No companies match your filter.</p>
          </div>
        )}

        {/* Footer note */}
        <div className="text-center text-xs text-white/20 pb-6 space-y-1">
          <p>Links are provided for informational purposes. Opt-out processes vary and may change over time.</p>
          <p>For California residents: CCPA gives you the right to opt out, access, and delete at all covered businesses.</p>
        </div>
      </div>
    </main>
  );
}
