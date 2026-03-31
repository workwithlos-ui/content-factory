'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { getProjects, getBrandVoiceDNA, getVisualAssets, saveVisualAsset, deleteVisualAsset } from '@/lib/storage';
import { ContentProject, VisualType, VISUAL_TYPE_INFO, VisualAsset, BrandVoiceDNA } from '@/types';
import { generateVisual, VisualConfig } from '@/lib/visual-generator';
import { cn } from '@/lib/utils';
import {
  Image as ImageIcon, Download, Trash2, Eye, Palette, Type, ChevronDown, ChevronUp,
  Sparkles, Loader2, RefreshCw, Settings2, X, Check, Layout, Layers
} from 'lucide-react';

const DEFAULT_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  background: '#0f0f1a',
  text: '#e2e8f0',
};

const VISUAL_TYPES: { key: VisualType; icon: React.ReactNode }[] = [
  { key: 'linkedin-carousel', icon: <Layers size={16} /> },
  { key: 'twitter-header', icon: <Layout size={16} /> },
  { key: 'instagram-story', icon: <ImageIcon size={16} /> },
  { key: 'quote-card', icon: <Type size={16} /> },
  { key: 'blog-featured', icon: <ImageIcon size={16} /> },
];

function extractKeyPoints(content: string): string[] {
  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20 && s.length < 200);
  // Prefer sentences with numbers, strong verbs, or short punchy statements
  const scored = sentences.map(s => ({
    text: s,
    score: (s.match(/\d/) ? 2 : 0) + (s.length < 80 ? 1 : 0) + (s.startsWith('The') || s.startsWith('Most') || s.startsWith('Stop') ? 1 : 0),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 8).map(s => s.text);
}

function extractStrongestLine(content: string): string {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 10 && l.length < 150);
  // First line is often the hook
  return lines[0] || content.slice(0, 100);
}

