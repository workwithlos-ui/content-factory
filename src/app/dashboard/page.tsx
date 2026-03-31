'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getStats, getActivation, getActivationScore, getBrandVoiceDNA, getContentExamples, getAudienceProfiles, markFeatureSeen, getBrandVoice } from '@/lib/storage';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { Zap, PenTool, Mic2, BookOpen, Users, Shuffle, ArrowRight, BarChart3, TrendingUp, FileText, Sparkles, Target, Star, ChevronRight, ArrowUpRight, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [contextStatus, setContextStatus] = useState({ voiceDNA: false, examples: 0, audiences: 0 });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push('/login'); return; }
    setStats(getStats());
    markFeatureSeen('dashboard');
    const voiceDNA = getBrandVoiceDNA();
    const examples = getContentExamples();
    const audiences = getAudienceProfiles();
    setContextStatus({ voiceDNA: !!voiceDNA?.brandName, examples: examples.length, audiences: audiences.length });
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !stats) return (
    <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  );

  const contextScore = [contextStatus.voiceDNA, contextStatus.examples >= 3, contextStatus.audiences >= 1].filter(Boolean).length;
  const hasContent = stats.contentGenerated > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {hasContent ? 'Content Command Center' : `Welcome, ${user?.name?.split(' ')[0] || 'there'}`}
          </h1>
          <p className="text-slate-500 mt-1">
            {hasContent
              ? `${stats.contentGenerated} pieces generated · ${stats.projectCount} projects`
              : "Your anti-slop content engine is ready. Let's configure it."}
          </p>
        </div>
        <Link href="/content/new" className="btn-primary gap-2">
          <PenTool size={16} /> Create Content
        </Link>
      </div>

      {/* Context Engine Setup */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Context Engine</h2>
            <p className="text-xs text-slate-500 mt-0.5">More context = less AI slop. Configure all three for maximum quality.</p>
          </div>
          <span className={cn('badge border', contextScore >= 3 ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : contextScore >= 1 ? 'bg-amber-950/50 text-amber-400 border-amber-800/50' : 'bg-red-950/50 text-red-400 border-red-800/50')}>
            {contextScore}/3 configured
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/voice-dna" className={cn('card-hover p-4 flex items-start gap-3', contextStatus.voiceDNA && 'border-emerald-800/20')}>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', contextStatus.voiceDNA ? 'bg-emerald-950/50 border border-emerald-800/30' : 'gradient-bg shadow-glow')}>
              <Mic2 size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{contextStatus.voiceDNA ? 'Voice DNA Active' : 'Set Up Voice DNA'}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{contextStatus.voiceDNA ? 'Your brand voice is injected into every prompt.' : 'Define your voice, phrases, and style.'}</p>
            </div>
          </Link>
          <Link href="/examples" className={cn('card-hover p-4 flex items-start gap-3', contextStatus.examples >= 3 && 'border-emerald-800/20')}>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', contextStatus.examples >= 3 ? 'bg-emerald-950/50 border border-emerald-800/30' : 'bg-amber-600/20 border border-amber-700/30')}>
              <BookOpen size={18} className={contextStatus.examples >= 3 ? 'text-emerald-400' : 'text-amber-400'} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{contextStatus.examples >= 3 ? `${contextStatus.examples} Examples Loaded` : 'Add Content Examples'}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{contextStatus.examples >= 3 ? 'AI is matching your tone and structure.' : `${contextStatus.examples}/3 minimum needed.`}</p>
            </div>
          </Link>
          <Link href="/audiences" className={cn('card-hover p-4 flex items-start gap-3', contextStatus.audiences >= 1 && 'border-emerald-800/20')}>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', contextStatus.audiences >= 1 ? 'bg-emerald-950/50 border border-emerald-800/30' : 'bg-violet-600/20 border border-violet-700/30')}>
              <Users size={18} className={contextStatus.audiences >= 1 ? 'text-emerald-400' : 'text-violet-400'} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{contextStatus.audiences >= 1 ? `${contextStatus.audiences} Audience Profile(s)` : 'Create Audience Profile'}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{contextStatus.audiences >= 1 ? 'Content is tailored to their pain points.' : "Define who you're talking to."}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-indigo-400" /><span className="text-xs font-medium text-slate-500">Content Generated</span></div>
          <p className="text-3xl font-bold text-white">{stats.contentGenerated}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-cyan-400" /><span className="text-xs font-medium text-slate-500">Projects</span></div>
          <p className="text-3xl font-bold text-white">{stats.projectCount}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3"><Star className="w-4 h-4 text-amber-400" /><span className="text-xs font-medium text-slate-500">Avg Quality</span></div>
          <p className={cn('text-3xl font-bold', stats.avgQualityScore >= 7 ? 'text-emerald-400' : stats.avgQualityScore > 0 ? 'text-amber-400' : 'text-slate-600')}>{stats.avgQualityScore > 0 ? stats.avgQualityScore : '—'}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-emerald-400" /><span className="text-xs font-medium text-slate-500">Platforms Used</span></div>
          <p className="text-3xl font-bold text-white">{Object.keys(stats.platformDistribution || {}).length}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/content/new" className="card-hover p-5 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-glow">
            <PenTool size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Create New Content</h3>
            <p className="text-sm text-slate-500">Generate anti-slop content for multiple platforms</p>
          </div>
          <ArrowRight size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
        </Link>
        <Link href="/remix" className="card-hover p-5 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-700/30 flex items-center justify-center">
            <Shuffle size={20} className="text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Remix Content</h3>
            <p className="text-sm text-slate-500">Take one piece and adapt it for every platform</p>
          </div>
          <ArrowRight size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
        </Link>
      </div>

      {/* Recent Content */}
      {hasContent && stats.recentProjects?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
            <h3 className="font-bold text-white">Recent Content</h3>
            <Link href="/library" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {stats.recentProjects.slice(0, 5).map((project: any) => (
              <Link key={project.id} href={`/content/${project.id}`} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center"><FileText className="w-5 h-5 text-indigo-400" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white">{project.title}</p>
                  <p className="text-xs text-slate-600">{project.pieces?.length || 0} outputs · {formatDate(project.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {project.pieces?.length > 0 && (
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-lg border', (project.pieces.reduce((s: number, p: any) => s + p.qualityScore, 0) / project.pieces.length) >= 7 ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : 'bg-amber-950/50 text-amber-400 border-amber-800/50')}>
                      {(project.pieces.reduce((s: number, p: any) => s + p.qualityScore, 0) / project.pieces.length).toFixed(1)}
                    </span>
                  )}
                  <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasContent && (
        <div className="card p-10 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-glow"><Sparkles className="w-8 h-8 text-white" /></div>
          <h3 className="text-xl font-bold text-white mb-2">Generate Your First Content</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">Enter a topic and the anti-slop engine will create platform-optimized content using your brand voice, audience profile, and content examples.</p>
          <Link href="/content/new" className="btn-primary gap-2 inline-flex"><Sparkles className="w-4 h-4" /> Create Content Now</Link>
        </div>
      )}
    </div>
  );
}
