'use client';

import { useState } from 'react';
import { Globe, Search, Target, TrendingUp, Zap, BarChart3, ArrowRight, Sparkles, Shield, Clock, CheckCircle2, Lock } from 'lucide-react';

interface CompetitorInsight {
  name: string;
  url: string;
  strengths: string[];
  weaknesses: string[];
  contentGaps: string[];
  contentBriefs: { title: string; angle: string; platform: string }[];
  positioningAnalysis: string;
}

export default function CompetitiveIntelPage() {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [insight, setInsight] = useState<CompetitorInsight | null>(null);
  const [error, setError] = useState('');
  const [notified, setNotified] = useState(false);

  const analyzeCompetitor = async () => {
    if (!competitorUrl.trim()) return;
    setAnalyzing(true);
    setError('');
    setInsight(null);

    try {
      const res = await fetch('/api/competitive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: competitorUrl }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setInsight(data.insight);
      }
    } catch {
      setError('Failed to analyze competitor. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const CAPABILITIES = [
    { icon: Search, title: 'Content Gap Analysis', desc: 'Identify topics your competitors miss that your audience craves. Find the white space in your market.', status: 'live' },
    { icon: Target, title: 'Positioning Weakness Finder', desc: 'Analyze competitor messaging to find positioning gaps you can own. Turn their weakness into your wedge.', status: 'live' },
    { icon: TrendingUp, title: 'Content Brief Generator', desc: 'Auto-generate content briefs designed to outrank and outperform competitor content on every platform.', status: 'live' },
    { icon: BarChart3, title: 'Performance Benchmarking', desc: 'Compare your content velocity, quality scores, and platform coverage against competitors.', status: 'coming-soon' },
    { icon: Shield, title: 'Brand Differentiation Score', desc: 'Measure how differentiated your content is from competitors. Get specific recommendations to stand out.', status: 'coming-soon' },
    { icon: Clock, title: 'Real-Time Monitoring', desc: 'Get alerts when competitors publish new content. Stay ahead of their messaging and respond strategically.', status: 'coming-soon' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium mb-2">
          <Sparkles className="w-4 h-4" />
          Competitive Intelligence Engine
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Competitive Intelligence</h1>
        <p className="text-gray-500 mt-2 text-lg">Analyze competitor content strategy and find gaps you can exploit. Turn their weaknesses into your content advantage.</p>
      </div>

      {/* Competitor Analysis Tool */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyze a Competitor</h2>
        <p className="text-gray-500 mb-6">Enter a competitor&apos;s website URL and our AI will analyze their positioning, identify content gaps, and generate briefs to outperform them.</p>
        
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              placeholder="https://competitor.com"
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && analyzeCompetitor()}
            />
          </div>
          <button
            onClick={analyzeCompetitor}
            disabled={analyzing || !competitorUrl.trim()}
            className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Analyze
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        {/* Analysis Results */}
        {insight && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{insight.name}</h3>
                <p className="text-sm text-gray-500">{insight.url}</p>
              </div>
            </div>

            {/* Positioning Analysis */}
            <div className="p-5 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
              <h4 className="font-semibold text-gray-900 mb-2">Positioning Analysis</h4>
              <p className="text-gray-700 leading-relaxed">{insight.positioningAnalysis}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="p-5 bg-green-50 rounded-xl border border-green-100">
                <h4 className="font-semibold text-green-800 mb-3">Their Strengths</h4>
                <ul className="space-y-2">
                  {insight.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="p-5 bg-amber-50 rounded-xl border border-amber-100">
                <h4 className="font-semibold text-amber-800 mb-3">Their Weaknesses (Your Opportunity)</h4>
                <ul className="space-y-2">
                  {insight.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                      <Zap className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Content Gaps */}
            <div className="p-5 bg-white rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Content Gaps to Exploit</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insight.contentGaps.map((gap, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <ArrowRight className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{gap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Briefs */}
            <div className="p-5 bg-white rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Content Briefs to Outperform Them</h4>
              <div className="space-y-3">
                {insight.contentBriefs.map((brief, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{brief.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{brief.angle}</p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full whitespace-nowrap">{brief.platform}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Capabilities Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Intelligence Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CAPABILITIES.map((cap) => (
            <div key={cap.title} className={`p-6 bg-white rounded-2xl border ${cap.status === 'live' ? 'border-gray-200' : 'border-gray-100 opacity-75'} shadow-sm`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cap.status === 'live' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <cap.icon className={`w-5 h-5 ${cap.status === 'live' ? 'text-indigo-600' : 'text-gray-400'}`} />
                </div>
                {cap.status === 'coming-soon' && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                    <Lock className="w-3 h-3" />
                    Coming Soon
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{cap.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demand Generation CTA */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Full Competitive Intelligence Suite</h3>
            <p className="text-gray-300 mb-6 max-w-2xl">Real-time competitor monitoring, automated content gap analysis, and AI-generated counter-content briefs. Performance benchmarking and brand differentiation scoring coming Q2 2026.</p>
            <button
              onClick={() => { setNotified(true); setTimeout(() => setNotified(false), 3000); }}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${notified ? 'bg-green-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
            >
              {notified ? 'You\'ll be notified when it launches!' : 'Notify Me When Available'}
            </button>
          </div>
          <div className="hidden md:block text-6xl font-bold text-gray-700/30">Q2</div>
        </div>
      </div>
    </div>
  );
}
