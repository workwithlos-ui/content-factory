'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getStats, getActivation, getActivationScore, getCompletedMilestones, getTotalMilestones, getBrandVoice, markFeatureSeen } from '@/lib/storage';
import { INDUSTRY_BENCHMARKS } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Sparkles, ArrowRight, TrendingUp, FileText, BarChart3, Target,
  Zap, CheckCircle2, Circle, X, Lightbulb,
  Bot, Star, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { platformIcons } from '@/lib/platform-icons';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activation, setActivation] = useState<any>(null);
  const [brandVoice, setBrandVoice] = useState<any>(null);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  useEffect(() => {
    setStats(getStats());
    setActivation(getActivation());
    setBrandVoice(getBrandVoice());
    markFeatureSeen('dashboard');
  }, []);

  if (!stats || !activation) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  const activationScore = getActivationScore();
  const completedMilestones = getCompletedMilestones();
  const totalMilestones = getTotalMilestones();
  const industry = user?.industry || 'Other';
  const benchmark = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['Other'];
  const hasContent = stats.contentGenerated > 0;
  const hasVoice = brandVoice?.summary && brandVoice.summary.length > 0;

  const getNextStep = () => {
    if (!hasVoice) return { label: 'Complete your voice profile', href: '/voice', icon: Bot, color: 'text-amber-600 bg-amber-50' };
    if (!hasContent) return { label: 'Generate your first content', href: '/content/new', icon: Sparkles, color: 'text-blue-600 bg-blue-50' };
    if (stats.contentGenerated < 3) return { label: `Generate ${3 - stats.contentGenerated} more pieces to hit your activation goal`, href: '/content/new', icon: Target, color: 'text-indigo-600 bg-indigo-50' };
    if (!activation.milestones.contentCopied) return { label: 'Copy your best content to publish it', href: '/library', icon: FileText, color: 'text-emerald-600 bg-emerald-50' };
    return { label: 'Create more content to build momentum', href: '/content/new', icon: Sparkles, color: 'text-blue-600 bg-blue-50' };
  };
  const nextStep = getNextStep();

  const projectedMonthlyContent = Math.max(stats.contentGenerated * 4, benchmark.avgContentPerMonth);
  const projectedPipeline = Math.round((stats.contentGenerated / Math.max(benchmark.avgContentPerMonth, 1)) * benchmark.avgPipelinePerMonth);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {hasContent ? 'Content Command Center' : `Welcome, ${user?.name?.split(' ')[0] || 'there'}`}
          </h1>
          <p className="text-gray-500 mt-1">
            {hasContent
              ? `${stats.contentGenerated} pieces generated \u00B7 ${stats.projectCount} projects`
              : "Let\u2019s get your content engine running. Here\u2019s your personalized launch plan."
            }
          </p>
        </div>
        <Link href="/content/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm">
          <Sparkles className="w-4 h-4" /> Create New Content
        </Link>
      </div>

      {/* Activation Progress Banner */}
      {activationScore < 100 && !dismissedBanner && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><Zap className="w-5 h-5 text-blue-600" /></div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Setup Progress</h3>
                <p className="text-xs text-gray-500">{completedMilestones} of {totalMilestones} milestones complete</p>
              </div>
            </div>
            <button onClick={() => setDismissedBanner(true)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${activationScore}%` }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'onboardingComplete', label: 'Onboarding' },
              { key: 'voiceProfileBuilt', label: 'Voice Profile' },
              { key: 'firstContentGenerated', label: 'First Content' },
              { key: 'contentCopied', label: 'Content Copied' },
            ].map(m => (
              <div key={m.key} className="flex items-center gap-2 text-xs">
                {activation.milestones[m.key] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3.5 h-3.5 text-gray-300" />}
                <span className={activation.milestones[m.key] ? 'text-gray-700' : 'text-gray-400'}>{m.label}</span>
              </div>
            ))}
          </div>
          <Link href={nextStep.href} className="mt-3 flex items-center gap-3 bg-white/70 rounded-xl p-3 hover:bg-white transition-all group">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', nextStep.color)}><nextStep.icon className="w-4 h-4" /></div>
            <div className="flex-1"><p className="text-sm font-semibold text-gray-800">Next: {nextStep.label}</p></div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-blue-500" /><span className="text-xs font-medium text-gray-500">Content Generated</span></div>
          <p className="text-3xl font-bold text-gray-900">{stats.contentGenerated}</p>
          {!hasContent && <p className="text-xs text-gray-400 mt-1">Industry avg: {benchmark.avgContentPerMonth}/mo</p>}
          {hasContent && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> On pace for {projectedMonthlyContent}/mo</p>}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-indigo-500" /><span className="text-xs font-medium text-gray-500">Pipeline Influenced</span></div>
          <p className="text-3xl font-bold text-gray-900">${projectedPipeline > 0 ? projectedPipeline.toLocaleString() : '0'}</p>
          <p className="text-xs text-gray-400 mt-1">{hasContent ? `Projected from ${industry} benchmarks` : `${industry} avg: $${benchmark.avgPipelinePerMonth.toLocaleString()}/mo`}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3"><Star className="w-4 h-4 text-amber-500" /><span className="text-xs font-medium text-gray-500">Avg Quality Score</span></div>
          <p className="text-3xl font-bold text-gray-900">{stats.avgQualityScore > 0 ? stats.avgQualityScore : '\u2014'}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.avgQualityScore > 0 ? `Industry avg: ${benchmark.avgQualityScore}` : `Target: ${benchmark.avgQualityScore}+`}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-emerald-500" /><span className="text-xs font-medium text-gray-500">Day Streak</span></div>
          <p className="text-3xl font-bold text-gray-900">{activation.currentStreak}</p>
          <p className="text-xs text-gray-400 mt-1">{activation.currentStreak > 0 ? 'Keep the momentum going' : 'Start your streak today'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Empty State */}
          {!hasContent && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4"><Sparkles className="w-8 h-8 text-white" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Generate Your First Content</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Enter a topic and watch the AI create 7 platform-optimized outputs using your business context, customer pain points, and voice profile.</p>
              <Link href="/content/new" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"><Sparkles className="w-4 h-4" /> Create Content Now</Link>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div><p className="text-2xl font-bold text-gray-900">7</p><p className="text-xs text-gray-400">Platforms per topic</p></div>
                <div><p className="text-2xl font-bold text-gray-900">12</p><p className="text-xs text-gray-400">AI frameworks</p></div>
                <div><p className="text-2xl font-bold text-gray-900">6</p><p className="text-xs text-gray-400">Quality dimensions</p></div>
              </div>
            </div>
          )}

          {/* Recent Content */}
          {hasContent && stats.recentProjects.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-50">
                <h3 className="font-bold text-gray-900">Recent Content</h3>
                <Link href="/library" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
              </div>
              <div className="divide-y divide-gray-50">
                {stats.recentProjects.slice(0, 5).map((project: any) => (
                  <Link key={project.id} href={`/content/${project.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-500" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{project.title}</p>
                      <p className="text-xs text-gray-400">{project.pieces.length} outputs &middot; {formatDate(project.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.pieces.length > 0 && (
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-lg', (project.pieces.reduce((s: number, p: any) => s + p.qualityScore, 0) / project.pieces.length) >= 8 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                          {(project.pieces.reduce((s: number, p: any) => s + p.qualityScore, 0) / project.pieces.length).toFixed(1)}
                        </span>
                      )}
                      <ArrowUpRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Topics */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-gray-900 text-sm">Suggested Topics for {industry}</h3>
            </div>
            <div className="space-y-2">
              {benchmark.topTopics.slice(0, 5).map((topic: string, i: number) => (
                <Link key={i} href="/content/new" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                  <span className="text-sm text-gray-700 flex-1">{topic}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Voice Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Voice Profile</h3>
              <Link href="/voice" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Manage</Link>
            </div>
            {hasVoice ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${brandVoice.voiceConfidence || 50}%` }} /></div>
                  <span className="text-xs font-semibold text-blue-600">{brandVoice.voiceConfidence || 50}%</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{brandVoice.summary?.slice(0, 120)}...</p>
                <div className="flex flex-wrap gap-1">
                  {(brandVoice.characteristics?.tone || []).slice(0, 4).map((t: string) => <span key={t} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Bot className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-3">No voice profile yet</p>
                <Link href="/voice" className="text-xs text-blue-600 font-medium">Build Profile</Link>
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-gray-900 text-sm">AI Recommendations</h3>
            </div>
            <div className="space-y-3">
              {!hasContent && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Start with your biggest objection</p>
                  <p className="text-[11px] text-blue-600 leading-relaxed">Your first content piece should address the #1 reason people say no to you. This positions you as someone who understands the buyer&apos;s hesitation.</p>
                </div>
              )}
              {hasContent && stats.contentGenerated < 5 && (
                <div className="bg-indigo-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-indigo-700 mb-1">Build momentum</p>
                  <p className="text-[11px] text-indigo-600 leading-relaxed">Companies that publish 3+ pieces in week 1 are 4x more likely to see pipeline impact. You&apos;re at {stats.contentGenerated} &mdash; keep going.</p>
                </div>
              )}
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">Competitor gap opportunity</p>
                <p className="text-[11px] text-amber-600 leading-relaxed">Most {industry} companies aren&apos;t covering: {benchmark.competitorGaps[0]}. Create content here to own the space.</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-emerald-700 mb-1">Platform strategy</p>
                <p className="text-[11px] text-emerald-600 leading-relaxed">LinkedIn + Email is the highest-converting combo for {industry}. Start there, then expand to Twitter for reach.</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">This Week</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Content Created</span><span className="text-sm font-bold text-gray-900">{stats.contentGenerated}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Copies Made</span><span className="text-sm font-bold text-gray-900">{activation.copyCount}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Downloads</span><span className="text-sm font-bold text-gray-900">{activation.downloadCount}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Login Streak</span><span className="text-sm font-bold text-gray-900">{activation.currentStreak} days</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
