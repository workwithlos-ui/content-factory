'use client';

import { useState, useEffect } from 'react';
import { getProjects, saveProject, getBrandVoiceDNA, getContentExamples, getDefaultAudienceProfile, getBrandProfile } from '@/lib/storage';
import { ContentProject, ContentPiece, Platform, PLATFORMS, CreatorFramework, CREATOR_FRAMEWORK_LABELS } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Shuffle, Loader2, Copy, Check, ChevronDown, PenTool } from 'lucide-react';
import { platformIcons, platformColors } from '@/lib/platform-icons';
import { cn } from '@/lib/utils';

type RemixSource = 'existing' | 'paste';

export default function RemixPage() {
  const [source, setSource] = useState<RemixSource>('paste');
  const [pastedContent, setPastedContent] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedPieceId, setSelectedPieceId] = useState('');
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [targetPlatforms, setTargetPlatforms] = useState<Platform[]>(['linkedin', 'twitter', 'instagram', 'email']);
  const [framework, setFramework] = useState<CreatorFramework>('auto');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ContentPiece[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { setProjects(getProjects()); }, []);

  const getSourceContent = (): string => {
    if (source === 'paste') return pastedContent;
    const project = projects.find(p => p.id === selectedProjectId);
    const piece = project?.pieces.find(p => p.id === selectedPieceId);
    return piece?.content || '';
  };

  const handleRemix = async () => {
    const content = getSourceContent();
    if (!content.trim()) return;
    setLoading(true);
    setResults([]);

    try {
      const voiceDNA = getBrandVoiceDNA();
      const examples = getContentExamples();
      const audience = getDefaultAudienceProfile();
      const brandProfile = getBrandProfile();

      const res = await fetch('/api/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceContent: content,
          targetPlatforms,
          creatorFramework: framework,
          voiceDNA,
          examples: examples.slice(0, 5),
          audienceProfile: audience,
          brandProfile,
        }),
      });

      const data = await res.json();
      if (data.results) {
        setResults(data.results);
        // Save as a project
        const project: ContentProject = {
          id: uuidv4(),
          userId: 'current',
          title: `Remix: ${content.slice(0, 50)}...`,
          topic: content.slice(0, 100),
          keyPoints: '',
          tonePreference: '',
          targetAudience: '',
          sourceType: 'remix',
          sourceContent: content,
          pieces: data.results,
          creatorFramework: framework,
          status: 'complete',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveProject(project);
      }
    } catch (err) {
      console.error('Remix failed:', err);
    }
    setLoading(false);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const togglePlatform = (p: Platform) => {
    setTargetPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-700/30 flex items-center justify-center">
            <Shuffle className="w-5 h-5 text-cyan-400" />
          </div>
          Content Remix Engine
        </h1>
        <p className="text-slate-500 mt-2">Take one piece of content and remix it for every platform. Each remix uses the platform-specific engine.</p>
      </div>

      <div className="card p-6 space-y-5">
        {/* Source Selection */}
        <div className="flex gap-3">
          <button onClick={() => setSource('paste')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all border', source === 'paste' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}>
            Paste Content
          </button>
          <button onClick={() => setSource('existing')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all border', source === 'existing' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}>
            From Library
          </button>
        </div>

        {source === 'paste' ? (
          <div>
            <label className="label">Source Content</label>
            <textarea value={pastedContent} onChange={e => setPastedContent(e.target.value)} className="textarea-field" rows={8} placeholder="Paste a blog post, LinkedIn post, newsletter, or any content you want to remix for other platforms..." />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Select Project</label>
              <select value={selectedProjectId} onChange={e => { setSelectedProjectId(e.target.value); setSelectedPieceId(''); }} className="select-field">
                <option value="">Choose a project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Select Piece</label>
              <select value={selectedPieceId} onChange={e => setSelectedPieceId(e.target.value)} className="select-field">
                <option value="">Choose a piece...</option>
                {projects.find(p => p.id === selectedProjectId)?.pieces.map(piece => (
                  <option key={piece.id} value={piece.id}>{piece.platform} - {piece.content.slice(0, 50)}...</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Target Platforms */}
        <div>
          <label className="label">Remix To</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <button key={p.key} onClick={() => togglePlatform(p.key)} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2', targetPlatforms.includes(p.key) ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'text-slate-600 border-white/[0.06] hover:text-slate-400')}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Framework */}
        <div>
          <label className="label">Creator Framework</label>
          <select value={framework} onChange={e => setFramework(e.target.value as CreatorFramework)} className="select-field">
            {(Object.keys(CREATOR_FRAMEWORK_LABELS) as CreatorFramework[]).map(key => (
              <option key={key} value={key}>{CREATOR_FRAMEWORK_LABELS[key].name}</option>
            ))}
          </select>
          <p className="text-xs text-slate-600 mt-1">{CREATOR_FRAMEWORK_LABELS[framework].description}</p>
        </div>

        <button onClick={handleRemix} disabled={loading || !getSourceContent().trim()} className="btn-primary gap-2 w-full">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Remixing...</> : <><Shuffle size={16} /> Remix Content</>}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Remixed Content</h2>
          {results.map(piece => {
            const Icon = platformIcons[piece.platform] || PenTool;
            const colorClass = platformColors[piece.platform] || '';
            return (
              <div key={piece.id} className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn('badge border', colorClass)}><Icon size={12} className="mr-1" /> {piece.platform}</span>
                    {piece.humanScore && (
                      <span className={cn('badge border', piece.humanScore.overall >= 7 ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : 'bg-amber-950/50 text-amber-400 border-amber-800/50')}>
                        Human Score: {piece.humanScore.overall}/10
                      </span>
                    )}
                  </div>
                  <button onClick={() => handleCopy(piece.id, piece.content)} className="btn-ghost text-xs gap-1">
                    {copied === piece.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-white/[0.02] rounded-lg p-4 border border-white/[0.04]">
                  {piece.content}
                </div>
                {piece.humanScore && piece.humanScore.feedback.length > 0 && (
                  <div className="text-xs text-slate-500 space-y-1">
                    {piece.humanScore.feedback.map((f, i) => <p key={i}>&bull; {f}</p>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
