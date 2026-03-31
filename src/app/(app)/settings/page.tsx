'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  User, Building2, Users, CreditCard, Key, Mic2,
  Save, Check, ExternalLink, Lock, Plus, Trash2,
  ChevronRight, AlertCircle, Shield, Cpu, Link2,
} from 'lucide-react';
import { getUser, saveUser } from '@/lib/storage';
import { ModelPreference, MODEL_LABELS, PLATFORM_MODEL_MAP, AIModel } from '@/types';
import { cn } from '@/lib/utils';

type Tab = 'account' | 'team' | 'billing' | 'integrations' | 'ai-model' | 'voice';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [saved, setSaved] = useState(false);

  // Account form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.company || '');
  const [industry, setIndustry] = useState(user?.industry || '');
  const [targetAudience, setTargetAudience] = useState(user?.targetAudience || '');
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl || '');

  // AI Model preferences
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
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setCompany(user.company || '');
      setIndustry(user.industry || '');
      setTargetAudience(user.targetAudience || '');
      setWebsiteUrl(user.websiteUrl || '');
    }
  }, [user]);

  const handleSaveAccount = () => {
    updateUser({ name, company, industry, targetAudience, websiteUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveModelPrefs = () => {
    const storedUser = getUser();
    if (storedUser) {
      saveUser({ ...storedUser, modelPreference, defaultUtmBaseUrl: utmBaseUrl });
    }
    setModelSaved(true);
    setTimeout(() => setModelSaved(false), 2000);
  };

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: 'account', label: 'Account', icon: User },
    { key: 'team', label: 'Team Members', icon: Users },
    { key: 'billing', label: 'Billing', icon: CreditCard },
    { key: 'integrations', label: 'Integrations', icon: Key },
    { key: 'ai-model', label: 'AI Model', icon: Cpu },
    { key: 'voice', label: 'Brand Voice', icon: Mic2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account, team, and integrations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="card divide-y divide-slate-100 lg:divide-y-0">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left',
                  activeTab === tab.key
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Account */}
          {activeTab === 'account' && (
            <div className="card p-6 lg:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Account Settings</h2>
                <p className="text-sm text-slate-500">Update your personal and company information.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={email} disabled className="input-field bg-slate-50 text-slate-400" />
                </div>
                <div>
                  <label className="label">Company Name</label>
                  <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label">Industry</label>
                  <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Target Audience</label>
                  <input type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Website URL</label>
                  <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="input-field" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSaveAccount} className="btn-primary gap-2">
                  {saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-danger-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-slate-500 mb-3">Permanently delete your account and all associated data.</p>
                <button className="px-4 py-2 rounded-xl border border-danger-200 text-danger-600 text-sm font-medium hover:bg-danger-50 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Team */}
          {activeTab === 'team' && (
            <div className="card p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Team Members</h2>
                  <p className="text-sm text-slate-500">Manage who has access to your workspace.</p>
                </div>
                <button className="btn-primary gap-2 text-sm">
                  <Plus size={14} /> Invite Member
                </button>
              </div>

              <div className="card divide-y divide-slate-100">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{user?.name || 'You'}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <span className="badge-brand text-xs">Owner</span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={14} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Multi-seat plans coming soon</span>
                </div>
                <p className="text-xs text-slate-500">
                  Team collaboration features including role-based access, approval workflows, and shared content libraries are on our roadmap.
                </p>
              </div>
            </div>
          )}

          {/* Billing */}
          {activeTab === 'billing' && (
            <div className="card p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Billing & Subscription</h2>
                <p className="text-sm text-slate-500">Manage your subscription and payment method.</p>
              </div>

              {/* Current Plan */}
              <div className="p-5 rounded-xl border-2 border-brand-200 bg-brand-50/50 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="badge-brand text-xs mb-1 inline-flex">Current Plan</span>
                    <h3 className="text-lg font-bold text-slate-900">Growth Operating System</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">$900<span className="text-sm font-normal text-slate-500">/mo</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Free trial: 14 days remaining</span>
                  <span>&middot;</span>
                  <span>Unlimited content generation</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Payment Method</h3>
                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 rounded bg-slate-800 flex items-center justify-center">
                      <CreditCard size={14} className="text-white" />
                    </div>
                    <span className="text-sm text-slate-500">No payment method on file</span>
                  </div>
                  <button className="text-sm text-brand-600 font-medium hover:text-brand-700">
                    Add Card
                  </button>
                </div>
              </div>

              {/* Invoices */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Invoices</h3>
                <div className="p-6 rounded-xl border border-slate-200 text-center">
                  <p className="text-sm text-slate-500">No invoices yet. Your first invoice will appear after your trial ends.</p>
                </div>
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <div className="card p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Integrations & API Keys</h2>
                <p className="text-sm text-slate-500">Connect your tools and manage API access.</p>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'HubSpot', description: 'Sync contacts and track content-to-pipeline attribution', status: 'coming_soon', icon: '🟠' },
                  { name: 'Salesforce', description: 'Connect deals and opportunities to content engagement', status: 'coming_soon', icon: '☁️' },
                  { name: 'Pipedrive', description: 'Track pipeline influenced by your content', status: 'coming_soon', icon: '🟢' },
                  { name: 'Zapier', description: 'Connect to 5,000+ apps with automated workflows', status: 'coming_soon', icon: '⚡' },
                  { name: 'Buffer', description: 'Schedule and publish content directly', status: 'coming_soon', icon: '📅' },
                  { name: 'WordPress', description: 'Publish blog posts directly to your site', status: 'coming_soon', icon: '📝' },
                ].map((integration, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                      {integration.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900">{integration.name}</h4>
                      <p className="text-xs text-slate-500">{integration.description}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                ))}
              </div>

              {/* API Key */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">API Access</h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Key size={14} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">API Key</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-white px-3 py-2 rounded-lg border border-slate-200 text-slate-400 font-mono">
                      cf_sk_••••••••••••••••••••••••
                    </code>
                    <button className="btn-ghost text-xs">Reveal</button>
                    <button className="btn-ghost text-xs">Regenerate</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Model */}
          {activeTab === 'ai-model' && (
            <div className="card p-6 lg:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">AI Model Preferences</h2>
                <p className="text-sm text-slate-500">Choose which AI model powers your content generation.</p>
              </div>

              {/* Model Selection */}
              <div>
                <label className="label mb-3">Preferred AI Model</label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { key: 'auto' as ModelPreference, label: 'Auto (Recommended)', desc: 'Best model per platform', badge: 'Smart', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
                    { key: 'gpt' as ModelPreference, label: 'Always GPT-4.1 Mini', desc: 'Fast, punchy, short-form', badge: 'GPT', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { key: 'claude' as ModelPreference, label: 'Always Gemini 2.5 Flash', desc: 'Nuanced, voice-matched, long-form', badge: 'Gemini', badgeColor: 'bg-violet-50 text-violet-700 border-violet-200' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setModelPreference(opt.key)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all',
                        modelPreference === opt.key
                          ? 'border-brand-500 bg-brand-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-semibold', opt.badgeColor)}>{opt.badge}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{opt.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Mode Explanation */}
              {modelPreference === 'auto' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-2">Auto Mode: Best Model Per Platform</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(PLATFORM_MODEL_MAP).map(([platform, model]) => (
                      <div key={platform} className="bg-white/70 rounded-lg px-3 py-2">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase">{platform.replace('-', ' ')}</p>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded border font-medium mt-1 inline-block', MODEL_LABELS[model as AIModel].color)}>
                          {MODEL_LABELS[model as AIModel].badge}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-blue-600 mt-2">GPT-4.1 Mini for short-form speed. Gemini 2.5 Flash for long-form nuance and voice matching.</p>
                </div>
              )}

              {/* UTM Base URL */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <Link2 size={14} className="text-slate-500" />
                  <label className="label mb-0">Default UTM Base URL</label>
                </div>
                <p className="text-xs text-slate-500 mb-3">This URL is used as the base for all auto-generated UTM tracking links.</p>
                <input
                  type="url"
                  value={utmBaseUrl}
                  onChange={e => setUtmBaseUrl(e.target.value)}
                  className="input-field"
                  placeholder="https://yoursite.com"
                />
              </div>

              <button onClick={handleSaveModelPrefs} className="btn-primary gap-2">
                {modelSaved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save Preferences</>}
              </button>
            </div>
          )}

          {/* Voice */}
          {activeTab === 'voice' && (
            <div className="card p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Brand Voice Management</h2>
                  <p className="text-sm text-slate-500">Manage your voice profile and training data.</p>
                </div>
                <Link href="/voice" className="btn-primary gap-2 text-sm">
                  <Mic2 size={14} />
                  Open Voice Engine
                </Link>
              </div>

              <div className="p-5 rounded-xl bg-brand-50 border border-brand-100">
                <div className="flex items-center gap-3 mb-3">
                  <Shield size={18} className="text-brand-600" />
                  <h3 className="font-medium text-brand-900">Voice Profile Active</h3>
                </div>
                <p className="text-sm text-brand-700/70 leading-relaxed">
                  Your brand voice is being applied to all content generation. Visit the Voice Engine to add more 
                  training samples and improve accuracy.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
