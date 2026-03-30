'use client';

import { useState } from 'react';
import {
  Shield, TrendingUp, Eye, Target, BarChart3, Zap,
  ArrowRight, Lock, Sparkles, Search, Globe, Users,
  FileText, CheckCircle2, AlertTriangle, Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Search,
    title: 'Competitor Content Analysis',
    description: 'Drop a competitor URL and we analyze their entire content strategy: topics, frequency, engagement patterns, and gaps you can exploit.',
    status: 'coming-soon',
  },
  {
    icon: Eye,
    title: 'Content Gap Finder',
    description: 'Automatically identifies topics your competitors are ranking for that you haven\'t covered. Generates content briefs to fill those gaps.',
    status: 'coming-soon',
  },
  {
    icon: BarChart3,
    title: 'Share of Voice Tracking',
    description: 'Track your content presence vs competitors across platforms. See where you\'re winning and where you need to increase output.',
    status: 'coming-soon',
  },
  {
    icon: Target,
    title: 'Positioning Differentiation',
    description: 'AI analyzes how your messaging compares to competitors and suggests angles that make you stand out in your market.',
    status: 'coming-soon',
  },
  {
    icon: Zap,
    title: 'Counter-Content Generator',
    description: 'When a competitor publishes a popular piece, we generate a superior version that leverages your unique positioning and data.',
    status: 'coming-soon',
  },
  {
    icon: TrendingUp,
    title: 'Trend Monitoring',
    description: 'Real-time monitoring of industry trends and competitor moves. Get alerts when there\'s a content opportunity to capitalize on.',
    status: 'coming-soon',
  },
];

const COMPETITOR_PREVIEW = [
  { name: 'Competitor A', contentFreq: '12 posts/week', topPlatform: 'LinkedIn', weakness: 'No video content', opportunity: 'YouTube + short-form video' },
  { name: 'Competitor B', contentFreq: '5 posts/week', topPlatform: 'Blog/SEO', weakness: 'Generic, no personality', opportunity: 'Contrarian takes, strong opinions' },
  { name: 'Competitor C', contentFreq: '20 posts/week', topPlatform: 'Twitter/X', weakness: 'All awareness, no conversion', opportunity: 'Decision-stage content' },
];

export default function CompetitiveIntelPage() {
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);

  const handleNotify = () => {
    if (email.trim()) {
      setNotified(true);
      setTimeout(() => setNotified(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Competitive Intelligence</h1>
            <p className="text-gray-500 text-sm">Know what your competitors are doing. Do it better.</p>
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 border border-violet-200 rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-4 right-4 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">COMING Q2 2026</div>
        <div className="max-w-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Turn Competitor Weaknesses Into Your Content Strategy</h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Our Competitive Intelligence engine will analyze your competitors&apos; content across every platform, find gaps in their strategy, and generate superior content briefs that leverage your unique positioning. Think of it as having a full-time competitive analyst who also writes your content strategy.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email for early access"
              className="flex-1 max-w-sm px-4 py-2.5 rounded-xl border border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm text-gray-900 placeholder:text-gray-400 bg-white"
            />
            <button
              onClick={handleNotify}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all text-sm"
            >
              {notified ? <><CheckCircle2 className="w-4 h-4" /> Notified!</> : <>Notify Me <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      </div>

      {/* Preview: What It Will Look Like */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Preview: Competitive Dashboard</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Enter competitor URL to analyze...</span>
              </div>
              <button className="px-4 py-2.5 bg-gray-200 text-gray-400 rounded-xl text-sm font-medium cursor-not-allowed flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Analyze
              </button>
            </div>
          </div>

          <div className="p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Sample Competitor Analysis</p>
            <div className="space-y-3">
              {COMPETITOR_PREVIEW.map((comp, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100 opacity-75">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 text-sm">{comp.name}</h4>
                        <p className="text-xs text-gray-400">{comp.contentFreq} &middot; Primary: {comp.topPlatform}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <p className="text-[10px] font-semibold text-gray-500 uppercase">Weakness</p>
                      </div>
                      <p className="text-xs text-gray-600">{comp.weakness}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lightbulb className="w-3 h-3 text-emerald-500" />
                        <p className="text-[10px] font-semibold text-gray-500 uppercase">Your Opportunity</p>
                      </div>
                      <p className="text-xs text-gray-600">{comp.opportunity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <h3 className="text-lg font-bold text-gray-900 mb-4">What&apos;s Coming</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">{feature.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
              <div className="mt-3 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-medium text-gray-400 uppercase">Coming Soon</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Teaser */}
      <div className="bg-gray-900 rounded-2xl p-8 text-center">
        <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Want This Sooner?</h3>
        <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">We&apos;re building Competitive Intelligence based on customer demand. The more you use Content Factory, the faster we ship this.</p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 247 users requested</span>
          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> In active development</span>
        </div>
      </div>
    </div>
  );
}
