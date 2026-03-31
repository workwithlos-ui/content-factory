'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { User, Building2, Users, CreditCard, Key, Mic2, Save, Check, Lock, Plus, Cpu } from 'lucide-react';
import { getUser, saveUser } from '@/lib/storage';
import { ModelPreference, MODEL_LABELS, PLATFORM_MODEL_MAP, AIModel } from '@/types';
import { cn } from '@/lib/utils';

type Tab = 'account' | 'team' | 'billing' | 'ai-model';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.company || '');
  const [industry, setIndustry] = useState(user?.industry || '');
  const [targetAudience, setTargetAudience] = useState(user?.targetAudience || '');
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl || '');
  const [modelPreference, setModelPreference] = useState<ModelPreference>('auto');
  const [utmBaseUrl, setUtmBaseUrl] = useState('');
  const [modelSaved, setModelSaved] = useState(false);

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setModelPreference((storedUser.modelPreference as ModelPreference) || 'auto');
      setUtmBaseUrl(storedUser.defaultUtmBaseUrl || storedUser.websiteUrl || '');
    }
  }, []);

  useEffect(() => {
    if (user) { setName(user.name || ''); setEmail(user.email || ''); setCompany(user.company || ''); setIndustry(user.industry || ''); setTargetAudience(user.targetAudience || ''); setWebsiteUrl(user.websiteUrl || ''); }
  }, [user]);

  const handleSaveAccount = () => { updateUser({ name, company, industry, targetAudience, websiteUrl }); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleSaveModelPrefs = () => { const storedUser = getUser(); if (storedUser) saveUser({ ...storedUser, modelPreference, defaultUtmBaseUrl: utmBaseUrl }); setModelSaved(true); setTimeout(() => setModelSaved(false), 2000); };

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: 'account', label: 'Account', icon: User },
    { key: 'team', label: 'Team', icon: Users },
    { key: 'billing', label: 'Billing', icon: CreditCard },
    { key: 'ai-model', label: 'AI Model', icon: Cpu },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account, team, and AI preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex-shrink-0">
          <nav className="card divide-y divide-white/[0.04]">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn('w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left', activeTab === tab.key ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]')}>
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'account' && (
            <div className="card p-6 lg:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Account Settings</h2>
                <p className="text-sm text-slate-500">Update your personal and company information.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className="label">Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" /></div>
                <div><label className="label">Email</label><input type="email" value={email} disabled className="input-field opacity-50" /></div>
                <div><label className="label">Company</label><input type="text" value={company} onChange={e => setCompany(e.target.value)} className="input-field" /></div>
                <div><label className="label">Industry</label><input type="text" value={industry} onChange={e => setIndustry(e.target.value)} className="input-field" /></div>
                <div className="sm:col-span-2"><label className="label">Target Audience</label><input type="text" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="input-field" /></div>
                <div className="sm:col-span-2"><label className="label">Website URL</label><input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} className="input-field" /></div>
              </div>
              <button onClick={handleSaveAccount} className="btn-primary gap-2">
                {saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="card p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-white mb-1">Team Members</h2>
              <p className="text-sm text-slate-500 mb-6">Manage who has access to your workspace.</p>
              <div className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-sm">{user?.name?.[0] || 'U'}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{user?.name || 'You'}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <span className="badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs">Owner</span>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2"><Lock size={14} className="text-slate-600" /><span className="text-sm font-medium text-slate-400">Multi-seat plans coming soon</span></div>
                <p className="text-xs text-slate-600">Team collaboration features are on our roadmap.</p>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="card p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-white mb-1">Billing & Subscription</h2>
              <p className="text-sm text-slate-500 mb-6">Manage your subscription and payment method.</p>
              <div className="p-5 rounded-xl border-2 border-indigo-500/30 bg-indigo-500/5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs mb-1 inline-flex">Current Plan</span>
                    <h3 className="text-lg font-bold text-white">Growth Operating System</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">$900<span className="text-sm font-normal text-slate-500">/mo</span></p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Free trial: 14 days remaining &middot; Unlimited content generation</p>
              </div>
              <div className="p-4 rounded-xl border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded bg-white/[0.06] flex items-center justify-center"><CreditCard size={14} className="text-slate-500" /></div>
                  <span className="text-sm text-slate-500">No payment method on file</span>
                </div>
                <button className="text-sm text-indigo-400 font-medium hover:text-indigo-300">Add Card</button>
              </div>
            </div>
          )}

          {activeTab === 'ai-model' && (
            <div className="card p-6 lg:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">AI Model Preferences</h2>
                <p className="text-sm text-slate-500">Choose which AI model generates your content.</p>
              </div>
              <div>
                <label className="label">Model Selection</label>
                <div className="space-y-3">
                  {[
                    { key: 'auto' as ModelPreference, label: 'Auto (Recommended)', desc: 'Best model per platform. GPT-4.1 Mini for short-form, Gemini 2.5 Flash for long-form.' },
                    { key: 'gpt' as ModelPreference, label: 'GPT-4.1 Mini Only', desc: 'OpenAI model. Great for concise, punchy content.' },
                    { key: 'claude' as ModelPreference, label: 'Gemini 2.5 Flash Only', desc: 'Google model. Excellent for long-form and nuanced writing.' },
                  ].map(opt => (
                    <button key={opt.key} onClick={() => setModelPreference(opt.key)} className={cn('w-full text-left p-4 rounded-xl border transition-all', modelPreference === opt.key ? 'bg-indigo-500/10 border-indigo-500/30' : 'border-white/[0.06] hover:border-white/[0.1]')}>
                      <p className={cn('text-sm font-medium', modelPreference === opt.key ? 'text-indigo-300' : 'text-slate-300')}>{opt.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Default UTM Base URL</label>
                <input type="url" value={utmBaseUrl} onChange={e => setUtmBaseUrl(e.target.value)} className="input-field" placeholder="https://yourdomain.com" />
                <p className="text-xs text-slate-600 mt-1">Used for generating UTM tracking links on all content.</p>
              </div>
              <div>
                <label className="label mb-3">Platform Model Routing</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PLATFORM_MODEL_MAP).map(([platform, model]) => (
                    <div key={platform} className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04] flex items-center justify-between">
                      <span className="text-xs text-slate-400 capitalize">{platform}</span>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded border', MODEL_LABELS[model as AIModel]?.color || 'text-slate-500')}>{MODEL_LABELS[model as AIModel]?.badge || model}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleSaveModelPrefs} className="btn-primary gap-2">
                {modelSaved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save Preferences</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
