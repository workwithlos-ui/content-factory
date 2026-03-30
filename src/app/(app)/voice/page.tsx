'use client';

import { useState, useEffect } from 'react';
import { getBrandVoice, getVoiceSamples, addVoiceSample, updateBrandVoice, removeVoiceSample, getBrandProfile, saveBrandProfile } from '@/lib/storage';
import { BrandVoice, VoiceSample, BrandIntelligenceProfile } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import {
  Mic2, Plus, Trash2, Save, Sparkles, RefreshCw,
  Volume2, BookOpen, MessageSquare, Lightbulb,
  Check, AlertCircle, Brain, Loader2, Target,
  Shield, Zap, Users, ArrowRight, Eye, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function VoicePage() {
  const [voice, setVoice] = useState<BrandVoice | null>(null);
  const [profile, setProfile] = useState<BrandIntelligenceProfile | null>(null);
  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [newSample, setNewSample] = useState('');
  const [newSampleSource, setNewSampleSource] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setVoice(getBrandVoice());
    setSamples(getVoiceSamples());
    setProfile(getBrandProfile());
  }, []);

  const handleAddSample = () => {
    if (!newSample.trim()) return;
    addVoiceSample(newSample, newSampleSource || 'Manual entry');
    setSamples(getVoiceSamples());
    setNewSample('');
    setNewSampleSource('');
    setShowAddForm(false);
  };

  const handleDeleteSample = (id: string) => {
    removeVoiceSample(id);
    setSamples(prev => prev.filter(s => s.id !== id));
  };

  const handleReanalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          samples: samples.map(s => s.content),
          existingProfile: profile,
        }),
      });
      const data = await res.json();
      if (data.voiceDNA) {
        const updatedVoice: BrandVoice = {
          samples: voice?.samples || [],
          summary: data.voiceDNA.summary || voice?.summary || '',
          characteristics: {
            tone: data.voiceDNA.openingPatterns || voice?.characteristics?.tone || [],
            vocabulary: [data.voiceDNA.vocabularyLevel || 'Conversational'],
            sentenceStructure: [data.voiceDNA.sentenceStructure || 'Varied'],
            frameworks: data.voiceDNA.signatureMoves || voice?.characteristics?.frameworks || [],
          },
          voiceConfidence: data.voiceDNA.confidence || 80,
          updatedAt: new Date().toISOString(),
        };
        updateBrandVoice(updatedVoice);
        setVoice(updatedVoice);

        if (profile) {
          const updatedProfile = { ...profile, voiceDNA: data.voiceDNA, updatedAt: new Date().toISOString() };
          saveBrandProfile(updatedProfile);
          setProfile(updatedProfile);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    }
    setAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brand Voice Engine</h1>
          <p className="text-gray-500 mt-1">Your AI-powered voice profile. Every piece of content uses this.</p>
        </div>
        <button
          onClick={handleReanalyze}
          disabled={analyzing || samples.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 text-sm"
        >
          {analyzing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
          ) : saved ? (
            <><Check className="w-4 h-4" /> Voice Updated</>
          ) : (
            <><Brain className="w-4 h-4" /> Re-Analyze Voice</>
          )}
        </button>
      </div>

      {/* Brand Intelligence Profile Card */}
      {profile && (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 rounded-2xl border border-blue-100 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Brand Intelligence Profile</h2>
              <p className="text-xs text-gray-500">Built from your onboarding answers &middot; Used in every generation</p>
            </div>
            {voice?.voiceConfidence && (
              <span className="ml-auto text-sm font-semibold text-blue-600">{voice.voiceConfidence}% confidence</span>
            )}
          </div>

          {/* Positioning */}
          {profile.positioningStatement && (
            <div className="bg-white/70 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Positioning Statement</p>
              <p className="text-sm text-gray-700 leading-relaxed">{profile.positioningStatement}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {/* Competitive Wedge */}
            {profile.competitiveWedge && (
              <div className="bg-white/70 rounded-xl p-4">
                <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-1">Competitive Wedge</p>
                <p className="text-sm text-gray-700 leading-relaxed">{profile.competitiveWedge}</p>
              </div>
            )}

            {/* Transformation Arc */}
            {profile.transformationArc && (
              <div className="bg-white/70 rounded-xl p-4">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Transformation Arc</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-semibold text-red-500 uppercase">Before</p>
                    <p className="text-xs text-gray-600">{profile.transformationArc.before}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-emerald-500 uppercase">After</p>
                    <p className="text-xs text-gray-600">{profile.transformationArc.after}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pain Points */}
          {profile.corePainPoints && profile.corePainPoints.length > 0 && (
            <div className="bg-white/70 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Customer Pain Points</p>
              <div className="flex flex-wrap gap-2">
                {profile.corePainPoints.map((p, i) => (
                  <span key={i} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Content Angles */}
          {profile.contentAngles && profile.contentAngles.length > 0 && (
            <div className="bg-white/70 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Content Angles ({profile.contentAngles.length})</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {profile.contentAngles.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Objection Map */}
          {profile.objectionMap && profile.objectionMap.length > 0 && (
            <div className="bg-white/70 rounded-xl p-4">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Objection Map</p>
              <div className="space-y-2">
                {profile.objectionMap.map((item: { objection: string; reframe: string }, i: number) => (
                  <div key={i} className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-red-50 rounded-lg p-2 text-red-700"><strong>Objection:</strong> {item.objection}</div>
                    <div className="bg-emerald-50 rounded-lg p-2 text-emerald-700"><strong>Response:</strong> {item.reframe}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voice DNA Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Mic2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Voice DNA</h2>
            <p className="text-xs text-gray-500">
              {voice?.updatedAt ? `Last updated ${formatRelativeTime(voice.updatedAt)}` : 'Not yet analyzed'}
            </p>
          </div>
        </div>

        {voice?.summary ? (
          <p className="text-sm text-gray-600 leading-relaxed mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
            {voice.summary}
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-6">
            Add content samples below and click &ldquo;Re-Analyze Voice&rdquo; to generate your voice profile.
          </p>
        )}

        {/* Voice DNA Details */}
        {profile?.voiceDNA && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {profile.voiceDNA.energySignature && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Energy Signature</p>
                <p className="text-sm text-gray-700">{profile.voiceDNA.energySignature}</p>
              </div>
            )}
            {profile.voiceDNA.vocabularyLevel && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Vocabulary Level</p>
                <p className="text-sm text-gray-700">{profile.voiceDNA.vocabularyLevel}</p>
              </div>
            )}
            {profile.voiceDNA.sentenceStructure && (
              <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-1">Sentence Structure</p>
                <p className="text-sm text-gray-700">{profile.voiceDNA.sentenceStructure}</p>
              </div>
            )}
          </div>
        )}

        {/* Legacy Characteristics Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tone', icon: Volume2, items: voice?.characteristics?.tone || [], color: 'text-blue-600 bg-blue-50' },
            { label: 'Vocabulary', icon: BookOpen, items: voice?.characteristics?.vocabulary || [], color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Structure', icon: MessageSquare, items: voice?.characteristics?.sentenceStructure || [], color: 'text-violet-600 bg-violet-50' },
            { label: 'Frameworks', icon: Lightbulb, items: voice?.characteristics?.frameworks || [], color: 'text-amber-600 bg-amber-50' },
          ].map((cat, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', cat.color)}>
                  <cat.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">{cat.label}</span>
              </div>
              <div className="space-y-1.5">
                {cat.items.length > 0 ? cat.items.map((item, j) => (
                  <div key={j} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {item}
                  </div>
                )) : (
                  <p className="text-xs text-gray-400">Not yet analyzed</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Samples */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Training Samples</h2>
            <p className="text-xs text-gray-500 mt-0.5">{samples.length} samples provided &middot; More samples = better voice match</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Sample
          </button>
        </div>

        {showAddForm && (
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content Sample</label>
                <textarea
                  value={newSample}
                  onChange={(e) => setNewSample(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-gray-900 placeholder:text-gray-400 resize-none"
                  rows={5}
                  placeholder="Paste a piece of content that represents your authentic voice — a LinkedIn post, blog excerpt, email, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Source <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={newSampleSource}
                  onChange={(e) => setNewSampleSource(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., LinkedIn post from March 2024"
                />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleAddSample} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all">
                  <Save className="w-4 h-4" /> Save Sample
                </button>
                <button onClick={() => { setShowAddForm(false); setNewSample(''); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {samples.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Mic2 className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No voice samples yet</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
              Add your best-performing content to further train the AI on your unique voice and style.
            </p>
            <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all">
              <Plus className="w-4 h-4" /> Add Your First Sample
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {samples.map((sample) => (
              <div key={sample.id} className="p-4 group hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{sample.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">{sample.source}</span>
                      <span className="text-xs text-gray-300">&middot;</span>
                      <span className="text-xs text-gray-400">{formatRelativeTime(sample.addedAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSample(sample.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
