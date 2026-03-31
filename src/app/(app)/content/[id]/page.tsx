'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProject, saveProject, trackCopy, trackDownload, saveScheduledPost } from '@/lib/storage';
import { ContentProject, ContentPiece, PLATFORMS } from '@/types';
import { ArrowLeft, Copy, Check, Edit3, Save, X, RefreshCw, Download, ChevronDown, ChevronUp, Sparkles, Calendar, Image } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { cn, formatDate } from '@/lib/utils';
import { platformIcons, platformColors } from '@/lib/platform-icons';

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
  const router = useRouter();
  const [project, setProject] = useState<ContentProject | null>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [showScoreDetail, setShowScoreDetail] = useState<string | null>(null);
  const [scheduledPlatform, setScheduledPlatform] = useState<string | null>(null);

  useEffect(() => {
    const p = getProject(params.id as string);
    if (p) { setProject(p); if (p.pieces.length > 0) setExpandedPlatform(p.pieces[0].platform); }
  }, [params.id]);

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Content not found.</p>
        <Link href="/library" className="btn-secondary mt-4 inline-flex gap-2"><ArrowLeft size={16} /> Back to Library</Link>
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

  const handleDownloadAll = () => {
    const combined = project.pieces.map(p => `=== ${p.platform.toUpperCase()} ===\n\n${p.content}\n\n`).join('\n---\n\n');
    const blob = new Blob([combined], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-content.txt`;
    a.click();
    URL.revokeObjectURL(url);
    trackDownload();
  };

  const avgScore = project.pieces.length > 0 ? (project.pieces.reduce((s, p) => s + p.qualityScore, 0) / project.pieces.length).toFixed(1) : '0';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <Link href="/library" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mb-2"><ArrowLeft size={16} /> Content Library</Link>
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
          <p className="text-slate-500 mt-1 text-sm">Created {formatDate(project.createdAt)} &middot; {project.pieces.length} outputs &middot; Avg score: {avgScore}/10</p>
        </div>
        <button onClick={handleDownloadAll} className="btn-secondary gap-2"><Download size={14} /> Download All</button>
      </div>

      {project.strategicBrief && (
        <div className="card p-4 mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Strategic Angle</p>
          <p className="text-sm text-slate-300">{project.strategicBrief.strategicAngle}</p>
        </div>
      )}

      <div className="space-y-4">
        {project.pieces.map((piece) => {
          const Icon = platformIcons[piece.platform];
          const colorClass = platformColors[piece.platform] || '';
          const platformInfo = PLATFORMS.find(p => p.key === piece.platform);
          const isExpanded = expandedPlatform === piece.platform;
          const isEditing = editingPlatform === piece.platform;

          return (
            <div key={piece.id} className="card overflow-hidden">
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setExpandedPlatform(isExpanded ? null : piece.platform)}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', colorClass)}>{Icon && <Icon size={18} />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm">{platformInfo?.label || piece.platform}</h3>
                    {piece.framework && <span className="text-[10px] bg-white/[0.04] text-slate-500 px-2 py-0.5 rounded-full border border-white/[0.06] hidden sm:inline">{piece.framework}</span>}
                  </div>
                  <p className="text-xs text-slate-600 truncate">{piece.content?.slice(0, 80)}...</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('badge border text-xs font-bold', piece.qualityScore >= 8 ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : piece.qualityScore >= 6 ? 'bg-amber-950/50 text-amber-400 border-amber-800/50' : 'bg-red-950/50 text-red-400 border-red-800/50')}>
                    {piece.qualityScore}/10
                  </span>
                  {piece.humanScore && (
                    <span className={cn('badge border text-xs', piece.humanScore.overall >= 7 ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : 'bg-amber-950/50 text-amber-400 border-amber-800/50')}>
                      <Sparkles size={10} className="mr-1" />{piece.humanScore.overall}
                    </span>
                  )}
                  {isExpanded ? <ChevronUp size={16} className="text-slate-600" /> : <ChevronDown size={16} className="text-slate-600" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-white/[0.04] p-4">
                  {isEditing ? (
                    <div>
                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="textarea-field font-mono text-sm" rows={15} />
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => handleSaveEdit(piece.platform)} className="btn-primary gap-1.5 text-sm"><Save size={14} /> Save</button>
                        <button onClick={() => setEditingPlatform(null)} className="btn-ghost gap-1.5 text-sm"><X size={14} /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <pre className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans mb-4 max-h-[400px] overflow-y-auto">{piece.content}</pre>

                      {showScoreDetail === piece.platform && (
                        <div className="bg-white/[0.02] rounded-xl p-4 space-y-3 mb-3 border border-white/[0.04]">
                          <p className="text-xs font-semibold text-slate-500 uppercase">Quality Breakdown</p>
                          {piece.qualityBreakdown && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {Object.entries(SCORE_LABELS).map(([key, meta]) => {
                                const score = (piece.qualityBreakdown as any)?.[key] || 7;
                                return (
                                  <div key={key} className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-slate-400">{meta.label}</span>
                                      <span className={cn('text-xs font-bold', score >= 8 ? 'text-emerald-400' : score >= 6 ? 'text-amber-400' : 'text-red-400')}>{score}/10</span>
                                    </div>
                                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                      <div className={cn('h-full rounded-full', score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-amber-500' : 'bg-red-400')} style={{ width: `${score * 10}%` }} />
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-1">{meta.desc}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {piece.humanScore && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-indigo-400 mb-2 flex items-center gap-1"><Sparkles size={10} /> Anti-Slop Human Score: {piece.humanScore.overall}/10</p>
                              <div className="flex flex-wrap gap-2 text-xs mb-2">
                                <span className={cn('badge border', piece.humanScore.openingIsSpecific ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : 'bg-red-950/50 text-red-400 border-red-800/50')}>
                                  Opening: {piece.humanScore.openingIsSpecific ? 'Specific' : 'Generic'}
                                </span>
                                <span className={cn('badge border', piece.humanScore.hasIrregularRhythm ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : 'bg-red-950/50 text-red-400 border-red-800/50')}>
                                  Rhythm: {piece.humanScore.hasIrregularRhythm ? 'Varied' : 'Monotone'}
                                </span>
                                <span className={cn('badge border', !piece.humanScore.hasHedgingLanguage ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : 'bg-red-950/50 text-red-400 border-red-800/50')}>
                                  Hedging: {piece.humanScore.hasHedgingLanguage ? 'Found' : 'Clean'}
                                </span>
                              </div>
                              {piece.humanScore.slopWordsFound.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {piece.humanScore.slopWordsFound.map((w, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded text-xs bg-red-950/30 text-red-400 border border-red-900/30 line-through">{w}</span>
                                  ))}
                                </div>
                              )}
                              {piece.humanScore.feedback.length > 0 && (
                                <div className="text-xs text-slate-500 space-y-1">
                                  {piece.humanScore.feedback.map((f, i) => <p key={i}>&bull; {f}</p>)}
                                </div>
                              )}
                            </div>
                          )}

                          {piece.aiReasoning && (
                            <div className="bg-indigo-950/20 border border-indigo-800/20 rounded-lg p-3 mt-2">
                              <p className="text-[10px] font-semibold text-indigo-400 uppercase mb-0.5">AI Reasoning</p>
                              <p className="text-xs text-slate-400 leading-relaxed">{piece.aiReasoning}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
                        <button onClick={() => handleCopy(piece.content, piece.platform)} className="btn-ghost text-xs gap-1.5">
                          {copiedPlatform === piece.platform ? <><Check size={12} className="text-emerald-400" /> Copied</> : <><Copy size={12} /> Copy</>}
                        </button>
                        <button onClick={() => { setEditContent(piece.content); setEditingPlatform(piece.platform); }} className="btn-ghost text-xs gap-1.5"><Edit3 size={12} /> Edit</button>
                        <button
                          onClick={() => {
                            const post = {
                              id: uuidv4(),
                              contentPieceId: piece.id,
                              projectId: project.id,
                              platform: piece.platform,
                              content: piece.content,
                              scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                              scheduledTime: '09:00',
                              status: 'scheduled' as const,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                            };
                            saveScheduledPost(post);
                            setScheduledPlatform(piece.platform);
                            setTimeout(() => setScheduledPlatform(null), 2000);
                          }}
                          className="btn-ghost text-xs gap-1.5"
                        >
                          {scheduledPlatform === piece.platform ? <><Check size={12} className="text-emerald-400" /> Scheduled</> : <><Calendar size={12} /> Schedule</>}
                        </button>
                        <button onClick={() => router.push(`/visuals?project=${project.id}`)} className="btn-ghost text-xs gap-1.5"><Image size={12} /> Visual</button>
                        <button onClick={() => setShowScoreDetail(showScoreDetail === piece.platform ? null : piece.platform)} className="btn-ghost text-xs gap-1.5 ml-auto">
                          <Sparkles size={12} /> {showScoreDetail === piece.platform ? 'Hide' : 'Score'} Details
                        </button>
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
