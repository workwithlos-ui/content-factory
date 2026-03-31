'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import {
  getBrandVoiceDNA, getDefaultAudienceProfile, getBrandProfile, getCompetitors,
  addCompetitor, removeCompetitor, getTrendItems, saveTrendItems,
  getTrendsLastRefresh, setTrendsLastRefresh
} from '@/lib/storage';
import { TrendItem, Competitor, Platform, PLATFORMS, TrendUrgency } from '@/types';
import { platformIcons, platformColors } from '@/lib/platform-icons';
import { cn, formatRelativeTime } from '@/lib/utils';
import {
  TrendingUp, Loader2, RefreshCw, Zap, Plus, X, Trash2, PenTool,
  Flame, Sun, Leaf, Target, Newspaper, Users, Shield, ChevronRight, AlertCircle
} from 'lucide-react';

const URGENCY_CONFIG: Record<TrendUrgency, { label: string; icon: React.ReactNode; class: string }> = {
  hot: { label: 'Hot', icon: <Flame size={12} />, class: 'bg-red-950/50 text-red-400 border-red-800/50' },
  warm: { label: 'Warm', icon: <Sun size={12} />, class: 'bg-amber-950/50 text-amber-400 border-amber-800/50' },
  evergreen: { label: 'Evergreen', icon: <Leaf size={12} />, class: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  trend: { label: 'Trending', icon: <TrendingUp size={14} />, color: 'text-indigo-400' },
  idea: { label: 'Content Idea', icon: <Zap size={14} />, color: 'text-violet-400' },
  news: { label: 'Industry News', icon: <Newspaper size={14} />, color: 'text-cyan-400' },
  competitor: { label: 'Competitor Intel', icon: <Shield size={14} />, color: 'text-amber-400' },
};

type FilterCategory = 'all' | 'trend' | 'idea' | 'news' | 'competitor';

export default function TrendsPage() {
  const router = useRouter();
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompHandle, setNewCompHandle] = useState('');
  const [newCompPlatform, setNewCompPlatform] = useState<'linkedin' | 'twitter'>('linkedin');
  const [contextReady, setContextReady] = useState(false);

  useEffect(() => {
    const stored = getTrendItems();
    setTrends(stored);
    setCompetitors(getCompetitors());
    setLastRefresh(getTrendsLastRefresh());

    const voiceDNA = getBrandVoiceDNA();
    const audience = getDefaultAudienceProfile();
    setContextReady(!!(voiceDNA?.brandName || audience));

    // Auto-refresh if no trends or stale (> 4 hours)
    if (stored.length === 0 && (voiceDNA?.brandName || audience)) {
      handleRefresh();
    }
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError('');

    try {
      const voiceDNA = getBrandVoiceDNA();
      const audienceProfile = getDefaultAudienceProfile();
      const brandProfile = getBrandProfile();
      const comps = getCompetitors();

      const res = await fetch('/api/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceDNA,
          audienceProfile,
          brandProfile,
          competitors: comps,
          currentDate: new Date().toISOString().split('T')[0],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const allItems: TrendItem[] = [
        ...(data.trends || []).map((t: any) => ({ ...t, id: uuidv4(), createdAt: new Date().toISOString() })),
        ...(data.ideas || []).map((t: any) => ({ ...t, id: uuidv4(), createdAt: new Date().toISOString() })),
        ...(data.news || []).map((t: any) => ({ ...t, id: uuidv4(), createdAt: new Date().toISOString() })),
        ...(data.competitorInsights || []).map((t: any) => ({ ...t, id: uuidv4(), createdAt: new Date().toISOString() })),
      ];

      saveTrendItems(allItems);
      setTrends(allItems);
      const now = new Date().toISOString();
      setTrendsLastRefresh(now);
      setLastRefresh(now);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trends');
    }
    setLoading(false);
  };

  const handleAddCompetitor = () => {
    if (!newCompName.trim()) return;
    const comp: Competitor = {
      id: uuidv4(),
      name: newCompName.trim(),
      handle: newCompHandle.trim(),
      platform: newCompPlatform,
      addedAt: new Date().toISOString(),
    };
    addCompetitor(comp);
    setCompetitors(getCompetitors());
    setNewCompName('');
    setNewCompHandle('');
    setShowAddCompetitor(false);
  };

  const handleRemoveCompetitor = (id: string) => {
    removeCompetitor(id);
    setCompetitors(getCompetitors());
  };

  const handleCreateContent = (trend: TrendItem) => {
    const params = new URLSearchParams({
      topic: `${trend.title}\n\nAngle: ${trend.suggestedAngle}`,
    });
    router.push(`/content/new?${params.toString()}`);
  };

  const filteredTrends = filter === 'all' ? trends : trends.filter(t => t.category === filter);

  const trendCounts = {
    all: trends.length,
    trend: trends.filter(t => t.category === 'trend').length,
    idea: trends.filter(t => t.category === 'idea').length,
    news: trends.filter(t => t.category === 'news').length,
    competitor: trends.filter(t => t.category === 'competitor').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            Trend & Competitor Feed
          </h1>
          <p className="text-slate-500 mt-1">
            {lastRefresh ? `Last updated ${formatRelativeTime(lastRefresh)}` : 'AI-powered trends based on your brand and audience'}
          </p>
        </div>
        <button onClick={handleRefresh} disabled={loading} className="btn-primary gap-2 text-sm">
          {loading ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : <><RefreshCw size={14} /> Refresh Trends</>}
        </button>
      </div>

      {/* Context Warning */}
      {!contextReady && (
        <div className="card p-4 flex items-start gap-3 border-amber-800/20 bg-amber-950/10">
          <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-300">Set up your context for better trends</p>
            <p className="text-xs text-slate-500 mt-0.5">Configure your <a href="/voice-dna" className="text-indigo-400 hover:text-indigo-300">Brand Voice DNA</a> and <a href="/audiences" className="text-indigo-400 hover:text-indigo-300">Audience Profiles</a> to get personalized trend recommendations.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="card p-4 flex items-center gap-2 border-red-800/20 bg-red-950/10">
          <AlertCircle size={14} className="text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {([
              { key: 'all', label: 'All', icon: null },
              { key: 'trend', label: 'Trending', icon: <TrendingUp size={12} /> },
              { key: 'idea', label: 'Ideas', icon: <Zap size={12} /> },
              { key: 'news', label: 'News', icon: <Newspaper size={12} /> },
              { key: 'competitor', label: 'Competitor', icon: <Shield size={12} /> },
            ] as { key: FilterCategory; label: string; icon: React.ReactNode | null }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border whitespace-nowrap',
                  filter === tab.key ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'text-slate-500 border-transparent hover:text-slate-300'
                )}
              >
                {tab.icon}
                {tab.label}
                <span className="text-[10px] opacity-60">({trendCounts[tab.key]})</span>
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && trends.length === 0 && (
            <div className="card p-10 text-center">
              <Loader2 className="w-8 h-8 text-indigo-400 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-slate-400">Analyzing trends for your niche...</p>
              <p className="text-xs text-slate-600 mt-1">This uses your brand voice and audience data for personalization</p>
            </div>
          )}

          {/* Trend Cards */}
          {!loading && filteredTrends.length === 0 && (
            <div className="card p-10 text-center">
              <TrendingUp className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No trends yet. Click "Refresh Trends" to generate personalized insights.</p>
            </div>
          )}

          <div className="space-y-3">
            {filteredTrends.map(trend => {
              const urgencyInfo = URGENCY_CONFIG[trend.urgency];
              const categoryInfo = CATEGORY_CONFIG[trend.category];
              const PlatformIcon = platformIcons[trend.suggestedPlatform];
              const platformInfo = PLATFORMS.find(p => p.key === trend.suggestedPlatform);

              return (
                <div key={trend.id} className="card p-5 hover:border-white/[0.12] transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Category & Urgency badges */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn('flex items-center gap-1 text-xs font-medium', categoryInfo?.color)}>
                          {categoryInfo?.icon} {categoryInfo?.label}
                        </span>
                        <span className={cn('badge border text-[10px] gap-0.5', urgencyInfo?.class)}>
                          {urgencyInfo?.icon} {urgencyInfo?.label}
                        </span>
                        {PlatformIcon && (
                          <span className={cn('badge border text-[10px] gap-1', platformColors[trend.suggestedPlatform])}>
                            <PlatformIcon size={10} /> {platformInfo?.label?.split(' ')[0]}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-semibold text-white mb-1">{trend.title}</h3>

                      {/* Why trending */}
                      <p className="text-sm text-slate-400 mb-2">{trend.whyTrending}</p>

                      {/* Suggested angle */}
                      <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                        <p className="text-[10px] font-semibold text-indigo-400 uppercase mb-0.5">Suggested Angle</p>
                        <p className="text-xs text-slate-300">{trend.suggestedAngle}</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCreateContent(trend)}
                        className="btn-primary text-xs gap-1.5 py-2 px-3"
                      >
                        <PenTool size={12} /> Create
                      </button>
                      {trend.category === 'competitor' && (
                        <button
                          onClick={() => handleCreateContent({ ...trend, suggestedAngle: `Beat competitor angle: ${trend.suggestedAngle}` })}
                          className="btn-secondary text-xs gap-1.5 py-2 px-3"
                        >
                          <Shield size={12} /> Beat This
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Trend Summary</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5"><Flame size={12} className="text-red-400" /> Hot Topics</span>
                <span className="text-xs font-bold text-red-400">{trends.filter(t => t.urgency === 'hot').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5"><Sun size={12} className="text-amber-400" /> Warm Topics</span>
                <span className="text-xs font-bold text-amber-400">{trends.filter(t => t.urgency === 'warm').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5"><Leaf size={12} className="text-emerald-400" /> Evergreen</span>
                <span className="text-xs font-bold text-emerald-400">{trends.filter(t => t.urgency === 'evergreen').length}</span>
              </div>
            </div>
          </div>

          {/* Competitor Monitor */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5"><Shield size={14} className="text-amber-400" /> Competitors</h3>
              <button onClick={() => setShowAddCompetitor(!showAddCompetitor)} className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white">
                <Plus size={14} />
              </button>
            </div>

            {showAddCompetitor && (
              <div className="space-y-2 p-3 bg-white/[0.02] rounded-lg border border-white/[0.06]">
                <input value={newCompName} onChange={e => setNewCompName(e.target.value)} className="input-field text-xs py-2" placeholder="Company name" />
                <input value={newCompHandle} onChange={e => setNewCompHandle(e.target.value)} className="input-field text-xs py-2" placeholder="@handle" />
                <div className="flex gap-2">
                  <button onClick={() => setNewCompPlatform('linkedin')} className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium border', newCompPlatform === 'linkedin' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' : 'text-slate-600 border-white/[0.06]')}>LinkedIn</button>
                  <button onClick={() => setNewCompPlatform('twitter')} className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium border', newCompPlatform === 'twitter' ? 'bg-sky-500/10 text-sky-300 border-sky-500/30' : 'text-slate-600 border-white/[0.06]')}>X / Twitter</button>
                </div>
                <button onClick={handleAddCompetitor} className="btn-primary w-full text-xs py-2">Add Competitor</button>
              </div>
            )}

            {competitors.length === 0 ? (
              <p className="text-xs text-slate-600">No competitors added. Add competitors to get counter-content suggestions.</p>
            ) : (
              <div className="space-y-1.5">
                {competitors.map(comp => (
                  <div key={comp.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div>
                      <p className="text-xs font-medium text-slate-300">{comp.name}</p>
                      <p className="text-[10px] text-slate-600">@{comp.handle} · {comp.platform}</p>
                    </div>
                    <button onClick={() => handleRemoveCompetitor(comp.id)} className="p-1 rounded hover:bg-white/5 text-slate-600 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform Distribution */}
          <div className="card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Platform Mix</h3>
            <div className="space-y-1.5">
              {PLATFORMS.map(p => {
                const count = trends.filter(t => t.suggestedPlatform === p.key).length;
                if (count === 0) return null;
                const Icon = platformIcons[p.key];
                return (
                  <div key={p.key} className="flex items-center gap-2">
                    <div className={cn('w-6 h-6 rounded flex items-center justify-center', platformColors[p.key])}>
                      {Icon && <Icon size={12} />}
                    </div>
                    <span className="text-xs text-slate-400 flex-1">{p.label.split(' ')[0]}</span>
                    <span className="text-xs font-bold text-slate-300">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
