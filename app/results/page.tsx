'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Shield, AlertTriangle, CheckCircle, TrendingUp, Eye,
  DollarSign, Database, Lock, Zap, Download, Share2,
  ChevronRight, Sparkles, ArrowLeft, X
} from 'lucide-react';
import Link from 'next/link';

interface ScoreData {
  totalScore: number;
  dataValue: number;
  breakdown: {
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
  };
  riskLevel: 'Low' | 'Medium' | 'High';
  exposureCount: number;
  brokersFound: string[];
  dataMarketProfile?: DataMarketCategory[];
  breachMeta?: {
    totalBreaches: number;
    verifiedBreaches: number;
    sensitiveBreaches: number;
    mostRecentBreach: string | null;
    exposedDataTypes: string[];
    hasPasswordExposure: boolean;
    hasFinancialExposure: boolean;
    hasBehavioralExposure: boolean;
    hasSensitiveExposure: boolean;
    topBreaches: { name: string; date: string; dataTypes: string[] }[];
  };
}

interface DataMarketCategory {
  category: string;
  icon: string;
  likelihood: 'High' | 'Medium' | 'Low';
  attributes: string[];
  brokers: string[];
  description: string;
}

interface InsightData {
  insights: string[];
  recommendations: string[];
}

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{count}</>;
}

