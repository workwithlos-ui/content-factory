'use client';

import { useState, useEffect } from 'react';
import { getAudienceProfiles, addAudienceProfile, updateAudienceProfile, deleteAudienceProfile } from '@/lib/storage';
import { AudienceProfile } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Users, Plus, Trash2, X, Star, Edit2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMPTY_PROFILE: Omit<AudienceProfile, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  painPoints: ['', '', ''],
  desires: ['', '', ''],
  objections: ['', '', ''],
  language: ['', '', ''],
  failedSolutions: ['', '', ''],
  scrollStoppers: ['', '', ''],
  isDefault: false,
};

export default function AudiencesPage() {
  const [profiles, setProfiles] = useState<AudienceProfile[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_PROFILE);

  useEffect(() => { setProfiles(getAudienceProfiles()); }, []);

  const handleSave = () => {
    if (!form.name.trim()) return;
    const profile: AudienceProfile = {
      ...form,
      id: uuidv4(),
      painPoints: form.painPoints.filter(Boolean),
      desires: form.desires.filter(Boolean),
      objections: form.objections.filter(Boolean),
      language: form.language.filter(Boolean),
      failedSolutions: form.failedSolutions.filter(Boolean),
      scrollStoppers: form.scrollStoppers.filter(Boolean),
      isDefault: profiles.length === 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addAudienceProfile(profile);
    setProfiles(getAudienceProfiles());
    setForm(EMPTY_PROFILE);
    setShowAdd(false);
  };

  const handleUpdate = (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;
    updateAudienceProfile(id, {
      ...form,
      painPoints: form.painPoints.filter(Boolean),
      desires: form.desires.filter(Boolean),
      objections: form.objections.filter(Boolean),
      language: form.language.filter(Boolean),
      failedSolutions: form.failedSolutions.filter(Boolean),
      scrollStoppers: form.scrollStoppers.filter(Boolean),
    });
    setProfiles(getAudienceProfiles());
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    deleteAudienceProfile(id);
    setProfiles(getAudienceProfiles());
  };

  const handleSetDefault = (id: string) => {
    updateAudienceProfile(id, { isDefault: true });
    setProfiles(getAudienceProfiles());
  };

  const startEdit = (profile: AudienceProfile) => {
    setEditing(profile.id);
    setForm({
      name: profile.name,
      painPoints: [...profile.painPoints, '', '', ''].slice(0, 3),
      desires: [...profile.desires, '', '', ''].slice(0, 3),
      objections: [...profile.objections, '', '', ''].slice(0, 3),
      language: [...profile.language, '', '', ''].slice(0, 3),
      failedSolutions: [...profile.failedSolutions, '', '', ''].slice(0, 3),
      scrollStoppers: [...profile.scrollStoppers, '', '', ''].slice(0, 3),
      isDefault: profile.isDefault,
    });
  };

  const updateFormArray = (field: keyof typeof form, idx: number, value: string) => {
    setForm(prev => {
      const arr = [...(prev[field] as string[])];
      arr[idx] = value;
      return { ...prev, [field]: arr };
    });
  };

  const renderArrayInputs = (label: string, field: keyof typeof form, placeholder: string) => (
    <div>
      <label className="label">{label}</label>
      {(form[field] as string[]).map((v: string, i: number) => (
        <input key={i} type="text" value={v} onChange={e => updateFormArray(field, i, e.target.value)} className="input-field mb-2" placeholder={`${placeholder} ${i + 1}`} />
      ))}
    </div>
  );

  const ProfileForm = ({ onSave, isEditing }: { onSave: () => void; isEditing?: boolean }) => (
    <div className="card p-6 space-y-5 border-indigo-500/20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{isEditing ? 'Edit' : 'New'} Audience Profile</h3>
        <button onClick={() => { setShowAdd(false); setEditing(null); }} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
      </div>
      <div>
        <label className="label">Profile Name</label>
        <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="input-field" placeholder='e.g., "Agency owners doing $10K-50K/month"' />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {renderArrayInputs('Top 3 Pain Points', 'painPoints', 'Pain point')}
        {renderArrayInputs('Top 3 Desires', 'desires', 'Desire')}
        {renderArrayInputs('Biggest Objections', 'objections', 'Objection')}
        {renderArrayInputs('Language They Use', 'language', 'Phrase they say')}
        {renderArrayInputs('Failed Solutions', 'failedSolutions', 'What they tried')}
        {renderArrayInputs('Scroll Stoppers', 'scrollStoppers', 'What stops their scroll')}
      </div>
      <button onClick={onSave} className="btn-primary gap-2">
        <Check size={16} /> {isEditing ? 'Update' : 'Save'} Profile
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-700/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-violet-400" />
            </div>
            Audience Psychographic Profiles
          </h1>
          <p className="text-slate-500 mt-2">Define who you&apos;re talking to. The AI uses their pain points, desires, and language to write content that resonates.</p>
        </div>
        <button onClick={() => { setShowAdd(true); setForm(EMPTY_PROFILE); }} className="btn-primary gap-2">
          <Plus size={16} /> New Profile
        </button>
      </div>

      {showAdd && <ProfileForm onSave={handleSave} />}

      {profiles.length === 0 && !showAdd ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No audience profiles yet</h3>
          <p className="text-slate-600 text-sm mb-4">Create profiles for each audience segment. The AI will tailor content to their specific pain points and language.</p>
          <button onClick={() => setShowAdd(true)} className="btn-secondary gap-2"><Plus size={16} /> Create First Profile</button>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map(profile => (
            <div key={profile.id}>
              {editing === profile.id ? (
                <ProfileForm onSave={() => handleUpdate(profile.id)} isEditing />
              ) : (
                <div className={cn('card p-5', profile.isDefault && 'border-indigo-500/30')}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{profile.name}</h3>
                        {profile.isDefault && <span className="badge-brand text-xs flex items-center gap-1"><Star size={10} /> Default</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!profile.isDefault && (
                        <button onClick={() => handleSetDefault(profile.id)} className="btn-ghost text-xs gap-1"><Star size={12} /> Set Default</button>
                      )}
                      <button onClick={() => startEdit(profile)} className="btn-ghost text-xs gap-1"><Edit2 size={12} /> Edit</button>
                      <button onClick={() => handleDelete(profile.id)} className="btn-ghost text-xs text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {profile.painPoints.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Pain Points</p>
                        {profile.painPoints.map((p, i) => <p key={i} className="text-slate-400">&bull; {p}</p>)}
                      </div>
                    )}
                    {profile.desires.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Desires</p>
                        {profile.desires.map((d, i) => <p key={i} className="text-slate-400">&bull; {d}</p>)}
                      </div>
                    )}
                    {profile.objections.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Objections</p>
                        {profile.objections.map((o, i) => <p key={i} className="text-slate-400">&bull; {o}</p>)}
                      </div>
                    )}
                    {profile.language.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Their Language</p>
                        {profile.language.map((l, i) => <p key={i} className="text-slate-400">&ldquo;{l}&rdquo;</p>)}
                      </div>
                    )}
                    {profile.failedSolutions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Failed Solutions</p>
                        {profile.failedSolutions.map((f, i) => <p key={i} className="text-slate-400">&bull; {f}</p>)}
                      </div>
                    )}
                    {profile.scrollStoppers.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Scroll Stoppers</p>
                        {profile.scrollStoppers.map((s, i) => <p key={i} className="text-slate-400">&bull; {s}</p>)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
