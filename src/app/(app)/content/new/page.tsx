'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { saveProject, getBrandVoice, getBrandProfile, trackCopy, trackDownload, saveUTMLinks, getUser } from '@/lib/storage';
import { getQualityBg, downloadAsZip, generateUTMForPiece } from '@/lib/utils';
import { ContentProject, ContentPiece, PLATFORMS, FRAMEWORK_LABELS, ContentFramework, MODEL_LABELS, AIModel, PLATFORM_CONTENT_TYPES } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import {
  ArrowLeft, Sparkles, RefreshCw, Download, Copy, Check,
  ChevronDown, ChevronUp, Edit3, Save, X, Loader2,
  FileText, AlertCircle, CheckCircle2, Bot, Info, Link2, Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
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

const SCORE_LABELS: Record<string, { label: string; description: string }> = {
  hookStrength: { label: 'Hook', description: 'Does it stop the scroll?' },
  specificity: { label: 'Specificity', description: 'Real numbers, real scenarios, not vague' },
  tacticalDepth: { label: 'Tactical Depth', description: 'Explains WHY, not just WHAT' },
  voiceMatch: { label: 'Voice Match', description: 'Sounds like you, not generic AI' },
  ctaClarity: { label: 'CTA', description: 'Next step is obvious' },
  platformOptimization: { label: 'Platform Fit', description: 'Formatted right for the platform' },
};

export default function CreateContentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<'input' | 'generating' | 'results'>('input');

  const [topic, setTopic] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [tonePreference, setTonePreference] = useState('Professional & Authoritative');
  const [targetAudience, setTargetAudience] = useState(user?.targetAudience || '');
  const [sourceType, setSourceType] = useState<'topic' | 'url' | 'notes'>('topic');
  const [sourceContent, setSourceContent] = useState('');

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [project, setProject] = useState<ContentProject | null>(null);

  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [showScoreDetail, setShowScoreDetail] = useState<string | null>(null);

  const TONES = [
    'Professional & Authoritative',
    'Conversational & Approachable',
    'Bold & Contrarian',
    'Educational & Detailed',
    'Inspirational & Motivational',
    'Data-Driven & Analytical',
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) { setError('Please enter a topic or content idea.'); return; }
    setError('');
    setStep('generating');
    setGenerating(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 12, 90));
    }, 1000);

    try {
      const brandVoice = getBrandVoice();
      const brandProfile = typeof window !== 'undefined' ? getBrandProfile() : null;
      const storedUser = getUser();
      const modelPref = storedUser?.modelPreference || 'auto';
      const utmBaseUrl = storedUser?.defaultUtmBaseUrl || storedUser?.websiteUrl || user?.websiteUrl || 'https://example.com';
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: sourceType === 'topic' ? topic : `${topic}\n\nSource content:\n${sourceContent}`,
          keyPoints,
          tonePreference,
          targetAudience,
          brandVoiceSummary: brandVoice.summary,
          businessProfile: brandVoice.businessProfile || {},
          brandIntelligence: brandProfile || null,
          platforms: ['twitter', 'linkedin', 'instagram', 'email', 'blog', 'youtube', 'video-script'],
          modelPreference: modelPref,
          baseUrl: utmBaseUrl,
        }),
      });

      clearInterval(progressInterval);
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Generation failed'); }

      const data = await response.json();
      setResults(data.results);
      setProgress(100);

      const pieces: ContentPiece[] = data.results.map((r: any) => ({
        id: uuidv4(),
        projectId: '',
        platform: r.platform,
        content: r.content,
        qualityScore: r.qualityScore,
        qualityBreakdown: r.qualityBreakdown || null,
        framework: r.framework || null,
        aiReasoning: r.aiReasoning || null,
        model: r.model || 'gpt-4.1-mini',
        utmLink: r.utmLink || null,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Save UTM links
      const utmLinksToSave = data.results.filter((r: any) => r.utmLink).map((r: any) => ({
        ...r.utmLink,
        projectId: '',
        pieceId: '',
        createdAt: new Date().toISOString(),
      }));
      if (utmLinksToSave.length > 0) saveUTMLinks(utmLinksToSave);

      const newProject: ContentProject = {
        id: uuidv4(), userId: user?.id || '', title: topic.slice(0, 100),
        topic, keyPoints, tonePreference, targetAudience, sourceType, sourceContent,
        pieces, status: 'complete',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      pieces.forEach(p => p.projectId = newProject.id);
      saveProject(newProject);
      setProject(newProject);
      setTimeout(() => setStep('results'), 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'Failed to generate content.');
      setStep('input');
    } finally { setGenerating(false); }
  };

  const handleRegenerate = async (platform: string) => {
    setEditingPlatform(null);
    setResults(prev => prev.map(r => r.platform === platform ? { ...r, content: '', status: 'loading' } : r));
    try {
      const brandVoice = getBrandVoice();
      const brandProfile = typeof window !== 'undefined' ? getBrandProfile() : null;
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic, keyPoints, tonePreference, targetAudience,
          brandVoiceSummary: brandVoice.summary,
          businessProfile: brandVoice.businessProfile || {},
          brandIntelligence: brandProfile || null,
          platforms: [platform],
        }),
      });
      const data = await response.json();
      const newResult = data.results[0];
      setResults(prev => prev.map(r => r.platform === platform ? newResult : r));
      if (project) {
        const updatedPieces = project.pieces.map(p => p.platform === platform ? { ...p, content: newResult.content, qualityScore: newResult.qualityScore, qualityBreakdown: newResult.qualityBreakdown, framework: newResult.framework, aiReasoning: newResult.aiReasoning, updatedAt: new Date().toISOString() } : p);
        const updatedProject = { ...project, pieces: updatedPieces, updatedAt: new Date().toISOString() };
        saveProject(updatedProject);
        setProject(updatedProject);
      }
    } catch {
      setResults(prev => prev.map(r => r.platform === platform ? { ...r, content: 'Error regenerating. Please try again.', status: 'error' } : r));
    }
  };

  const handleSaveEdit = (platform: string) => {
    setResults(prev => prev.map(r => r.platform === platform ? { ...r, content: editContent } : r));
    if (project) {
      const updatedPieces = project.pieces.map(p => p.platform === platform ? { ...p, content: editContent, updatedAt: new Date().toISOString() } : p);
      const updatedProject = { ...project, pieces: updatedPieces, updatedAt: new Date().toISOString() };
      saveProject(updatedProject);
      setProject(updatedProject);
    }
    setEditingPlatform(null);
  };

  const handleCopy = (content: string, platform: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPlatform(platform);
    trackCopy();
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleDownloadAll = () => {
    if (results.length > 0) {
      downloadAsZip(results.map(r => ({ platform: r.platform, content: r.content })), topic);
      trackDownload();
    }
  };

  // ─── Quality Score Breakdown Component ──────────────────────────
  const ScoreBreakdown = ({ breakdown, reasoning }: { breakdown: any; reasoning?: string }) => {
    if (!breakdown) return null;
    const dims = Object.entries(SCORE_LABELS);
    return (
      <div className="mt-3 bg-gray-50 rounded-xl p-4 space-y-3 animate-in fade-in duration-300">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quality Breakdown</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {dims.map(([key, meta]) => {
            const score = breakdown[key] || breakdown[key.replace(/([A-Z])/g, (m: string) => m)] || 7;
            return (
              <div key={key} className="bg-white rounded-lg p-2.5 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">{meta.label}</span>
                  <span className={cn('text-xs font-bold', score >= 8 ? 'text-emerald-600' : score >= 6 ? 'text-amber-600' : 'text-red-500')}>{score}/10</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-amber-500' : 'bg-red-400')} style={{ width: `${score * 10}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{meta.description}</p>
              </div>
            );
          })}
        </div>
        {breakdown.reasons && breakdown.reasons.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500">Scoring Notes</p>
            {breakdown.reasons.map((r: string, i: number) => (
              <p key={i} className="text-xs text-gray-500 flex items-start gap-1.5"><span className="text-gray-300 mt-px">-</span>{r}</p>
            ))}
          </div>
        )}
        {reasoning && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Bot className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-amber-700 uppercase mb-0.5">AI Reasoning</p>
                <p className="text-xs text-amber-800 leading-relaxed">{reasoning}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── INPUT STEP ─────────────────────────────────────────────────
  if (step === 'input') {
    const brandVoice = typeof window !== 'undefined' ? getBrandVoice() : null;
    const brandProfile = typeof window !== 'undefined' ? getBrandProfile() : null;
    const hasProfile = brandProfile || (brandVoice && brandVoice.summary);

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft size={16} /> Back to Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">Create New Content</h1>
          <p className="text-gray-500 mt-1">One input. Seven platform-optimized outputs. Powered by your business intelligence.</p>
        </div>

        {hasProfile && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Brand Intelligence Profile Active</p>
                <p className="text-xs text-blue-600 mt-0.5">Every piece uses your positioning, pain points, competitive wedge, transformation arc, and voice DNA.</p>
              </div>
            </div>
            {brandProfile && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {brandProfile.positioningStatement && <div className="bg-white/70 rounded-lg px-3 py-2"><p className="text-[10px] font-semibold text-blue-500 uppercase">Positioning</p><p className="text-xs text-gray-700 line-clamp-2">{brandProfile.positioningStatement.slice(0, 60)}...</p></div>}
                {brandProfile.competitiveWedge && <div className="bg-white/70 rounded-lg px-3 py-2"><p className="text-[10px] font-semibold text-blue-500 uppercase">Wedge</p><p className="text-xs text-gray-700 line-clamp-2">{brandProfile.competitiveWedge.slice(0, 60)}...</p></div>}
                {brandProfile.corePainPoints?.length > 0 && <div className="bg-white/70 rounded-lg px-3 py-2"><p className="text-[10px] font-semibold text-blue-500 uppercase">Pain Points</p><p className="text-xs text-gray-700">{brandProfile.corePainPoints.length} mapped</p></div>}
                {brandProfile.contentAngles?.length > 0 && <div className="bg-white/70 rounded-lg px-3 py-2"><p className="text-[10px] font-semibold text-blue-500 uppercase">Angles</p><p className="text-xs text-gray-700">{brandProfile.contentAngles.length} unlocked</p></div>}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-600">
              <AlertCircle size={18} /><span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Content Source</label>
            <div className="flex gap-2">
              {[{ key: 'topic', label: 'Topic / Idea' }, { key: 'url', label: 'Paste URL' }, { key: 'notes', label: 'Raw Notes' }].map(tab => (
                <button key={tab.key} onClick={() => setSourceType(tab.key as any)} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', sourceType === tab.key ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent')}>{tab.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {sourceType === 'topic' ? 'Topic or Content Idea' : sourceType === 'url' ? 'Topic (from URL)' : 'Topic (from Notes)'} <span className="text-red-400">*</span>
            </label>
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400" placeholder="e.g., Why most B2B companies waste 80% of their content budget" />
          </div>

          {sourceType !== 'topic' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{sourceType === 'url' ? 'URL' : 'Raw Notes'}</label>
              <textarea value={sourceContent} onChange={e => setSourceContent(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-gray-900 placeholder:text-gray-400 resize-none" rows={sourceType === 'url' ? 2 : 6} placeholder={sourceType === 'url' ? 'https://example.com/article' : 'Paste your raw notes, transcript, or any content here...'} />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Key Points <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea value={keyPoints} onChange={e => setKeyPoints(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-gray-900 placeholder:text-gray-400 resize-none" rows={3} placeholder="e.g., 1) The hidden cost of inconsistency  2) Why attribution matters  3) The compound effect" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tone Preference</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TONES.map(tone => (
                <button key={tone} onClick={() => setTonePreference(tone)} className={cn('px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left', tonePreference === tone ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')}>{tone}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400" placeholder="e.g., CEOs and founders of $3M-$50M B2B companies" />
          </div>

          <div className="pt-2">
            <button onClick={handleGenerate} disabled={generating || !topic.trim()} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-base">
              <Sparkles size={18} /> Generate 7 Platform Outputs
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">AI selects the best framework for each platform and uses your business context in every piece</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── GENERATING STEP ────────────────────────────────────────────
  if (step === 'generating') {
    return (
      <div className="max-w-xl mx-auto pt-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-8">
          <Sparkles size={32} className="text-white animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Content</h2>
        <p className="text-gray-500 mb-2">Creating 7 platform-optimized outputs with framework rotation...</p>
        <p className="text-xs text-gray-400 mb-8">Each platform gets the best-fit framework: PAS, Story+Lesson, Contrarian Take, and more</p>
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          <p className="text-sm text-gray-400 mt-2">{Math.round(progress)}% complete</p>
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {PLATFORMS.map((p, i) => {
            const done = progress > (i + 1) * 12;
            const Icon = platformIcons[p.key] || FileText;
            return (
              <div key={p.key} className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all', done ? 'text-blue-700 bg-blue-50' : 'text-gray-400 bg-gray-50')}>
                {done ? <CheckCircle2 size={14} className="text-blue-600" /> : <Loader2 size={14} className="animate-spin" />}
                <Icon size={14} /><span className="font-medium">{p.label.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── RESULTS STEP ───────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2"><ArrowLeft size={16} /> Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">Content Generated</h1>
          <p className="text-gray-500 mt-1">{results.length} outputs for: &ldquo;{topic.slice(0, 60)}{topic.length > 60 ? '...' : ''}&rdquo;</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownloadAll} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"><Download size={14} /> Download All</button>
          <Link href="/content/new" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all"><Sparkles size={14} /> Create More</Link>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((result) => {
          const Icon = platformIcons[result.platform] || FileText;
          const platformInfo = PLATFORMS.find(p => p.key === result.platform);
          const isExpanded = expandedPlatform === result.platform;
          const isEditing = editingPlatform === result.platform;
          const isLoading = result.status === 'loading';
          const frameworkLabel = result.framework ? FRAMEWORK_LABELS[result.framework as ContentFramework] : null;

          return (
            <div key={result.platform} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedPlatform(isExpanded ? null : result.platform)}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', platformColors[result.platform] || 'bg-gray-50 text-gray-600 border-gray-200')}><Icon size={18} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{platformInfo?.label || result.platform}</h3>
                    {frameworkLabel && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full hidden sm:inline">{frameworkLabel}</span>}
                    {result.model && MODEL_LABELS[result.model as AIModel] && (
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium hidden sm:inline-flex items-center gap-1', MODEL_LABELS[result.model as AIModel].color)}>
                        <Cpu size={8} />{MODEL_LABELS[result.model as AIModel].badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{result.content?.slice(0, 80)}...</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={e => { e.stopPropagation(); setShowScoreDetail(showScoreDetail === result.platform ? null : result.platform); setExpandedPlatform(result.platform); }} className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all', getQualityBg(result.qualityScore))}>
                    {result.qualityScore}/10
                    <Info size={10} className="opacity-50" />
                  </button>
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-600" /><span className="ml-3 text-sm text-gray-500">Regenerating with a different framework...</span></div>
                  ) : isEditing ? (
                    <div>
                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-gray-900 font-mono resize-none" rows={15} />
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => handleSaveEdit(result.platform)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all"><Save size={14} /> Save</button>
                        <button onClick={() => setEditingPlatform(null)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-all"><X size={14} /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans mb-4 max-h-[400px] overflow-y-auto">{result.content}</pre>

                      {(showScoreDetail === result.platform || result.aiReasoning) && (
                        <ScoreBreakdown breakdown={result.qualityBreakdown} reasoning={result.aiReasoning} />
                      )}

                      {/* UTM Link */}
                      {result.utmLink && (
                        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Link2 size={12} className="text-blue-600" />
                            <span className="text-[10px] font-semibold text-blue-700 uppercase">UTM Tracking Link</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-[11px] text-blue-800 bg-blue-100/50 px-2 py-1 rounded-lg truncate block flex-1 font-mono">{result.utmLink.fullUrl}</code>
                            <button onClick={(e) => { e.stopPropagation(); handleCopy(result.utmLink.fullUrl, result.platform + '-utm'); }} className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                              {copiedPlatform === result.platform + '-utm' ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy UTM</>}
                            </button>
                          </div>
                          <p className="text-[9px] text-blue-500 mt-1">Source: {result.utmLink.utmParams?.source} | Medium: {result.utmLink.utmParams?.medium} | Campaign: {result.utmLink.utmParams?.campaign}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-3">
                        <button onClick={() => handleCopy(result.content, result.platform)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                          {copiedPlatform === result.platform ? <><Check size={12} className="text-emerald-600" /> Copied</> : <><Copy size={12} /> Copy</>}
                        </button>
                        <button onClick={() => { setEditContent(result.content); setEditingPlatform(result.platform); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-all"><Edit3 size={12} /> Edit</button>
                        <button onClick={() => handleRegenerate(result.platform)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-all"><RefreshCw size={12} /> Regenerate</button>
                        <button onClick={e => { e.stopPropagation(); setShowScoreDetail(showScoreDetail === result.platform ? null : result.platform); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-all ml-auto"><Info size={12} /> {showScoreDetail === result.platform ? 'Hide' : 'Show'} Score Details</button>
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
