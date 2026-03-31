'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUTMLinks, getProjects } from '@/lib/storage';
import { buildUTMUrl, slugify } from '@/lib/utils';
import { UTMLink, PLATFORMS, PLATFORM_CONTENT_TYPES } from '@/types';
import { platformIcons } from '@/lib/platform-icons';
import { cn } from '@/lib/utils';
import {
  Link2, Copy, Check, Search, Filter, ArrowRight, ExternalLink,
  BarChart3, TrendingUp, Target, DollarSign, Eye, MousePointer,
  FileText, ChevronDown, ChevronUp, Plus, Trash2, Info, Zap,
} from 'lucide-react';

export default function UTMDashboardPage() {
  const { user } = useAuth();
  const [utmLinks, setUtmLinks] = useState<UTMLink[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'links' | 'builder' | 'attribution'>('links');

  // UTM Builder state
  const [builderUrl, setBuilderUrl] = useState(user?.websiteUrl || user?.defaultUtmBaseUrl || '');
  const [builderSource, setBuilderSource] = useState('linkedin');
  const [builderMedium, setBuilderMedium] = useState('post');
  const [builderCampaign, setBuilderCampaign] = useState('');
  const [builderContent, setBuilderContent] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');

  useEffect(() => {
    // Gather UTM links from all projects
    const allProjects = getProjects();
    setProjects(allProjects);
    const links: UTMLink[] = [];
    allProjects.forEach(project => {
      project.pieces.forEach((piece: any) => {
        if (piece.utmLink) {
          links.push({
            ...piece.utmLink,
            projectId: project.id,
            pieceId: piece.id,
          });
        }
      });
    });
    // Also get standalone UTM links
    const storedLinks = getUTMLinks();
    const allLinks = [...links, ...storedLinks];
    // Deduplicate by id
    const seen = new Set<string>();
    const deduped = allLinks.filter(l => {
      if (seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    });
    setUtmLinks(deduped);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBuildUrl = () => {
    if (!builderUrl) return;
    const url = buildUTMUrl(builderUrl, {
      source: builderSource,
      medium: builderMedium,
      campaign: slugify(builderCampaign || 'campaign'),
      content: builderContent || 'custom',
    });
    setGeneratedUrl(url);
  };

  const filteredLinks = utmLinks.filter(link => {
    const matchesSearch = search === '' || link.fullUrl.toLowerCase().includes(search.toLowerCase()) || link.utmParams.campaign.includes(search.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || link.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  const platformStats = PLATFORMS.reduce((acc, p) => {
    acc[p.key] = utmLinks.filter(l => l.platform === p.key).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">UTM Attribution Tracking</h1>
          <p className="text-slate-500 mt-1">Every piece of content gets a unique UTM link. Track what drives revenue.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">{utmLinks.length} links generated</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total UTM Links', value: utmLinks.length.toString(), icon: Link2, color: 'text-blue-600 bg-blue-50' },
          { label: 'Platforms Tracked', value: Object.values(platformStats).filter(v => v > 0).length.toString(), icon: Target, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Campaigns Active', value: Array.from(new Set(utmLinks.map(l => l.utmParams.campaign))).length.toString(), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Revenue Attributed', value: 'Coming Soon', icon: DollarSign, color: 'text-amber-600 bg-amber-50', subtitle: 'Connect CRM' },
        ].map((stat, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.color)}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                {stat.subtitle && <p className="text-[10px] text-amber-500">{stat.subtitle}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {[
          { key: 'links', label: 'UTM Links', icon: Link2 },
          { key: 'builder', label: 'UTM Builder', icon: Plus },
          { key: 'attribution', label: 'Attribution Flow', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── UTM Links Tab ─────────────────────────────────────── */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by campaign, URL..."
                className="input-field pl-10"
              />
            </div>
            <select
              value={filterPlatform}
              onChange={e => setFilterPlatform(e.target.value)}
              className="input-field w-auto min-w-[160px]"
            >
              <option value="all">All Platforms</option>
              {PLATFORMS.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Links List */}
          {filteredLinks.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Link2 size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No UTM Links Yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
                UTM links are automatically generated every time you create content. Each platform output gets a unique, trackable link.
              </p>
              <a href="/content/new" className="btn-primary inline-flex gap-2">
                <Zap size={14} /> Create Content to Generate Links
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLinks.map(link => {
                const Icon = platformIcons[link.platform] || FileText;
                const platformInfo = PLATFORMS.find(p => p.key === link.platform);
                return (
                  <div key={link.id} className="card p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={16} className="text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-700">{platformInfo?.label || link.platform}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{link.utmParams.medium}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg truncate block max-w-full font-mono">
                            {link.fullUrl}
                          </code>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span>Campaign: <span className="text-slate-600 font-medium">{link.utmParams.campaign}</span></span>
                          <span>Source: <span className="text-slate-600 font-medium">{link.utmParams.source}</span></span>
                          <span>Content ID: <span className="text-slate-600 font-medium">{link.utmParams.content}</span></span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(link.fullUrl, link.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0',
                          copiedId === link.id ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {copiedId === link.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Platform Distribution */}
          {utmLinks.length > 0 && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Links by Platform</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {PLATFORMS.map(p => {
                  const Icon = platformIcons[p.key] || FileText;
                  const count = platformStats[p.key] || 0;
                  return (
                    <div key={p.key} className="text-center p-3 rounded-xl bg-slate-50">
                      <Icon size={18} className="mx-auto mb-1.5 text-slate-500" />
                      <p className="text-lg font-bold text-slate-900">{count}</p>
                      <p className="text-[10px] text-slate-500">{p.label.split(' ')[0]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── UTM Builder Tab ──────────────────────────────────── */}
      {activeTab === 'builder' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Custom UTM Builder</h3>
              <p className="text-sm text-slate-500">Create custom UTM links for any content or campaign.</p>
            </div>

            <div>
              <label className="label">Base URL <span className="text-red-400">*</span></label>
              <input
                type="url"
                value={builderUrl}
                onChange={e => setBuilderUrl(e.target.value)}
                className="input-field"
                placeholder="https://yoursite.com/landing-page"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Source (utm_source)</label>
                <select value={builderSource} onChange={e => setBuilderSource(e.target.value)} className="input-field">
                  <option value="linkedin">linkedin</option>
                  <option value="twitter">twitter</option>
                  <option value="instagram">instagram</option>
                  <option value="email">email</option>
                  <option value="blog">blog</option>
                  <option value="youtube">youtube</option>
                  <option value="video_script">video_script</option>
                  <option value="facebook">facebook</option>
                  <option value="google">google</option>
                  <option value="direct">direct</option>
                </select>
              </div>
              <div>
                <label className="label">Medium (utm_medium)</label>
                <select value={builderMedium} onChange={e => setBuilderMedium(e.target.value)} className="input-field">
                  <option value="post">post</option>
                  <option value="thread">thread</option>
                  <option value="caption">caption</option>
                  <option value="newsletter">newsletter</option>
                  <option value="article">article</option>
                  <option value="description">description</option>
                  <option value="script">script</option>
                  <option value="social">social</option>
                  <option value="cpc">cpc</option>
                  <option value="referral">referral</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Campaign (utm_campaign)</label>
              <input
                type="text"
                value={builderCampaign}
                onChange={e => setBuilderCampaign(e.target.value)}
                className="input-field"
                placeholder="e.g., q1-content-blitz"
              />
              <p className="text-[10px] text-slate-400 mt-1">Auto-slugified: {slugify(builderCampaign || 'campaign')}</p>
            </div>

            <div>
              <label className="label">Content ID (utm_content) <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={builderContent}
                onChange={e => setBuilderContent(e.target.value)}
                className="input-field"
                placeholder="e.g., variant-a or cta-header"
              />
            </div>

            <button onClick={handleBuildUrl} className="btn-primary w-full gap-2">
              <Link2 size={14} /> Generate UTM Link
            </button>

            {generatedUrl && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-emerald-700 mb-2">Generated UTM Link</p>
                <code className="text-sm text-emerald-800 break-all block mb-3 font-mono">{generatedUrl}</code>
                <button
                  onClick={() => handleCopy(generatedUrl, 'builder')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors"
                >
                  {copiedId === 'builder' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Link</>}
                </button>
              </div>
            )}
          </div>

          {/* UTM Parameter Guide */}
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">UTM Parameter Guide</h3>
              <div className="space-y-3">
                {[
                  { param: 'utm_source', desc: 'Where the traffic comes from', example: 'linkedin, twitter, email', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { param: 'utm_medium', desc: 'The type of content', example: 'post, thread, newsletter', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                  { param: 'utm_campaign', desc: 'The campaign or topic', example: 'why-b2b-wastes-budget', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                  { param: 'utm_content', desc: 'Unique content identifier', example: 'a3f8b2c1 (auto-generated)', color: 'bg-pink-50 text-pink-700 border-pink-200' },
                ].map(item => (
                  <div key={item.param} className="flex items-start gap-3">
                    <span className={cn('text-[10px] font-mono font-semibold px-2 py-1 rounded-lg border flex-shrink-0', item.color)}>{item.param}</span>
                    <div>
                      <p className="text-xs text-slate-700">{item.desc}</p>
                      <p className="text-[10px] text-slate-400">e.g., {item.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">How Content Factory Auto-Tags</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <p>Every time you generate content, each platform output automatically gets a unique UTM link:</p>
                <div className="bg-slate-50 rounded-lg p-3 font-mono text-[10px] text-slate-500 space-y-1">
                  <p>utm_source = <span className="text-blue-600">platform name</span></p>
                  <p>utm_medium = <span className="text-indigo-600">content type</span></p>
                  <p>utm_campaign = <span className="text-purple-600">slugified topic</span></p>
                  <p>utm_content = <span className="text-pink-600">unique piece ID</span></p>
                </div>
                <p className="text-slate-500 mt-2">This means every click from every piece of content is traceable back to the exact topic, platform, and content piece that generated it.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Attribution Flow Tab ─────────────────────────────── */}
      {activeTab === 'attribution' && (
        <div className="space-y-6">
          {/* Attribution Flow Visualization */}
          <div className="card p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Revenue Attribution Flow</h3>
            <p className="text-sm text-slate-500 mb-8">How Content Factory connects your content to revenue. Every piece is trackable.</p>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
              {[
                { icon: FileText, label: 'Content Created', sublabel: `${utmLinks.length} pieces`, color: 'bg-blue-100 text-blue-700', borderColor: 'border-blue-200' },
                { icon: Link2, label: 'UTM Link Added', sublabel: 'Auto-tagged', color: 'bg-indigo-100 text-indigo-700', borderColor: 'border-indigo-200' },
                { icon: MousePointer, label: 'Click Tracked', sublabel: 'Google Analytics', color: 'bg-purple-100 text-purple-700', borderColor: 'border-purple-200' },
                { icon: Eye, label: 'Lead Identified', sublabel: 'CRM Integration', color: 'bg-pink-100 text-pink-700', borderColor: 'border-pink-200' },
                { icon: DollarSign, label: 'Revenue Attributed', sublabel: 'Pipeline Tracked', color: 'bg-emerald-100 text-emerald-700', borderColor: 'border-emerald-200' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-0">
                  <div className={cn('flex flex-col items-center p-4 rounded-2xl border-2 min-w-[140px]', step.borderColor)}>
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-2', step.color)}>
                      <step.icon size={20} />
                    </div>
                    <p className="text-xs font-semibold text-slate-900 text-center">{step.label}</p>
                    <p className="text-[10px] text-slate-500 text-center">{step.sublabel}</p>
                  </div>
                  {i < 4 && (
                    <div className="hidden lg:flex items-center px-2">
                      <ArrowRight size={20} className="text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* How to Connect */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <BarChart3 size={16} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Connect to Google Analytics</h3>
              </div>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
                  <p>Ensure Google Analytics 4 (GA4) is installed on your website. UTM parameters are automatically captured.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
                  <p>Go to GA4 &rarr; Reports &rarr; Acquisition &rarr; Traffic Acquisition. Filter by Source/Medium to see Content Factory traffic.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
                  <p>Create a custom report with Campaign as the primary dimension to see which topics drive the most traffic.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">4</span>
                  <p>Set up Conversions in GA4 to track which UTM links lead to form fills, demos, or purchases.</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Target size={16} className="text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Connect to Your CRM</h3>
              </div>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
                  <p>In HubSpot/Salesforce, UTM parameters are automatically captured when a lead fills out a form from a UTM-tagged link.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
                  <p>Create a custom report: Group deals by "Original Source" and filter for utm_source values (linkedin, twitter, etc.).</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
                  <p>Use utm_campaign to see which specific topics generated pipeline. This tells you what to write more of.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">4</span>
                  <p>Track "Content-Influenced Pipeline" by summing deal values where the first touch came from a Content Factory UTM link.</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-[10px] text-amber-700 font-medium">Coming Q2 2026: Direct CRM integration. Content Factory will automatically pull pipeline data and show you revenue attribution per content piece.</p>
              </div>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="card p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <h3 className="text-lg font-semibold mb-2">The ROI Math</h3>
            <p className="text-sm text-slate-300 mb-6">Why UTM tracking matters at $900/month.</p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-bold text-emerald-400">1</p>
                <p className="text-sm text-slate-300 mt-1">If just ONE deal per month comes from content you can trace with UTMs...</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-400">10-50x</p>
                <p className="text-sm text-slate-300 mt-1">The typical ROI for B2B companies tracking content attribution</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-400">$10K+</p>
                <p className="text-sm text-slate-300 mt-1">Average deal value that makes $900/mo a rounding error</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
