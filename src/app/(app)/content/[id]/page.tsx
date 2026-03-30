'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProject, saveProject, getBrandVoice, trackCopy, trackDownload } from '@/lib/storage';
import { getQualityBg, formatDate, downloadAsZip } from '@/lib/utils';
import { ContentProject, PLATFORMS, FRAMEWORK_LABELS, ContentFramework } from '@/types';
import {
  ArrowLeft, Copy, Check, Edit3, Save, X, RefreshCw, Download,
  Loader2, ChevronDown, ChevronUp, FileText, Bot, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { platformIcons } from '@/lib/platform-icons';

const platformColors: Record<string, string> = {
  twitter: 'bg-sky-50 text-sky-600 border-sky-200',
  linkedin: 'bg-blue-50 text-blue-600 border-blue-200',
  instagram: 'bg-pink-50 text-pink-600 border-pink-200',
  email: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  blog: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  youtube: 'bg-red-50 text-red-600 border-red-200',
  'video-script': 'bg-purple-50 text-purple-600 border-purple-200',
};

const SCORE_LABELS: Record<string, { label: string; desc: string }> = {
  hookStrength: { label: 'Hook', desc: 'Stops the scroll?' },
  specificity: { label: 'Specificity', desc: 'Real numbers & scenarios' },
  tacticalDepth: { label: 'Tactical Depth', desc: 'Explains WHY' },
  voiceMatch: { label: 'Voice Match', desc: 'Sounds like you' },
  ctaClarity: { label: 'CTA', desc: 'Clear next step' },
  platformOptimization: { label: 'Platform Fit', desc: 'Right format' },
};

export default function ContentDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<ContentProject | null>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [showScoreDetail, setShowScoreDetail] = useState<string | null>(null);

  useEffect(() => {
    const p = getProject(params.id as string);
    if (p) { setProject(p); if (p.pieces.length > 0) setExpandedPlatform(p.pieces[0].platform); }
  }, [params.id]);

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Content not found.</p>
        <Link href="/library" className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-xl"><ArrowLeft size={16} /> Back to Library</Link>
      </div>
    );
  }

  const handleCopy = (content: string, platform: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPlatform(platform);
    trackCopy();
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleSaveEdit = (platform: string) => {
    const updatedPieces = project.pieces.map(p => p.platform === platform ? { ...p, content: editContent, updatedAt: new Date().toISOString() } : p);
    const updated = { ...project, pieces: updatedPieces, updatedAt: new Date().toISOString() };
    saveProject(updated);
    setProject(updated);
    setEditingPlatform(null);
  };

  const handleRegenerate = async (platform: string) => {
    setRegenerating(platform);
    try {
      const brandVoice = getBrandVoice();
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: project.topic, keyPoints: project.keyPoints, tonePreference: project.tonePreference,
          targetAudience: project.targetAudience, brandVoiceSummary: brandVoice.summary,
          businessProfile: brandVoice.businessProfile || {}, platforms: [platform],
        }),
      });
      const data = await response.json();
      const r = data.results[0];
      const updatedPieces = project.pieces.map(p => p.platform === platform ? { ...p, content: r.content, qualityScore: r.qualityScore, qualityBreakdown: r.qualityBreakdown, framework: r.framework, aiReasoning: r.aiReasoning, updatedAt: new Date().toISOString() } : p);
      const updated = { ...project, pieces: updatedPieces, updatedAt: new Date().toISOString() };
      saveProject(updated);
      setProject(updated);
    } catch (err) { console.error('Regeneration failed:', err); }
    setRegenerating(null);
  };

  const handleDownloadAll = () => {
    downloadAsZip(project.pieces.map(p => ({ platform: p.platform, content: p.content })), project.title);
    trackDownload();
  };

  const avgScore = project.pieces.length > 0 ? (project.pieces.reduce((s, p) => s + p.qualityScore, 0) / project.pieces.length).toFixed(1) : '0';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <Link href="/library" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2"><ArrowLeft size={16} /> Content Library</Link>
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-500 mt-1 text-sm">Created {formatDate(project.createdAt)} &middot; {project.pieces.length} outputs &middot; Avg score: {avgScore}/10</p>
        </div>
        <button onClick={handleDownloadAll} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"><Download size={14} /> Download All</button>
      </div>

      <div className="space-y-4">
        {project.pieces.map((piece) => {
          const Icon = platformIcons[piece.platform] || FileText;
          const platformInfo = PLATFORMS.find(p => p.key === piece.platform);
          const isExpanded = expandedPlatform === piece.platform;
          const isEditing = editingPlatform === piece.platform;
          const isRegenerating = regenerating === piece.platform;
          const frameworkLabel = piece.framework ? FRAMEWORK_LABELS[piece.framework as ContentFramework] : null;

          return (
            <div key={piece.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedPlatform(isExpanded ? null : piece.platform)}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', platformColors[piece.platform])}><Icon size={18} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{platformInfo?.label || piece.platform}</h3>
                    {frameworkLabel && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full hidden sm:inline">{frameworkLabel}</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{piece.content?.slice(0, 80)}...</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold', getQualityBg(piece.qualityScore))}>{piece.qualityScore}/10</div>
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-4">
                  {isRegenerating ? (
                    <div className="flex items-center justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-600" /><span className="ml-3 text-sm text-gray-500">Regenerating...</span></div>
                  ) : isEditing ? (
                    <div>
                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 font-mono resize-none" rows={15} />
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => handleSaveEdit(piece.platform)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700"><Save size={14} /> Save</button>
                        <button onClick={() => setEditingPlatform(null)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl"><X size={14} /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans mb-4 max-h-[400px] overflow-y-auto">{piece.content}</pre>

                      {showScoreDetail === piece.platform && piece.qualityBreakdown && (
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-3 animate-in fade-in duration-300">
                          <p className="text-xs font-semibold text-gray-500 uppercase">Quality Breakdown</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(SCORE_LABELS).map(([key, meta]) => {
                              const score = (piece.qualityBreakdown as any)?.[key] || 7;
                              return (
                                <div key={key} className="bg-white rounded-lg p-2.5 border border-gray-100">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-700">{meta.label}</span>
                                    <span className={cn('text-xs font-bold', score >= 8 ? 'text-emerald-600' : score >= 6 ? 'text-amber-600' : 'text-red-500')}>{score}/10</span>
                                  </div>
                                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={cn('h-full rounded-full', score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-amber-500' : 'bg-red-400')} style={{ width: `${score * 10}%` }} /></div>
                                  <p className="text-[10px] text-gray-400 mt-1">{meta.desc}</p>
                                </div>
                              );
                            })}
                          </div>
                          {piece.qualityBreakdown?.reasons?.map((r: string, i: number) => (
                            <p key={i} className="text-xs text-gray-500 flex items-start gap-1.5"><span className="text-gray-300">-</span>{r}</p>
                          ))}
                          {piece.aiReasoning && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <Bot className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-[10px] font-semibold text-amber-700 uppercase mb-0.5">AI Reasoning</p>
                                  <p className="text-xs text-amber-800 leading-relaxed">{piece.aiReasoning}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <button onClick={() => handleCopy(piece.content, piece.platform)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                          {copiedPlatform === piece.platform ? <><Check size={12} className="text-emerald-600" /> Copied</> : <><Copy size={12} /> Copy</>}
                        </button>
                        <button onClick={() => { setEditContent(piece.content); setEditingPlatform(piece.platform); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg"><Edit3 size={12} /> Edit</button>
                        <button onClick={() => handleRegenerate(piece.platform)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg"><RefreshCw size={12} /> Regenerate</button>
                        <button onClick={() => setShowScoreDetail(showScoreDetail === piece.platform ? null : piece.platform)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg ml-auto"><Info size={12} /> {showScoreDetail === piece.platform ? 'Hide' : 'Score'} Details</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
