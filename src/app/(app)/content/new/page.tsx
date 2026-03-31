'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { saveProject, getBrandVoiceDNA, getContentExamples, getDefaultAudienceProfile, getAudienceProfiles, getBrandProfile, getBrandVoice, getUser, trackCopy, trackDownload, saveUTMLinks } from '@/lib/storage';
import { ContentProject, ContentPiece, Platform, PLATFORMS, CreatorFramework, CREATOR_FRAMEWORK_LABELS, AudienceProfile } from '@/types';
import { PenTool, Loader2, Zap, Users, BookOpen, Mic2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function NewContentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['linkedin', 'twitter', 'email']);
  const [framework, setFramework] = useState<CreatorFramework>('auto');
  const [customFramework, setCustomFramework] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audienceProfiles, setAudienceProfiles] = useState<AudienceProfile[]>([]);
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>('');
  const [contextStatus, setContextStatus] = useState({ voiceDNA: false, examples: 0, audience: false, brandProfile: false });

  useEffect(() => {
    const voiceDNA = getBrandVoiceDNA();
    const examples = getContentExamples();
    const audience = getDefaultAudienceProfile();
    const brandProfile = getBrandProfile();
    const profiles = getAudienceProfiles();
    setAudienceProfiles(profiles);
    if (audience) setSelectedAudienceId(audience.id);
    setContextStatus({
      voiceDNA: !!voiceDNA?.brandName,
      examples: examples.length,
      audience: !!audience,
      brandProfile: !!brandProfile,
    });
  }, []);

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) { setError('Enter a topic or idea.'); return; }
    if (selectedPlatforms.length === 0) { setError('Select at least one platform.'); return; }
    setLoading(true);
    setError('');

    try {
      const voiceDNA = getBrandVoiceDNA();
      const examples = getContentExamples();
      const audience = audienceProfiles.find(p => p.id === selectedAudienceId) || getDefaultAudienceProfile();
      const brandProfile = getBrandProfile();
      const brandVoice = getBrandVoice();
      const storedUser = getUser();

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          keyPoints,
          platforms: selectedPlatforms,
          creatorFramework: framework,
          customFramework: framework === 'custom' ? customFramework : undefined,
          voiceDNA,
          examples: examples.slice(0, 5),
          audienceProfile: audience,
          brandProfile,
          brandIntelligence: brandProfile,
          brandVoiceSummary: brandVoice?.summary,
          modelPreference: storedUser?.modelPreference || 'auto',
          baseUrl: storedUser?.defaultUtmBaseUrl || storedUser?.websiteUrl || 'https://example.com',
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const pieces: ContentPiece[] = (data.results || []).map((r: any) => ({
        id: r.utmLink?.id || uuidv4(),
        projectId: '',
        platform: r.platform,
        content: r.content,
        qualityScore: r.qualityScore,
        qualityBreakdown: r.qualityBreakdown || null,
        humanScore: r.humanScore || null,
        framework: r.framework || null,
        creatorFramework: framework,
        aiReasoning: r.aiReasoning || null,
        model: r.model || 'gpt-4.1-mini',
        utmLink: r.utmLink || null,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const utmLinksToSave = data.results?.filter((r: any) => r.utmLink).map((r: any) => ({
        ...r.utmLink, projectId: '', pieceId: '', createdAt: new Date().toISOString(),
      })) || [];
      if (utmLinksToSave.length > 0) saveUTMLinks(utmLinksToSave);

      const project: ContentProject = {
        id: uuidv4(),
        userId: user?.id || 'current',
        title: topic.slice(0, 80),
        topic,
        keyPoints,
        tonePreference: '',
        targetAudience: audience?.name || '',
        sourceType: 'topic',
        sourceContent: topic,
        pieces,
        strategicBrief: data.strategicBrief,
        audienceProfileId: selectedAudienceId,
        creatorFramework: framework,
        status: 'complete',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      pieces.forEach(p => p.projectId = project.id);
      saveProject(project);
      router.push(`/content/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Generation failed. Try again.');
    }
    setLoading(false);
  };

  const contextScore = [contextStatus.voiceDNA, contextStatus.examples >= 3, contextStatus.audience, contextStatus.brandProfile].filter(Boolean).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          Create Content
        </h1>
        <p className="text-slate-500 mt-2">Your brand voice, audience, and examples are injected into every prompt automatically.</p>
      </div>

      {/* Context Status Bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-300">Context Engine Status</p>
          <span className={cn('badge border', contextScore >= 3 ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : contextScore >= 2 ? 'bg-amber-950/50 text-amber-400 border-amber-800/50' : 'bg-red-950/50 text-red-400 border-red-800/50')}>
            {contextScore}/4 sources active
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className={cn('rounded-lg p-2.5 text-center border', contextStatus.voiceDNA ? 'bg-emerald-950/20 border-emerald-800/20' : 'bg-white/[0.02] border-white/[0.04]')}>
            <Mic2 size={14} className={cn('mx-auto mb-1', contextStatus.voiceDNA ? 'text-emerald-400' : 'text-slate-700')} />
            <p className={cn('text-xs', contextStatus.voiceDNA ? 'text-emerald-400' : 'text-slate-700')}>Voice DNA</p>
          </div>
          <div className={cn('rounded-lg p-2.5 text-center border', contextStatus.examples >= 3 ? 'bg-emerald-950/20 border-emerald-800/20' : 'bg-white/[0.02] border-white/[0.04]')}>
            <BookOpen size={14} className={cn('mx-auto mb-1', contextStatus.examples >= 3 ? 'text-emerald-400' : 'text-slate-700')} />
            <p className={cn('text-xs', contextStatus.examples >= 3 ? 'text-emerald-400' : 'text-slate-700')}>{contextStatus.examples} Examples</p>
          </div>
          <div className={cn('rounded-lg p-2.5 text-center border', contextStatus.audience ? 'bg-emerald-950/20 border-emerald-800/20' : 'bg-white/[0.02] border-white/[0.04]')}>
            <Users size={14} className={cn('mx-auto mb-1', contextStatus.audience ? 'text-emerald-400' : 'text-slate-700')} />
            <p className={cn('text-xs', contextStatus.audience ? 'text-emerald-400' : 'text-slate-700')}>Audience</p>
          </div>
          <div className={cn('rounded-lg p-2.5 text-center border', contextStatus.brandProfile ? 'bg-emerald-950/20 border-emerald-800/20' : 'bg-white/[0.02] border-white/[0.04]')}>
            <Zap size={14} className={cn('mx-auto mb-1', contextStatus.brandProfile ? 'text-emerald-400' : 'text-slate-700')} />
            <p className={cn('text-xs', contextStatus.brandProfile ? 'text-emerald-400' : 'text-slate-700')}>Brand Profile</p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="card p-6 space-y-5">
        <div>
          <label className="label">Topic or Idea</label>
          <textarea value={topic} onChange={e => setTopic(e.target.value)} className="textarea-field" rows={3} placeholder="What do you want to create content about? Be specific. The more context you give, the better the output." />
        </div>

        <div>
          <label className="label">Key Points (optional)</label>
          <textarea value={keyPoints} onChange={e => setKeyPoints(e.target.value)} className="textarea-field" rows={2} placeholder="Any specific points, data, stories, or angles you want included..." />
        </div>

        {/* Audience Profile */}
        {audienceProfiles.length > 0 && (
          <div>
            <label className="label">Target Audience</label>
            <select value={selectedAudienceId} onChange={e => setSelectedAudienceId(e.target.value)} className="select-field">
              {audienceProfiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}{p.isDefault ? ' (default)' : ''}</option>
              ))}
            </select>
          </div>
        )}

        {/* Creator Framework */}
        <div>
          <label className="label">Creator Framework</label>
          <select value={framework} onChange={e => setFramework(e.target.value as CreatorFramework)} className="select-field">
            {(Object.keys(CREATOR_FRAMEWORK_LABELS) as CreatorFramework[]).map(key => (
              <option key={key} value={key}>{CREATOR_FRAMEWORK_LABELS[key].name}</option>
            ))}
          </select>
          <p className="text-xs text-slate-600 mt-1">{CREATOR_FRAMEWORK_LABELS[framework].description}</p>
          {framework === 'custom' && (
            <textarea value={customFramework} onChange={e => setCustomFramework(e.target.value)} className="textarea-field mt-2" rows={3} placeholder="Describe your custom framework structure..." />
          )}
        </div>

        {/* Platforms */}
        <div>
          <label className="label">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <button key={p.key} onClick={() => togglePlatform(p.key)} className={cn('px-4 py-2.5 rounded-xl text-sm font-medium transition-all border', selectedPlatforms.includes(p.key) ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'text-slate-600 border-white/[0.06] hover:text-slate-400 hover:border-white/[0.1]')}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/50 text-red-400 text-sm border border-red-900/50">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full gap-2 py-4 text-base">
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Generating with Anti-Slop Engine...</>
          ) : (
            <><Zap size={18} /> Generate Content</>
          )}
        </button>
      </div>
    </div>
  );
}
