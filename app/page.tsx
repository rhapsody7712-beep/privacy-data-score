'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, TrendingUp, Eye, Lock, ArrowRight, Zap } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setLoading(true);
    const params = new URLSearchParams({ name: formData.name, email: formData.email, ...(formData.phone && { phone: formData.phone }) });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">Privacy Data Score™</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/50">
          <span className="hover:text-white/80 cursor-pointer transition-colors">How It Works</span>
          <span className="hover:text-white/80 cursor-pointer transition-colors">Privacy Guide</span>
          <span className="text-white/20">|</span>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/20">Free Scan</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-8">
          <Zap className="w-3 h-3" />
          <span>Instant analysis · No credit card required</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
          Discover What Your
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Data Is Worth
          </span>
        </h1>

        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
          Data brokers are selling your personal information right now. Find out your privacy score,
          the dollar value of your data, and how to take it back.
        </p>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-8 mb-12 text-sm">
          {[
            { label: 'Data Brokers Tracked', value: '4,000+' },
            { label: 'Avg. Data Value', value: '$850' },
            { label: 'Scans Completed', value: '2.3M' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/40 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold mb-1">Scan My Data Footprint</h2>
          <p className="text-sm text-white/40 mb-5">Takes 5 seconds. No spam, ever.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
            />
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              value={formData.phone}
              onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.email}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning...
                </span>
              ) : (
                <>
                  Scan My Data Footprint
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-white/25 mt-4 text-center">
            🔒 We never store or sell your data. This is educational only.
          </p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[
            { icon: Eye, title: 'Exposure Analysis', desc: 'See which data brokers have your information and what they know.', color: 'text-blue-400' },
            { icon: TrendingUp, title: 'Data Valuation', desc: "Get a dollar estimate of what your personal data profile is worth.", color: 'text-violet-400' },
            { icon: Lock, title: 'Privacy Actions', desc: 'Get personalized steps to reduce your digital footprint instantly.', color: 'text-cyan-400' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:bg-white/5 transition-colors">
              <Icon className={`w-6 h-6 ${color} mb-3`} />
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
