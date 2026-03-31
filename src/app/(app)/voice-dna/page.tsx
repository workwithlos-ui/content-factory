'use client';

import { useState, useEffect } from 'react';
import { getBrandVoiceDNA, saveBrandVoiceDNA } from '@/lib/storage';
import { BrandVoiceDNA } from '@/types';
import { Mic2, Save, Check, Plus, X, Sparkles } from 'lucide-react';

export default function VoiceDNAPage() {
  const [dna, setDna] = useState<BrandVoiceDNA>({
    brandName: '',
    voiceDescriptors: '',
    phrasesTheyUse: [],
    phrasesTheyNeverUse: [],
    writingStyleReference: '',
    targetAudienceDescription: '',
    audiencePainPoints: '',
    updatedAt: new Date().toISOString(),
  });
  const [newPhrase, setNewPhrase] = useState('');
  const [newBannedPhrase, setNewBannedPhrase] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getBrandVoiceDNA();
    if (existing) setDna(existing);
  }, []);

  const handleSave = () => {
    const updated = { ...dna, updatedAt: new Date().toISOString() };
    saveBrandVoiceDNA(updated);
    setDna(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addPhrase = () => {
    if (!newPhrase.trim()) return;
    setDna(prev => ({ ...prev, phrasesTheyUse: [...prev.phrasesTheyUse, newPhrase.trim()] }));
    setNewPhrase('');
  };

  const removePhrase = (idx: number) => {
    setDna(prev => ({ ...prev, phrasesTheyUse: prev.phrasesTheyUse.filter((_, i) => i !== idx) }));
  };

  const addBannedPhrase = () => {
    if (!newBannedPhrase.trim()) return;
    setDna(prev => ({ ...prev, phrasesTheyNeverUse: [...prev.phrasesTheyNeverUse, newBannedPhrase.trim()] }));
    setNewBannedPhrase('');
  };

  const removeBannedPhrase = (idx: number) => {
    setDna(prev => ({ ...prev, phrasesTheyNeverUse: prev.phrasesTheyNeverUse.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow">
              <Mic2 className="w-5 h-5 text-white" />
            </div>
            Brand Voice DNA
          </h1>
          <p className="text-slate-500 mt-2">This gets injected into every single prompt. The more detail you add, the less your content sounds like AI.</p>
        </div>
        <button onClick={handleSave} className="btn-primary gap-2">
          {saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save DNA</>}
        </button>
      </div>

      {/* Brand Name */}
      <div className="card p-6 space-y-6">
        <div>
          <label className="label">Brand / Creator Name</label>
          <input
            type="text"
            value={dna.brandName}
            onChange={e => setDna(prev => ({ ...prev, brandName: e.target.value }))}
            className="input-field"
            placeholder="e.g., Acme Corp, @yourhandle, Your Name"
          />
        </div>

        <div>
          <label className="label">Voice Descriptors</label>
          <p className="text-xs text-slate-600 mb-2">How would you describe your writing voice in 5-8 words?</p>
          <input
            type="text"
            value={dna.voiceDescriptors}
            onChange={e => setDna(prev => ({ ...prev, voiceDescriptors: e.target.value }))}
            className="input-field"
            placeholder="e.g., direct, no-BS, tactical, slightly irreverent, data-heavy"
          />
        </div>

        <div>
          <label className="label">Writing Style Reference</label>
          <p className="text-xs text-slate-600 mb-2">Describe your style by comparing to known creators or mixing styles.</p>
          <textarea
            value={dna.writingStyleReference}
            onChange={e => setDna(prev => ({ ...prev, writingStyleReference: e.target.value }))}
            className="textarea-field"
            rows={3}
            placeholder="e.g., Alex Hormozi meets Tim Ferriss. Short sentences. Tactical. Numbers-heavy. No fluff. Every paragraph earns its place."
          />
        </div>
      </div>

      {/* Phrases They Use */}
      <div className="card p-6 space-y-4">
        <div>
          <label className="label flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-400" />
            Phrases You Actually Use
          </label>
          <p className="text-xs text-slate-600 mb-3">These get woven into your content naturally. Add your verbal tics, catchphrases, and signature expressions.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPhrase}
              onChange={e => setNewPhrase(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPhrase()}
              className="input-field flex-1"
              placeholder="e.g., here's the play, let me break this down"
            />
            <button onClick={addPhrase} className="btn-secondary px-4"><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {dna.phrasesTheyUse.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/30 text-emerald-300 text-sm border border-emerald-800/30">
                &ldquo;{p}&rdquo;
                <button onClick={() => removePhrase(i)} className="hover:text-emerald-100"><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Phrases They Never Use */}
      <div className="card p-6 space-y-4">
        <div>
          <label className="label flex items-center gap-2">
            <X size={14} className="text-red-400" />
            Phrases You NEVER Use
          </label>
          <p className="text-xs text-slate-600 mb-3">Hard blocklist. These will never appear in your content. The anti-slop lexicon is already built in.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBannedPhrase}
              onChange={e => setNewBannedPhrase(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addBannedPhrase()}
              className="input-field flex-1"
              placeholder="e.g., leverage, synergy, at the end of the day"
            />
            <button onClick={addBannedPhrase} className="btn-secondary px-4"><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {dna.phrasesTheyNeverUse.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/30 text-red-300 text-sm border border-red-800/30">
                &ldquo;{p}&rdquo;
                <button onClick={() => removeBannedPhrase(i)} className="hover:text-red-100"><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div className="card p-6 space-y-6">
        <div>
          <label className="label">Target Audience Description</label>
          <textarea
            value={dna.targetAudienceDescription}
            onChange={e => setDna(prev => ({ ...prev, targetAudienceDescription: e.target.value }))}
            className="textarea-field"
            rows={3}
            placeholder="e.g., B2B SaaS founders doing $1M-$10M ARR who are stuck at a growth plateau. They've tried content marketing but it all sounds generic. They want tactical, specific advice, not motivational fluff."
          />
        </div>
        <div>
          <label className="label">Audience Pain Points</label>
          <textarea
            value={dna.audiencePainPoints}
            onChange={e => setDna(prev => ({ ...prev, audiencePainPoints: e.target.value }))}
            className="textarea-field"
            rows={3}
            placeholder="e.g., Can't differentiate from competitors. Content doesn't generate leads. Spending too much on agencies that produce generic work. Don't know what to post."
          />
        </div>
      </div>

      {/* Built-in Anti-Slop */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          Built-in Anti-Slop Lexicon (always active)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {['crucial','vital','essential','paramount','pivotal','transformative','revolutionary','game-changing','groundbreaking','cutting-edge','innovative','robust','comprehensive','holistic','synergistic','leverage','unlock','harness','foster','cultivate','empower','navigate','delve','landscape','testament','realm','tapestry','multifaceted','nuanced','paradigm'].map(w => (
            <span key={w} className="px-2 py-0.5 rounded text-xs bg-red-950/20 text-red-500/70 border border-red-900/20 line-through">{w}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {["In today's fast-paced world","In the ever-evolving landscape","It's important to note","At the end of the day","When it comes to","In conclusion","To summarize"].map(p => (
            <span key={p} className="px-2 py-0.5 rounded text-xs bg-red-950/20 text-red-500/70 border border-red-900/20 line-through">&ldquo;{p}&rdquo;</span>
          ))}
        </div>
      </div>
    </div>
  );
}
