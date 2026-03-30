'use client';

import { useEffect, useState, useMemo } from 'react';
import { getProjects, getStats } from '@/lib/storage';
import { ContentProject, PLATFORMS } from '@/types';
import {
  BarChart3, TrendingUp, FileText, Star, Calendar,
  ArrowUpRight, ArrowDownRight, Lock, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { platformIcons, platformHexColors as platformColors } from '@/lib/platform-icons';



export default function AnalyticsPage() {
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setProjects(getProjects());
    setStats(getStats());
  }, []);

  const weeklyData = useMemo(() => {
    const weeks: { label: string; count: number; avgScore: number }[] = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekProjects = projects.filter(p => {
        const d = new Date(p.createdAt);
        return d >= weekStart && d < weekEnd;
      });

      const pieces = weekProjects.flatMap(p => p.pieces);
      const avgScore = pieces.length > 0
        ? pieces.reduce((s, p) => s + p.qualityScore, 0) / pieces.length
        : 0;

      weeks.push({
        label: `Week ${4 - i}`,
        count: pieces.length,
        avgScore: Math.round(avgScore * 10) / 10,
      });
    }
    return weeks;
  }, [projects]);

  const platformStats = useMemo(() => {
    const map: Record<string, { count: number; totalScore: number }> = {};
    projects.forEach(p => {
      p.pieces.forEach(piece => {
        if (!map[piece.platform]) map[piece.platform] = { count: 0, totalScore: 0 };
        map[piece.platform].count++;
        map[piece.platform].totalScore += piece.qualityScore;
      });
    });
    return Object.entries(map).map(([platform, data]) => ({
      platform,
      count: data.count,
      avgScore: Math.round((data.totalScore / data.count) * 10) / 10,
    })).sort((a, b) => b.count - a.count);
  }, [projects]);

  const maxWeeklyCount = Math.max(...weeklyData.map(w => w.count), 1);

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-slate-500 mt-1">Track your content performance and output metrics.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Content Pieces',
            value: stats.contentGenerated,
            change: '+12%',
            positive: true,
            icon: FileText,
            color: 'text-brand-600 bg-brand-50',
          },
          {
            label: 'Total Projects',
            value: stats.projectCount,
            change: '+8%',
            positive: true,
            icon: BarChart3,
            color: 'text-purple-600 bg-purple-50',
          },
          {
            label: 'Avg Quality Score',
            value: stats.avgQualityScore > 0 ? stats.avgQualityScore.toFixed(1) : '—',
            change: '+0.3',
            positive: true,
            icon: Star,
            color: 'text-amber-600 bg-amber-50',
          },
          {
            label: 'Active Platforms',
            value: Object.keys(stats.platformDistribution).length,
            change: '',
            positive: true,
            icon: TrendingUp,
            color: 'text-emerald-600 bg-emerald-50',
          },
        ].map((stat, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500 font-medium">{stat.label}</span>
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', stat.color)}>
                <stat.icon size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            {stat.change && (
              <div className="flex items-center gap-1 mt-1">
                {stat.positive ? (
                  <ArrowUpRight size={12} className="text-success-600" />
                ) : (
                  <ArrowDownRight size={12} className="text-danger-500" />
                )}
                <span className={cn('text-xs font-medium', stat.positive ? 'text-success-600' : 'text-danger-500')}>
                  {stat.change}
                </span>
                <span className="text-xs text-slate-400">vs last month</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Content Volume Chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Content Volume (Last 4 Weeks)</h3>
          <div className="flex items-end gap-3 h-48">
            {weeklyData.map((week, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">{week.count}</span>
                <div
                  className="w-full rounded-t-lg gradient-bg transition-all"
                  style={{ height: `${Math.max((week.count / maxWeeklyCount) * 100, 4)}%` }}
                />
                <span className="text-xs text-slate-500">{week.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Scores Chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Quality Scores (Last 4 Weeks)</h3>
          <div className="flex items-end gap-3 h-48">
            {weeklyData.map((week, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  {week.avgScore > 0 ? week.avgScore : '—'}
                </span>
                <div
                  className="w-full rounded-t-lg bg-amber-400 transition-all"
                  style={{ height: `${week.avgScore > 0 ? (week.avgScore / 10) * 100 : 4}%` }}
                />
                <span className="text-xs text-slate-500">{week.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 mb-6">Platform Distribution</h3>
        {platformStats.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            Generate content to see platform distribution analytics.
          </p>
        ) : (
          <div className="space-y-4">
            {platformStats.map((ps) => {
              const Icon = platformIcons[ps.platform] || FileText;
              const info = PLATFORMS.find(p => p.key === ps.platform);
              const percentage = Math.round((ps.count / stats.contentGenerated) * 100);
              return (
                <div key={ps.platform} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} style={{ color: platformColors[ps.platform] }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{info?.label || ps.platform}</span>
                      <span className="text-sm text-slate-500">{ps.count} pieces ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: platformColors[ps.platform] || '#6366f1' }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-slate-700 w-12 text-right">
                    {ps.avgScore}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Revenue Attribution Teaser */}
      <div className="card p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Lock size={24} className="text-white/60" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-medium mb-3">
              <Sparkles size={12} />
              Coming Soon
            </div>
            <h3 className="text-xl font-bold mb-2">Revenue Attribution Dashboard</h3>
            <p className="text-white/60 leading-relaxed max-w-lg mb-4">
              Connect your CRM (HubSpot, Salesforce, or Pipedrive) to see exactly which content pieces 
              generate leads, pipeline, and closed revenue. Track the full journey from content view to signed deal.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-sm">
              {[
                { label: 'Pipeline Influenced', value: '$—' },
                { label: 'Deals Attributed', value: '—' },
                { label: 'Content ROI', value: '—x' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <p className="text-lg font-bold text-white/40">{item.value}</p>
                  <p className="text-xs text-white/30 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
