'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getProjects, markFeatureSeen } from '@/lib/storage';
import { formatRelativeTime, getQualityBg, formatDate } from '@/lib/utils';
import { ContentProject, PLATFORMS, FRAMEWORK_LABELS, ContentFramework } from '@/types';
import {
  Search, FileText, ChevronRight, Calendar, RefreshCw, Plus,
  Grid3X3, List, Sparkles, ArrowRight,
} from 'lucide-react';
import { platformIcons } from '@/lib/platform-icons';
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
          <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
          <p className="text-gray-500 mt-1">{projects.length} projects &middot; {totalPieces} total content pieces</p>
        </div>
        <Link href="/content/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm">
          <Plus size={16} /> Create New Content
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 placeholder:text-gray-400 transition-all" placeholder="Search by topic, keyword, or platform..." />
          </div>
          <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-700 bg-white min-w-[160px]">
            <option value="all">All Platforms</option>
            {PLATFORMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-700 bg-white min-w-[140px]">
            <option value="date">Newest First</option>
            <option value="score">Highest Score</option>
          </select>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('list')} className={cn('p-2.5 transition-colors', viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600')}><List size={16} /></button>
            <button onClick={() => setViewMode('grid')} className={cn('p-2.5 transition-colors', viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600')}><Grid3X3 size={16} /></button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4"><FileText size={28} className="text-white" /></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{projects.length === 0 ? 'Your library is empty' : 'No matching content'}</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">{projects.length === 0 ? 'Create your first piece of content and it will appear here. Every output is saved and searchable.' : 'Try adjusting your search or filters.'}</p>
          {projects.length === 0 && (
            <Link href="/content/new" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"><Sparkles size={16} /> Create Your First Content</Link>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {filtered.map((project) => {
            const avgScore = project.pieces.length > 0 ? (project.pieces.reduce((s, p) => s + p.qualityScore, 0) / project.pieces.length).toFixed(1) : '0';
            const frameworks = Array.from(new Set(project.pieces.filter(p => p.framework).map(p => FRAMEWORK_LABELS[p.framework as ContentFramework]))).slice(0, 2);
            return (
              <Link key={project.id} href={`/content/${project.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0"><FileText size={18} className="text-blue-600" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{project.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={10} />{formatRelativeTime(project.createdAt)}</span>
                    <span className="text-xs text-gray-400">{project.pieces.length} outputs</span>
                    {frameworks.length > 0 && <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded hidden sm:inline">{frameworks[0]}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {project.pieces.slice(0, 4).map((piece, i) => {
                    const Icon = platformIcons[piece.platform] || FileText;
                    return <div key={i} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><Icon size={12} className="text-gray-500" /></div>;
                  })}
                  {project.pieces.length > 4 && <span className="text-xs text-gray-400">+{project.pieces.length - 4}</span>}
                </div>
                <div className={cn('px-2 py-1 rounded-lg text-xs font-semibold', getQualityBg(parseFloat(avgScore)))}>{avgScore}</div>
                <ChevronRight size={16} className="text-gray-300" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const avgScore = project.pieces.length > 0 ? (project.pieces.reduce((s, p) => s + p.qualityScore, 0) / project.pieces.length).toFixed(1) : '0';
            return (
              <Link key={project.id} href={`/content/${project.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><FileText size={16} className="text-blue-600" /></div>
                  <div className={cn('px-2 py-1 rounded-lg text-xs font-semibold', getQualityBg(parseFloat(avgScore)))}>{avgScore}</div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{project.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{formatRelativeTime(project.createdAt)}</p>
                <div className="flex items-center gap-1.5">
                  {project.pieces.slice(0, 5).map((piece, i) => {
                    const Icon = platformIcons[piece.platform] || FileText;
                    return <div key={i} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"><Icon size={10} className="text-gray-500" /></div>;
                  })}
                  {project.pieces.length > 5 && <span className="text-[10px] text-gray-400">+{project.pieces.length - 5}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