export default function VisualsPage() {
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [assets, setAssets] = useState<VisualAsset[]>([]);
  const [brandDNA, setBrandDNA] = useState<BrandVoiceDNA | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedPieceIdx, setSelectedPieceIdx] = useState<number>(0);
  const [selectedVisualType, setSelectedVisualType] = useState<VisualType>('quote-card');
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // For carousel
  const [showCustomize, setShowCustomize] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<VisualAsset | null>(null);

  // Customization state
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [cta, setCta] = useState('');
  const [colors, setColors] = useState(DEFAULT_COLORS);

  useEffect(() => {
    setProjects(getProjects());
    setAssets(getVisualAssets());
    const dna = getBrandVoiceDNA();
    setBrandDNA(dna);
    if (dna?.brandName) {
      // Try to extract brand colors from voice descriptors or use defaults
      setColors(DEFAULT_COLORS);
    }
  }, []);

  const currentProject = projects.find(p => p.id === selectedProject);
  const currentPiece = currentProject?.pieces[selectedPieceIdx];

  const handleSelectProject = (projId: string) => {
    setSelectedProject(projId);
    setSelectedPieceIdx(0);
    const proj = projects.find(p => p.id === projId);
    if (proj && proj.pieces[0]) {
      prefillFromContent(proj.pieces[0].content);
    }
  };

  const prefillFromContent = (content: string) => {
    const strongest = extractStrongestLine(content);
    setHeadline(strongest);
    const points = extractKeyPoints(content);
    setBody(points.slice(1, 3).join('. '));
    setCta('Learn More');
  };

  const handleGenerate = () => {
    if (!headline.trim()) return;
    setGenerating(true);

    setTimeout(() => {
      const config: VisualConfig = {
        type: selectedVisualType,
        headline,
        body: body || undefined,
        cta: cta || undefined,
        brandName: brandDNA?.brandName || 'Brand',
        colors,
        slides: selectedVisualType === 'linkedin-carousel' ? generateCarouselSlides() : undefined,
      };

      const result = generateVisual(config);

      if (Array.isArray(result)) {
        setPreviewUrls(result);
        setPreviewUrl(result[0] || null);
      } else {
        setPreviewUrl(result);
        setPreviewUrls([]);
      }

      setGenerating(false);
    }, 500);
  };

  const generateCarouselSlides = () => {
    const content = currentPiece?.content || headline;
    const points = extractKeyPoints(content);
    const slides: { headline: string; body: string }[] = [];

    // Hook slide
    slides.push({ headline: headline || extractStrongestLine(content), body: '' });

    // Content slides
    points.slice(0, 5).forEach((point, i) => {
      slides.push({
        headline: `Point ${i + 1}`,
        body: point,
      });
    });

    // CTA slide
    slides.push({ headline: cta || 'Ready to take action?', body: 'Follow for more' });

    return slides;
  };

  const handleSaveAsset = () => {
    if (!previewUrl) return;
    const dataUrls = previewUrls.length > 0 ? previewUrls : [previewUrl];

    dataUrls.forEach((url, idx) => {
      const asset: VisualAsset = {
        id: uuidv4(),
        type: selectedVisualType,
        contentPieceId: currentPiece?.id,
        projectId: currentProject?.id,
        dataUrl: url,
        textContent: {
          headline,
          body: body || undefined,
          cta: cta || undefined,
        },
        brandColors: colors,
        createdAt: new Date().toISOString(),
      };
      saveVisualAsset(asset);
    });

    setAssets(getVisualAssets());
  };

  const handleDownload = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  };

  const handleDeleteAsset = (id: string) => {
    deleteVisualAsset(id);
    setAssets(getVisualAssets());
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-violet-400" />
            </div>
            Visual Asset Generator
          </h1>
          <p className="text-slate-500 mt-1">Create branded visuals from your content — carousels, quote cards, headers, and more.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel — Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Source Content */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Source Content</h3>

            {projects.length > 0 ? (
              <div>
                <label className="label">Select Content</label>
                <select value={selectedProject} onChange={e => handleSelectProject(e.target.value)} className="select-field text-sm">
                  <option value="">Choose a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title.slice(0, 50)}</option>
                  ))}
                </select>
                {currentProject && currentProject.pieces.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentProject.pieces.map((piece, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedPieceIdx(idx); prefillFromContent(piece.content); }}
                        className={cn('px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all', selectedPieceIdx === idx ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'text-slate-600 border-white/[0.06] hover:text-slate-400')}
                      >
                        {piece.platform}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-500 mb-2">No content yet. Generate content first or type below.</p>
                <Link href="/content/new" className="text-xs text-indigo-400 hover:text-indigo-300">Create Content</Link>
              </div>
            )}
          </div>

          {/* Visual Type */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Visual Type</h3>
            <div className="space-y-1.5">
              {VISUAL_TYPES.map(vt => {
                const info = VISUAL_TYPE_INFO[vt.key];
                return (
                  <button
                    key={vt.key}
                    onClick={() => setSelectedVisualType(vt.key)}
                    className={cn('w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left', selectedVisualType === vt.key ? 'bg-indigo-500/10 border-indigo-500/30' : 'border-white/[0.06] hover:border-white/[0.12]')}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', selectedVisualType === vt.key ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/[0.04] text-slate-600')}>
                      {vt.icon}
                    </div>
                    <div>
                      <p className={cn('text-sm font-medium', selectedVisualType === vt.key ? 'text-indigo-300' : 'text-slate-300')}>{info.label}</p>
                      <p className="text-[10px] text-slate-600">{info.width}x{info.height}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Customization */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Customize Text</h3>
              <button onClick={() => setShowCustomize(!showCustomize)} className="text-xs text-indigo-400">
                {showCustomize ? 'Collapse' : 'Expand'}
              </button>
            </div>

            <div>
              <label className="label">Headline</label>
              <textarea value={headline} onChange={e => setHeadline(e.target.value)} className="textarea-field text-sm" rows={2} placeholder="The main text for your visual..." />
            </div>

            {showCustomize && (
              <>
                <div>
                  <label className="label">Body Text</label>
                  <textarea value={body} onChange={e => setBody(e.target.value)} className="textarea-field text-sm" rows={2} placeholder="Supporting text..." />
                </div>
                <div>
                  <label className="label">CTA Text</label>
                  <input value={cta} onChange={e => setCta(e.target.value)} className="input-field text-sm" placeholder="e.g., Follow for more" />
                </div>
              </>
            )}
          </div>

          {/* Color Customization */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Palette size={14} className="text-violet-400" /> Brand Colors</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'primary', label: 'Primary' },
                { key: 'secondary', label: 'Secondary' },
                { key: 'background', label: 'Background' },
                { key: 'text', label: 'Text' },
              ].map(c => (
                <div key={c.key}>
                  <label className="text-[10px] text-slate-500 mb-1 block">{c.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(colors as any)[c.key]}
                      onChange={e => setColors(prev => ({ ...prev, [c.key]: e.target.value }))}
                      className="w-8 h-8 rounded-lg border border-white/[0.08] cursor-pointer bg-transparent"
                    />
                    <input
                      value={(colors as any)[c.key]}
                      onChange={e => setColors(prev => ({ ...prev, [c.key]: e.target.value }))}
                      className="input-field text-xs flex-1 py-1.5"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setColors({ primary: '#6366f1', secondary: '#8b5cf6', background: '#0f0f1a', text: '#e2e8f0' })} className="btn-ghost text-[10px]">Dark Theme</button>
              <button onClick={() => setColors({ primary: '#2563eb', secondary: '#3b82f6', background: '#ffffff', text: '#1e293b' })} className="btn-ghost text-[10px]">Light Theme</button>
              <button onClick={() => setColors({ primary: '#f59e0b', secondary: '#ef4444', background: '#1a1a2e', text: '#fef3c7' })} className="btn-ghost text-[10px]">Warm Dark</button>
            </div>
          </div>

          {/* Generate Button */}
          <button onClick={handleGenerate} disabled={generating || !headline.trim()} className="btn-primary w-full gap-2 py-4">
            {generating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Visual</>}
          </button>
        </div>

        {/* Right Panel — Preview & Library */}
        <div className="lg:col-span-3 space-y-4">
          {/* Preview */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Preview</h3>
              {previewUrl && (
                <div className="flex items-center gap-2">
                  <button onClick={handleSaveAsset} className="btn-ghost text-xs gap-1.5 text-emerald-400">
                    <Check size={12} /> Save to Library
                  </button>
                  <button onClick={() => handleDownload(previewUrl, `${selectedVisualType}-${Date.now()}.png`)} className="btn-ghost text-xs gap-1.5">
                    <Download size={12} /> Download PNG
                  </button>
                </div>
              )}
            </div>

            {previewUrl ? (
              <div className="flex justify-center">
                <div className="relative max-w-full overflow-hidden rounded-xl border border-white/[0.08]">
                  <img src={previewUrl} alt="Visual preview" className="max-w-full h-auto max-h-[600px] object-contain" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-white/[0.02] rounded-xl border border-dashed border-white/[0.08]">
                <div className="text-center">
                  <ImageIcon className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Select content and click "Generate Visual"</p>
                  <p className="text-xs text-slate-600 mt-1">Your branded visual will appear here</p>
                </div>
              </div>
            )}

            {/* Carousel slide navigation */}
            {previewUrls.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
                {previewUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPreviewUrl(url)}
                    className={cn('flex-shrink-0 w-16 h-16 rounded-lg border overflow-hidden transition-all', previewUrl === url ? 'border-indigo-500/50 ring-2 ring-indigo-500/20' : 'border-white/[0.08] opacity-60 hover:opacity-100')}
                  >
                    <img src={url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Saved Assets Library */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
              <h3 className="font-bold text-white">Visual Library</h3>
              <span className="text-xs text-slate-500">{assets.length} asset{assets.length !== 1 ? 's' : ''}</span>
            </div>

            {assets.length === 0 ? (
              <div className="p-10 text-center">
                <ImageIcon className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No visuals saved yet. Generate and save your first visual above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
                {assets.map(asset => (
                  <div key={asset.id} className="group relative rounded-xl border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-all">
                    <img src={asset.dataUrl} alt={asset.textContent.headline} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => setViewingAsset(asset)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"><Eye size={14} /></button>
                      <button onClick={() => handleDownload(asset.dataUrl, `${asset.type}-${asset.id.slice(0, 8)}.png`)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"><Download size={14} /></button>
                      <button onClick={() => handleDeleteAsset(asset.id)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-red-400"><Trash2 size={14} /></button>
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] text-slate-500">{VISUAL_TYPE_INFO[asset.type]?.label}</p>
                      <p className="text-xs text-slate-400 truncate">{asset.textContent.headline.slice(0, 40)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-size Asset Viewer Modal */}
      {viewingAsset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewingAsset(null)}>
          <div className="max-w-4xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-300">{VISUAL_TYPE_INFO[viewingAsset.type]?.label}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownload(viewingAsset.dataUrl, `${viewingAsset.type}.png`)} className="btn-ghost text-xs gap-1.5"><Download size={12} /> Download</button>
                <button onClick={() => setViewingAsset(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X size={18} /></button>
              </div>
            </div>
            <img src={viewingAsset.dataUrl} alt={viewingAsset.textContent.headline} className="max-w-full h-auto rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
