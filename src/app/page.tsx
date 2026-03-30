'use client';

import Link from 'next/link';
import {
  Zap, ArrowRight, Check, Star, BarChart3, Mic2, PenTool,
  Share2, TrendingUp, Shield, Clock, ChevronRight, Play,
  Mail, FileText, Video,
  Users, DollarSign, Target, Brain, Sparkles, Globe, Hash, AtSign, Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Brain,
    title: 'Neural Voice Engine',
    description: 'AI that learns your exact tone, vocabulary, and storytelling patterns. After 30 days, output is indistinguishable from your own writing.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: PenTool,
    title: 'Autonomous Production Engine',
    description: 'One input generates 7 platform-optimized outputs. Built on 12 proven copywriting frameworks — PAS, AIDA, Story-Lesson-Action, and more.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: TrendingUp,
    title: 'Revenue Attribution Layer',
    description: 'Track every piece of content to pipeline and closed revenue. See exactly which posts generate leads and deals.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Target,
    title: 'Predictive Strategy Matrix',
    description: 'AI analyzes your CRM data and content performance to predict what content to create next for maximum pipeline impact.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Shield,
    title: 'Competitive Intelligence',
    description: 'Monitor competitor content, identify trending topics, and get proprietary angle suggestions that position you as the thought leader.',
    color: 'bg-rose-50 text-rose-600',
  },
];

const PLATFORMS_OUTPUT = [
  { icon: Hash, label: 'X/Twitter Thread', color: '#1DA1F2' },
  { icon: AtSign, label: 'LinkedIn Post', color: '#0A66C2' },
  { icon: Camera, label: 'Instagram Caption', color: '#E4405F' },
  { icon: Mail, label: 'Email Newsletter', color: '#6366f1' },
  { icon: FileText, label: 'SEO Blog Post', color: '#059669' },
  { icon: Play, label: 'YouTube Package', color: '#FF0000' },
  { icon: Video, label: 'Video Scripts', color: '#8B5CF6' },
];

const TESTIMONIALS = [
  {
    quote: "Content Factory replaced our $4,500/month agency. In the first 60 days, we attributed $180K in pipeline directly to content it generated. The ROI is absurd.",
    name: "Sarah Chen",
    title: "CEO, Meridian Consulting",
    metric: "$180K pipeline in 60 days",
  },
  {
    quote: "I was spending 12 hours a week on content with zero way to measure results. Now I spend 15 minutes reviewing AI-generated content that actually sounds like me.",
    name: "Marcus Rivera",
    title: "Founder, Atlas Advisory Group",
    metric: "12hrs to 15min per week",
  },
  {
    quote: "The revenue attribution alone is worth 10x the price. For the first time, I can see exactly which LinkedIn post led to a $45K deal. No other tool does this.",
    name: "Jennifer Walsh",
    title: "Managing Partner, Apex Strategy",
    metric: "$45K deal attributed to one post",
  },
];