const RISK_CONFIG = {
  Low: { color: '#10b981', label: 'Low Risk', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  Medium: { color: '#f59e0b', label: 'Medium Risk', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
  High: { color: '#ef4444', label: 'High Risk', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
};

const BREAKDOWN_META = [
  { key: 'demographicValue',   label: 'Demographic Value',    icon: TrendingUp,   desc: 'Age, location, income bracket signals',                  color: '#8b5cf6' },
  { key: 'behavioralSignals',  label: 'Behavioral Signals',   icon: Eye,          desc: 'Browsing, clicks, app usage patterns',                   color: '#3b82f6' },
  { key: 'purchaseIntent',     label: 'Purchase Intent',      icon: DollarSign,   desc: 'Shopping behavior and buying signals',                    color: '#06b6d4' },
  { key: 'dataExposure',       label: 'Data Exposure',        icon: Database,     desc: 'Number of data broker records found',                    color: '#f59e0b' },
  { key: 'consentLevel',       label: 'Consent Control',      icon: Lock,         desc: 'How much control you have over your data',               color: '#10b981' },
  { key: 'companyExposure',    label: 'Company Exposure',     icon: Database,     desc: 'Number of organizations likely holding your data',       color: '#ef4444' },
  { key: 'assetOwnership',     label: 'Asset Ownership',      icon: Shield,       desc: 'Home, vehicle, and property ownership signals',          color: '#f97316' },
  { key: 'investmentExposure', label: 'Investment Exposure',  icon: TrendingUp,   desc: 'Financial portfolio and investment data signals',        color: '#a855f7' },
  { key: 'aiPowerUser',        label: 'AI Power User',        icon: Sparkles,     desc: 'Tech-savviness and AI/digital tool adoption signals',    color: '#22d3ee' },
  { key: 'ageGroup',           label: 'Age Group Signal',     icon: Eye,          desc: 'Estimated digital age based on online trail length',     color: '#84cc16' },
  { key: 'phoneType',          label: 'Phone Type Signal',    icon: Lock,         desc: 'Prepaid vs postpaid linkage to identity records',        color: '#64748b' },
];

function OptOutModal({ brokers, onClose }: { brokers: string[]; onClose: () => void }) {
  const [statuses, setStatuses] = useState<Record<string, 'pending' | 'sending' | 'sent'>>(
    Object.fromEntries(brokers.map(b => [b, 'pending']))
  );

  const sendOptOut = (broker: string) => {
    setStatuses(p => ({ ...p, [broker]: 'sending' }));
    setTimeout(() => setStatuses(p => ({ ...p, [broker]: 'sent' })), 800 + Math.random() * 1200);
  };

  const sendAll = () => {
    brokers.forEach((b, i) => {
      if (statuses[b] === 'pending') {
        setTimeout(() => sendOptOut(b), i * 200);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h3 className="font-bold text-lg">Opt-Out Requests</h3>
            <p className="text-sm text-white/40">Send removal requests to data brokers</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {brokers.map(broker => (
            <div key={broker} className="flex items-center justify-between bg-white/3 border border-white/8 rounded-xl px-4 py-3">
              <span className="text-sm font-medium">{broker}</span>
              {statuses[broker] === 'pending' && (
                <button onClick={() => sendOptOut(broker)} className="text-xs bg-violet-600/20 border border-violet-500/30 text-violet-300 px-3 py-1 rounded-lg hover:bg-violet-600/30 transition-colors">
                  Send Request
                </button>
              )}
              {statuses[broker] === 'sending' && (
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <span className="w-3 h-3 border border-amber-400/50 border-t-amber-400 rounded-full animate-spin" />
                  Sending...
                </span>
              )}
              {statuses[broker] === 'sent' && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Sent
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-white/10">
          <button onClick={sendAll} className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
            Send All Opt-Out Requests
          </button>
          <p className="text-xs text-white/25 text-center mt-2">Simulation only — no real requests are sent</p>
        </div>
      </div>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'User';
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';

  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showOptOut, setShowOptOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setScoreData({ ...data, brokersFound: data.brokersFound ?? data.brokers ?? [], breachMeta: data.breachMeta });
        setLoading(false);

        // Fetch insights after score loads
        setInsightsLoading(true);
        try {
          const insightRes = await fetch('/api/insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ breakdown: data.breakdown, totalScore: data.totalScore, riskLevel: data.riskLevel, dataValue: data.dataValue }),
          });
          const insightData = await insightRes.json();
          setInsights(insightData);
        } catch {
          // insights failed silently
        }
        setInsightsLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
    fetchScore();
  }, [name, email, phone]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadPDF = async () => {
    if (!scoreData) return;
    setPdfLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      doc.setFillColor(10, 10, 15);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Privacy Data Score Report', 20, 30);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 170);
      doc.text(`Generated for: ${name}`, 20, 45);
      doc.text(`Email: ${email}`, 20, 55);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 65);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Score Summary', 20, 85);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 220);
      doc.text(`Total Score: ${scoreData.totalScore}/1000`, 20, 100);
      doc.text(`Data Value: $${scoreData.dataValue}`, 20, 115);
      doc.text(`Risk Level: ${scoreData.riskLevel}`, 20, 130);
      doc.text(`Data Broker Exposure: ${scoreData.exposureCount} brokers`, 20, 145);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Score Breakdown', 20, 165);

      const breakdownItems: [string, number][] = [
        ['Demographic Value', scoreData.breakdown.demographicValue],
        ['Behavioral Signals', scoreData.breakdown.behavioralSignals],
        ['Purchase Intent', scoreData.breakdown.purchaseIntent],
        ['Data Exposure', scoreData.breakdown.dataExposure],
        ['Consent Control', scoreData.breakdown.consentLevel],
      ];

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      breakdownItems.forEach(([label, value], i) => {
        doc.setTextColor(150, 150, 170);
        doc.text(`${label}:`, 20, 180 + i * 14);
        doc.setTextColor(255, 255, 255);
        doc.text(`${value}/100`, 120, 180 + i * 14);
      });

      doc.setTextColor(100, 100, 120);
      doc.setFontSize(9);
      doc.text('This report is for educational purposes only.', 20, 270);
      doc.text('Privacy Data Score™ — privacydatascore.com', 20, 280);

      doc.save(`privacy-score-${name.replace(/\s/g, '-').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
    setPdfLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold mb-2">Scanning Data Brokers...</h2>
          <p className="text-white/40 text-sm">Analyzing your digital footprint</p>
          <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
            {['Checking 4,000+ data brokers...', 'Analyzing behavioral signals...', 'Calculating data value...'].map((msg, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/30">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!scoreData) return null;

  const risk = RISK_CONFIG[scoreData.riskLevel];
  const scorePercent = (scoreData.totalScore / 1000) * 100;
  const gaugeColor = scoreData.riskLevel === 'High' ? '#ef4444' : scoreData.riskLevel === 'Medium' ? '#f59e0b' : '#10b981';

  const gaugeData = [
    { value: scorePercent, fill: gaugeColor },
    { value: 100 - scorePercent, fill: 'transparent' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          New Scan
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Shield className="w-3 h-3" />
          </div>
          <span className="font-bold">Privacy Data Score™</span>
        </div>
        <div className="w-20" />
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-white/40 text-sm mb-1">Results for</p>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="text-white/30 text-sm">{email}</p>
        </div>

        {/* Score Card */}
        <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Gauge */}
            <div className="relative w-48 h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="50%"
                    startAngle={220}
                    endAngle={-40}
                    innerRadius={65}
                    outerRadius={85}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {gaugeData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-black" style={{ color: gaugeColor }}>
                  <AnimatedCounter target={scoreData.totalScore} />
                </div>
                <div className="text-white/40 text-xs mt-1">out of 1000</div>
              </div>
            </div>

            {/* Score details */}
            <div className="flex-1 text-center md:text-left">
              <div className={`inline-flex items-center gap-1.5 ${risk.bg} ${risk.border} border rounded-full px-3 py-1 text-sm ${risk.text} mb-3`}>
                {scoreData.riskLevel === 'High' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                {risk.label} Exposure
              </div>
              <h2 className="text-3xl font-bold mb-1">
                Your data is worth <span className="text-violet-400">${scoreData.dataValue}</span>
              </h2>
              <p className="text-white/50 mb-4">
                Found in <strong className="text-white">{scoreData.exposureCount}</strong> data broker databases.
                Your profile is being {scoreData.riskLevel === 'High' ? 'actively traded' : 'tracked'} across the data ecosystem.
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold">{scoreData.exposureCount}</div>
                  <div className="text-xs text-white/40">Brokers</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold">${scoreData.dataValue}</div>
                  <div className="text-xs text-white/40">Market Value</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center">
                  <div className={`text-lg font-bold ${risk.text}`}>{scoreData.riskLevel}</div>
                  <div className="text-xs text-white/40">Risk Level</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            Score Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BREAKDOWN_META.map(({ key, label, icon: Icon, desc, color }) => {
              const value = scoreData.breakdown[key as keyof typeof scoreData.breakdown];
              return (
                <div key={key} className="bg-white/3 border border-white/8 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color }} />
                      <span className="text-sm font-semibold">{label}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color }}>{value}/100</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
                    <div
                      className="h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${value}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="text-xs text-white/35">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Brokers */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            Data Brokers That Have Your Info
            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/20 rounded-full px-2 py-0.5 font-normal">
              {scoreData.exposureCount} found
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {scoreData.brokersFound.map(broker => (
              <div key={broker} className="flex items-center gap-1.5 bg-red-500/8 border border-red-500/15 rounded-lg px-3 py-1.5 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {broker}
              </div>
            ))}
          </div>
        </div>

        {/* Data Market Profile */}
        {scoreData.dataMarketProfile && scoreData.dataMarketProfile.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-400" />
              What Data Brokers Are Selling About You
            </h2>
            <p className="text-sm text-white/40 mb-4">
              Based on your profile, these data categories are actively packaged and sold across the data broker ecosystem.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scoreData.dataMarketProfile.map((item) => {
                const likelihoodConfig = {
                  High:   { bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400',    dot: 'bg-red-500' },
                  Medium: { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400',  dot: 'bg-amber-500' },
                  Low:    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500' },
                }[item.likelihood];

                const iconMap: Record<string, React.ReactNode> = {
                  user:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
                  dollar:   <DollarSign className="w-4 h-4" />,
                  home:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
                  car:      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m0-5h9l2-2 1-4H6" /></svg>,
                  shopping: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
                  device:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
                  health:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
                  civic:    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>,
                  life:     <Sparkles className="w-4 h-4" />,
                  work:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" /></svg>,
                };

                return (
                  <div key={item.category} className="bg-white/3 border border-white/8 rounded-xl p-4 flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-white/60">
                          {iconMap[item.icon]}
                        </div>
                        <span className="font-semibold text-sm">{item.category}</span>
                      </div>
                      <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${likelihoodConfig.bg} ${likelihoodConfig.border} ${likelihoodConfig.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${likelihoodConfig.dot}`} />
                        {item.likelihood}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-white/40 leading-relaxed">{item.description}</p>

                    {/* Attributes */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.attributes.map(attr => (
                        <span key={attr} className="text-xs bg-white/5 border border-white/8 text-white/50 px-2 py-0.5 rounded-md">
                          {attr}
                        </span>
                      ))}
                    </div>

                    {/* Brokers */}
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <span className="text-xs text-white/25">Sold by:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.brokers.map(b => (
                          <span key={b} className="text-xs text-white/40 bg-white/3 px-2 py-0.5 rounded">{b}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HIBP Breach Report */}
        {scoreData.breachMeta && (
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Have I Been Pwned Report
              <span className={`text-xs rounded-full px-2 py-0.5 font-normal border ${
                scoreData.breachMeta.totalBreaches > 0
                  ? 'bg-red-500/20 text-red-400 border-red-500/20'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
              }`}>
                {scoreData.breachMeta.totalBreaches > 0
                  ? `${scoreData.breachMeta.totalBreaches} breaches found`
                  : 'No breaches found'}
              </span>
            </h2>

            {scoreData.breachMeta.totalBreaches === 0 ? (
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-5 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-400">No breaches detected</p>
                  <p className="text-sm text-white/50 mt-0.5">Your email was not found in any known data breaches.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Breaches', value: scoreData.breachMeta.totalBreaches, color: 'text-red-400' },
                    { label: 'Verified', value: scoreData.breachMeta.verifiedBreaches, color: 'text-amber-400' },
                    { label: 'Sensitive', value: scoreData.breachMeta.sensitiveBreaches, color: 'text-orange-400' },
                    { label: 'Data Types Exposed', value: scoreData.breachMeta.exposedDataTypes.length, color: 'text-violet-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white/3 border border-white/8 rounded-xl p-3 text-center">
                      <div className={`text-2xl font-bold ${color}`}>{value}</div>
                      <div className="text-xs text-white/40 mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Risk flags */}
                <div className="flex flex-wrap gap-2">
                  {scoreData.breachMeta.hasPasswordExposure && (
                    <span className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-lg">
                      <Lock className="w-3 h-3" /> Password Exposed
                    </span>
                  )}
                  {scoreData.breachMeta.hasFinancialExposure && (
                    <span className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs px-3 py-1.5 rounded-lg">
                      <DollarSign className="w-3 h-3" /> Financial Data Exposed
                    </span>
                  )}
                  {scoreData.breachMeta.hasBehavioralExposure && (
                    <span className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-lg">
                      <Eye className="w-3 h-3" /> Behavioral Data Exposed
                    </span>
                  )}
                  {scoreData.breachMeta.hasSensitiveExposure && (
                    <span className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-lg">
                      <AlertTriangle className="w-3 h-3" /> Sensitive Breach
                    </span>
                  )}
                </div>

                {/* Top breaches */}
                {scoreData.breachMeta.topBreaches.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">Top Breaches</h3>
                    <div className="space-y-2">
                      {scoreData.breachMeta.topBreaches.map((breach, i) => (
                        <div key={i} className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                            <span className="font-semibold text-sm">{breach.name}</span>
                            <span className="text-xs text-white/30">{new Date(breach.date).getFullYear()}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {breach.dataTypes.map(dt => (
                              <span key={dt} className="text-xs bg-white/5 border border-white/10 text-white/50 px-2 py-0.5 rounded-md">{dt}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exposed data types */}
                {scoreData.breachMeta.exposedDataTypes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">All Exposed Data Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {scoreData.breachMeta.exposedDataTypes.map(dt => (
                        <span key={dt} className="text-xs bg-red-500/8 border border-red-500/15 text-white/60 px-3 py-1 rounded-lg">{dt}</span>
                      ))}
                    </div>
                  </div>
                )}

                {scoreData.breachMeta.mostRecentBreach && (
                  <p className="text-xs text-white/30">
                    Most recent breach: <span className="text-white/50">{new Date(scoreData.breachMeta.mostRecentBreach).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* AI Insights */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            AI Insights
            {insightsLoading && <span className="text-xs text-white/40 font-normal animate-pulse">Analyzing...</span>}
          </h2>
          {insightsLoading ? (
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-white/10 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                </div>
              ))}
            </div>
          ) : insights ? (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white/60 mb-2 uppercase tracking-wider">Key Insights</h3>
                <div className="space-y-2">
                  {insights.insights.map((insight, i) => (
                    <div key={i} className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-4">
                      <div className="flex gap-3">
                        <div className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                        <p className="text-sm text-white/70 leading-relaxed">{insight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/60 mb-2 uppercase tracking-wider">Recommendations</h3>
                <div className="space-y-2">
                  {insights.recommendations.map((rec, i) => (
                    <div key={i} className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                      <div className="flex gap-3">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-white/70 leading-relaxed">{rec}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Action Center */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Action Center
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setShowOptOut(true)}
              className="bg-white/3 border border-white/10 rounded-xl p-4 text-left hover:bg-white/5 hover:border-violet-500/30 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                  <Shield className="w-4 h-4 text-violet-400" />
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Opt-Out Requests</h3>
              <p className="text-xs text-white/40">Send removal requests to {scoreData.brokersFound.length} data brokers found in your scan</p>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="bg-white/3 border border-white/10 rounded-xl p-4 text-left hover:bg-white/5 hover:border-blue-500/30 transition-all group disabled:opacity-60"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  {pdfLoading ? (
                    <span className="w-4 h-4 border border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-semibold text-sm mb-1">
                {pdfLoading ? 'Generating...' : 'Download Report'}
              </h3>
              <p className="text-xs text-white/40">Export your full privacy score report as a PDF document</p>
            </button>

            <button
              onClick={handleShare}
              className="bg-white/3 border border-white/10 rounded-xl p-4 text-left hover:bg-white/5 hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-semibold text-sm mb-1">
                {copied ? 'Copied!' : 'Share Your Score'}
              </h3>
              <p className="text-xs text-white/40">{copied ? 'Link copied to clipboard' : 'Copy link to share your privacy score with others'}</p>
            </button>
          </div>
        </div>

        {/* Privacy Rights CTA */}
        <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base mb-1">Ready to take action?</h3>
            <p className="text-sm text-white/50">Visit our Privacy Rights Center to opt out, delete, or access your data at 35+ companies — with direct links to every DSR page.</p>
          </div>
          <Link
            href="/privacy-rights"
            className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            <Shield className="w-4 h-4" />
            Privacy Rights Center
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-white/20 pb-4">
          <p>Educational purposes only. Scores are simulated based on typical data broker behavior patterns.</p>
        </div>
      </div>

      {showOptOut && (
        <OptOutModal brokers={scoreData.brokersFound} onClose={() => setShowOptOut(false)} />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
