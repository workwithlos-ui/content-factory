'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getProjects, markFeatureSeen } from '@/lib/storage';
import { formatRelativeTime } from '@/lib/utils';
import { ContentProject, PLATFORMS } from '@/types';
import { Search, FileText, ChevronRight, Calendar, Plus, Grid3X3, List, Sparkles } from 'lucide-react';
import { platformIcons, platformColors } from '@/lib/platform-icons';
import { cn } from '@/lib/utils';

export default function LibraryPage() {
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    setProjects(getProjects());
    markFeatureSeen('library');
  }, []);

  const filtered = useMemo(() => {
    let result = [...projects];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q) || p.pieces.some(piece => piece.content.toLowerCase().includes(q)));
    }
    if (platformFilter !== 'all') {
      result = result.filter(p => p.pieces.some(piece => piece.platform === platformFilter));
    }
    if (sortBy === 'score') {
      result.sort((a, b) => {
        const avgA = a.pieces.reduce((s, p) => s + p.qualityScore, 0) / (a.pieces.length || 1);
        const avgB = b.pieces.reduce((s, p) => s + p.qualityScore, 0) / (b.pieces.length || 1);
        return avgB - avgA;
      });
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [projects, searchQuery, platformFilter, sortBy]);

  const totalPieces = projects.reduce((s, p) => s + p.pieces.length, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Library</h1>
          <p className="text-slate-500 mt-1">{projects.length} projects &middot; {totalPieces} total content pieces</p>
        </div>
        <Link href="/content/new" className="btn-primary gap-2">
          <Plus size={16} /> Create New Content
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field pl-9" placeholder="Search by topic, keyword, or platform..." />
          </div>
          <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)} className="select-field min-w-[160px]">
            <option value="all">All Platforms</option>
            {PLATFORMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="select-field min-w-[140px]">
            <option value="date">Newest First</option>
            <option value="score">Highest Score</option>
          </select>
          <div className="flex items-center border border-white/[0.06] rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('list')} className={cn('p-2.5 transition-colors', viewMode === 'list' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-600 hover:text-slate-400')}><List size={16} /></button>
            <button onClick={() => setViewMode('grid')} className={cn('p-2.5 transition-colors', viewMode === 'grid' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-600 hover:text-slate-400')}><Grid3X3 size={16} /></button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-glow"><FileText size={28} className="text-white" /></div>
          <h3 className="text-xl font-bold text-white mb-2">{projects.length === 0 ? 'Your library is empty' : 'No matching content'}</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">{projects.length === 0 ? 'Create your first piece of content and it will appear here.' : 'Try adjusting your search or filters.'}</p>
          {projects.length === 0 && (
            <Link href="/content/new" className="btn-primary gap-2 inline-flex"><Sparkles size={16} /> Create Your First Content</Link>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="card divide-y divide-white/[0.04]">
          {filtered.map((project) => {
            const avgScore = project.pieces.length > 0 ? (project.pieces.reduce((s, p) => s + p.qualityScore, 0) / project.pieces.length).toFixed(1) : '0';
            return (
              <Link key={project.id} href={`/content/${project.id}`} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0"><FileText size={18} className="text-indigo-400" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white">{project.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-600 flex items-center gap-1"><Calendar size={10} />{formatRelativeTime(project.createdAt)}</span>
                    <span className="text-xs text-slate-600">{project.pieces.length} outputs</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {project.pieces.slice(0, 4).map((piece, i) => {
                    const Icon = platformIcons[piece.platform] || FileText;
                    return <div key={i} className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center"><Icon size={12} className="text-slate-500" /></div>;
                  })}
                  {project.pieces.length > 4 && <span className="text-xs text-slate-600">+{project.pieces.length - 4}</span>}
                </div>
                <span className={cn('badge border text-xs font-bold', parseFloat(avgScore) >= 7 ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : 'bg-amber-950/50 text-amber-400 border-amber-800/50')}>
                  {avgScore}
                </span>
                <ChevronRight size={16} className="text-slate-700 group-hover:text-slate-400" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const avgScore = project.pieces.length > 0 ? (project.pieces.reduce((s, p) => s + p.qualityScore, 0) / project.pieces.length).toFixed(1) : '0';
            return (
              <Link key={project.id} href={`/content/${project.id}`} className="card-hover p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center"><FileText size={16} className="text-indigo-400" /></div>
                  <span className={cn('badge border text-xs font-bold', parseFloat(avgScore) >= 7 ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : 'bg-amber-950/50 text-amber-400 border-amber-800/50')}>
                    {avgScore}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">{project.title}</h3>
                <p className="text-xs text-slate-600 mb-3">{formatRelativeTime(project.createdAt)}</p>
                <div className="flex items-center gap-1.5">
                  {project.pieces.slice(0, 5).map((piece, i) => {
                    const Icon = platformIcons[piece.platform] || FileText;
                    return <div key={i} className="w-6 h-6 rounded bg-white/[0.04] border border-white/[0.06] flex items-center justify-center"><Icon size={10} className="text-slate-500" /></div>;
                  })}
                  {project.pieces.length > 5 && <span className="text-[10px] text-slate-600">+{project.pieces.length - 5}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