const COMPARISON = [
  { feature: 'AI Content Generation', us: true, agency: true, tools: true },
  { feature: 'Brand Voice Cloning', us: true, agency: false, tools: false },
  { feature: '7-Platform Output', us: true, agency: false, tools: true },
  { feature: 'Revenue Attribution', us: true, agency: false, tools: false },
  { feature: 'CRM Integration', us: true, agency: false, tools: false },
  { feature: 'Predictive Strategy', us: true, agency: false, tools: false },
  { feature: 'Monthly Cost', us: '$900', agency: '$4,500+', tools: '$500+' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Zap className="text-white" size={18} />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">Content Factory</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Results</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-ghost hidden sm:inline-flex">Sign In</Link>
              <Link href="/signup" className="btn-primary gap-1.5 text-sm px-5 py-2.5">
                Start Free Trial
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 via-white to-white" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-100/30 rounded-full blur-3xl" />
        
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium mb-6">
            <Sparkles size={14} />
            The Growth Operating System
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6 text-balance">
            One input. Seven platforms.{' '}
            <span className="gradient-text">Revenue you can track.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Turn your expertise into a 24/7 inbound pipeline machine. Elite AI content that sounds like you, 
            published everywhere, with closed-loop revenue attribution.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/signup" className="btn-primary text-base px-8 py-4 rounded-2xl gap-2 shadow-glow hover:shadow-glow-lg">
              Start Your Free Trial
              <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-ghost text-base gap-2 px-6 py-4">
              <Play size={16} className="text-brand-600" />
              See How It Works
            </a>
          </div>

          {/* Platform output preview */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {PLATFORMS_OUTPUT.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-soft"
              >
                <p.icon size={16} style={{ color: p.color }} />
                <span className="text-sm text-slate-600 font-medium">{p.label}</span>
              </div>
            ))}
          </div>

          {/* Social proof bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white" />
                ))}
              </div>
              <span className="ml-1">500+ B2B companies</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
              ))}
              <span className="ml-1">4.9/5 average rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-sm text-slate-400 font-medium mb-6 uppercase tracking-wider">
            Trusted by growth-focused B2B companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-40">
            {['Meridian', 'Atlas Group', 'Apex Strategy', 'Pinnacle', 'Vertex', 'Summit'].map(name => (
              <span key={name} className="text-xl font-bold text-slate-900 tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 lg:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge-danger mb-4 inline-flex">The $15 Billion Problem</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              You&apos;re spending on content with zero proof it works
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              68% of marketers cannot attribute revenue to their content. You&apos;re either overpaying an agency, 
              burning hours on generic AI tools, or doing nothing — and leaving pipeline on the table.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'Content Agency', cost: '$4,500/mo', problem: 'Generic content, zero attribution, slow turnaround', icon: DollarSign },
              { label: 'In-House Hire', cost: '$6,500/mo', problem: 'One person, limited capacity, still no ROI tracking', icon: Users },
              { label: 'Tool Stack', cost: '$500/mo + 20hrs/wk', problem: 'Fragmented, disconnected, no revenue connection', icon: Globe },
            ].map((item, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-danger-50 flex items-center justify-center mx-auto mb-4">
                  <item.icon size={22} className="text-danger-500" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{item.label}</h3>
                <p className="text-2xl font-bold text-danger-600 mb-2">{item.cost}</p>
                <p className="text-sm text-slate-500">{item.problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 px-4 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge-brand mb-4 inline-flex">5 Subsystems, One Platform</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Not a content tool. A revenue machine.
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Five interconnected subsystems that each deliver standalone value — and become exponentially 
              more powerful when connected.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className={cn('card-hover p-6', i === 2 && 'md:col-span-2 lg:col-span-1')}>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', feature.color)}>
                  <feature.icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 lg:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge-brand mb-4 inline-flex">How It Works</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              From one input to seven platforms in minutes
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Feed it anything',
                description: 'A topic, a URL, raw notes, a podcast episode, a client case study. The engine accepts any form of your expertise as input.',
              },
              {
                step: '02',
                title: 'AI generates 7 outputs',
                description: 'Using your trained brand voice and 12 proven copywriting frameworks, the engine produces platform-optimized content for Twitter, LinkedIn, Instagram, email, blog, YouTube, and video scripts.',
              },
              {
                step: '03',
                title: 'Review, edit, publish',
                description: 'Each piece gets a quality score. Edit inline, regenerate any output, or approve and schedule. Total time: 12 minutes per week.',
              },
              {
                step: '04',
                title: 'Track to revenue',
                description: 'Smart links track every click. CRM integration maps content engagement to pipeline. Monthly reports show exactly which posts generated deals.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed max-w-xl">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-28 px-4 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge-success mb-4 inline-flex">Real Results</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              The numbers speak for themselves
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.title}</p>
                    </div>
                  </div>
                  <div className="badge-success text-xs">{t.metric}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 lg:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Content Factory vs. the alternatives
            </h2>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Feature</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-brand-700 bg-brand-50/50">Content Factory</th>
                    <th className="text-center py-4 px-4 text-sm font-medium text-slate-500">Agency</th>
                    <th className="text-center py-4 px-4 text-sm font-medium text-slate-500">Tool Stack</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="py-3.5 px-6 text-sm text-slate-700 font-medium">{row.feature}</td>
                      <td className="py-3.5 px-4 text-center bg-brand-50/30">
                        {typeof row.us === 'boolean' ? (
                          row.us ? <Check size={18} className="text-brand-600 mx-auto" /> : <span className="text-slate-300">—</span>
                        ) : (
                          <span className="text-sm font-semibold text-brand-700">{row.us}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof row.agency === 'boolean' ? (
                          row.agency ? <Check size={18} className="text-slate-400 mx-auto" /> : <span className="text-slate-300">—</span>
                        ) : (
                          <span className="text-sm text-slate-500">{row.agency}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof row.tools === 'boolean' ? (
                          row.tools ? <Check size={18} className="text-slate-400 mx-auto" /> : <span className="text-slate-300">—</span>
                        ) : (
                          <span className="text-sm text-slate-500">{row.tools}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 px-4 bg-slate-50/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="badge-brand mb-4 inline-flex">Simple Pricing</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              One plan. Everything included.
            </h2>
            <p className="text-lg text-slate-500">
              No tiers, no hidden fees, no credit limits. The full Growth Operating System.
            </p>
          </div>

          <div className="card p-8 lg:p-10 max-w-xl mx-auto border-brand-200 shadow-glow">
            <div className="text-center mb-8">
              <div className="badge-brand mb-4 inline-flex">Most Popular</div>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-bold text-slate-900">$900</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-sm text-slate-500">14-day free trial. Cancel anytime.</p>
            </div>

            <div className="space-y-3 mb-8">
              {[
                'Unlimited AI content generation',
                'All 7 platform outputs',
                'Neural Voice Engine (learns your voice)',
                '12 proven copywriting frameworks',
                'Revenue attribution dashboard',
                'CRM integration (HubSpot, Salesforce, Pipedrive)',
                'Predictive content strategy',
                'Competitive intelligence',
                'Content library with search',
                'Priority support',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-brand-700" />
                  </div>
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <Link href="/signup" className="btn-primary w-full text-base py-4 gap-2 rounded-2xl">
              Start Your Free Trial
              <ArrowRight size={18} />
            </Link>

            <p className="text-center text-xs text-slate-400 mt-4">
              No credit card required for trial
            </p>
          </div>

          {/* ROI Math */}
          <div className="mt-12 card p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
              The ROI Math: Why $900/month is a no-brainer
            </h3>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-700">0.72</p>
                <p className="text-sm text-slate-500 mt-1">Leads/month to break even</p>
                <p className="text-xs text-slate-400 mt-0.5">At $5K avg deal size</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-700">900%</p>
                <p className="text-sm text-slate-500 mt-1">Average annual ROI</p>
                <p className="text-xs text-slate-400 mt-0.5">At 3 leads/month</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-700">$97K</p>
                <p className="text-sm text-slate-500 mt-1">Annual profit from platform</p>
                <p className="text-xs text-slate-400 mt-0.5">At $10K avg deal size</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="gradient-bg rounded-3xl p-10 lg:p-16 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
                Stop creating content that can&apos;t prove its value
              </h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
                Join 500+ B2B companies using Content Factory to turn expertise into measurable pipeline. 
                Your first content is ready in 10 minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-brand-700 bg-white rounded-2xl hover:bg-white/90 transition-all gap-2 shadow-xl"
                >
                  Start Your Free Trial
                  <ArrowRight size={18} />
                </Link>
              </div>
              <p className="text-white/50 text-sm mt-4">14 days free. No credit card required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
                <Zap className="text-white" size={14} />
              </div>
              <span className="font-bold text-slate-900">Content Factory</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
            </div>
            <p className="text-sm text-slate-400">
              &copy; 2026 Content Factory. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
