'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getBrandProfile, getTopicIdeas, saveTopicIdeas } from '@/lib/storage';
import { BrandIntelligenceProfile, TopicIdea } from '@/types';
import {
  Lightbulb, Sparkles, Loader2, ArrowRight, RefreshCw,
  Target, TrendingUp, Users, Eye, Filter, CheckCircle2,
  Zap, BookOpen, BarChart3, MessageSquare, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const JOURNEY_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  awareness: { label: 'Awareness', color: 'bg-sky-50 text-sky-700 border-sky-200', icon: Eye },
  consideration: { label: 'Consideration', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Target },
  decision: { label: 'Decision', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: TrendingUp },
};

const FRAMEWORK_ICONS: Record<string, any> = {
  'contrarian-take': Zap,
  'pas': AlertCircle,
  'story-lesson': BookOpen,
  'data-insight': BarChart3,
  'before-after': RefreshCw,
  'myth-busting': MessageSquare,
};

export default function TopicsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BrandIntelligenceProfile | null>(null);
  const [ideas, setIdeas] = useState<TopicIdea[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [filterJourney, setFilterJourney] = useState<string>('all');
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());

  useEffect(() => {
    const p = getBrandProfile();
    setProfile(p);
    const saved = getTopicIdeas();
    if (saved.length > 0) setIdeas(saved);
  }, []);

  const generateTopics = async () => {
    if (!profile) return;
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/suggest-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: user?.company || '',
          industry: user?.industry || '',
          targetAudience: user?.targetAudience || '',
          brandProfile: profile,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate topics');
      const data = await res.json();
      if (data.ideas && data.ideas.length > 0) {
        setIdeas(data.ideas);
        saveTopicIdeas(data.ideas);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate topic ideas.');
    }
    setGenerating(false);
  };

  const filteredIdeas = filterJourney === 'all' ? ideas : ideas.filter(i => (i.journeyStage || i.buyerStage) === filterJourney);

  const toggleSelect = (id: string) => {
    setSelectedIdeas(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto pt-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
          <Lightbulb className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Topic Generator</h1>
        <p className="text-gray-500 mb-6">Complete your onboarding to unlock AI-powered topic suggestions tailored to your business, customers, and competitive positioning.</p>
        <Link href="/onboarding" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
          Complete Onboarding <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topic Generator</h1>
          <p className="text-gray-500 mt-1">AI-generated content ideas mapped to your buyer journey</p>
        </div>
        <button
          onClick={generateTopics}
          disabled={generating}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 text-sm"
        >
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : ideas.length > 0 ? <><RefreshCw className="w-4 h-4" /> Generate New Ideas</> : <><Sparkles className="w-4 h-4" /> Generate 10 Topic Ideas</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Profile Context Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Generating topics based on</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/70 rounded-lg px-3 py-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">Industry</p>
            <p className="text-xs text-gray-700 font-medium">{user?.industry || 'Not set'}</p>
          </div>
          <div className="bg-white/70 rounded-lg px-3 py-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">Pain Points</p>
            <p className="text-xs text-gray-700 font-medium">{profile.corePainPoints?.length || 0} mapped</p>
          </div>
          <div className="bg-white/70 rounded-lg px-3 py-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">Content Angles</p>
            <p className="text-xs text-gray-700 font-medium">{profile.contentAngles?.length || 0} available</p>
          </div>
          <div className="bg-white/70 rounded-lg px-3 py-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">Audience</p>
            <p className="text-xs text-gray-700 font-medium truncate">{user?.targetAudience || 'Not set'}</p>
          </div>
        </div>
      </div>

      {generating && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Generating Topic Ideas</h3>
          <p className="text-sm text-gray-500">Analyzing your positioning, pain points, and competitive wedge to create 10 strategic content ideas...</p>
        </div>
      )}

      {!generating && ideas.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to Generate Your Content Calendar</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Our AI will create 10 strategic topic ideas mapped to your buyer journey: 3 awareness, 4 consideration, and 3 decision-stage topics. Each includes a hook, recommended framework, and best platform.</p>
          <button onClick={generateTopics} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            <Sparkles className="w-4 h-4" /> Generate 10 Topic Ideas
          </button>
        </div>
      )}

      {!generating && ideas.length > 0 && (
        <>
          {/* Journey Stage Filter */}
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-gray-400" />
            <button onClick={() => setFilterJourney('all')} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filterJourney === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>All ({ideas.length})</button>
            {Object.entries(JOURNEY_LABELS).map(([key, meta]) => {
              const count = ideas.filter(i => i.journeyStage === key).length;
              return (
                <button key={key} onClick={() => setFilterJourney(key)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all border', filterJourney === key ? meta.color + ' border-current' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')}>
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>

          {selectedIdeas.size > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex items-center justify-between">
              <p className="text-sm text-blue-700 font-medium">{selectedIdeas.size} topic{selectedIdeas.size > 1 ? 's' : ''} selected</p>
              <Link href={`/content/new?topic=${encodeURIComponent(ideas.find(i => selectedIdeas.has(i.id || ''))?.hook || '')}`} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">
                <Sparkles className="w-3.5 h-3.5" /> Generate Content
              </Link>
            </div>
          )}

          <div className="space-y-3">
            {filteredIdeas.map((idea, idx) => {
              const journey = JOURNEY_LABELS[idea.journeyStage || idea.buyerStage || 'awareness'] || JOURNEY_LABELS.awareness;
              const JourneyIcon = journey.icon;
              const FrameworkIcon = FRAMEWORK_ICONS[idea.recommendedFramework || idea.framework || ''] || Lightbulb;
              const isSelected = selectedIdeas.has(idea.id || `idea-${idx}`);

              return (
                <div key={idea.id || idx} className={cn('bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md', isSelected ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100')}>
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <button onClick={() => toggleSelect(idea.id || `idea-${idx}`)} className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all', isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 hover:border-blue-400')}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border', journey.color)}>
                            <JourneyIcon className="w-3 h-3" /> {journey.label}
                          </span>
                          {idea.recommendedFramework && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                              <FrameworkIcon className="w-3 h-3" /> {idea.recommendedFramework.replace(/-/g, ' ')}
                            </span>
                          )}
                          {idea.bestPlatform && (
                            <span className="text-[10px] text-gray-400">Best on: {idea.bestPlatform}</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{idea.hook}</h3>
                        {idea.keyProofPoint && (
                          <p className="text-xs text-gray-500 mb-2">Proof point: {idea.keyProofPoint}</p>
                        )}
                      </div>
                      <Link href={`/content/new?topic=${encodeURIComponent(idea.hook)}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all flex-shrink-0">
                        <Sparkles className="w-3 h-3" /> Create
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
