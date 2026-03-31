'use client';

import { useState, useEffect } from 'react';
import { getContentExamples, addContentExample, deleteContentExample, updateContentExample } from '@/lib/storage';
import { ContentExample, Platform } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { BookOpen, Plus, Trash2, Tag, X, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLATFORM_OPTIONS: { key: Platform | 'general'; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'twitter', label: 'Twitter/X' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'email', label: 'Email' },
  { key: 'blog', label: 'Blog' },
];

const TYPE_OPTIONS = ['hook', 'thread', 'carousel caption', 'newsletter', 'blog post', 'story', 'framework breakdown', 'contrarian take', 'how-to', 'other'];

export default function ExamplesPage() {
  const [examples, setExamples] = useState<ContentExample[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState<Platform | 'general'>('general');
  const [contentType, setContentType] = useState('hook');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  useEffect(() => {
    setExamples(getContentExamples());
  }, []);

  const handleAdd = () => {
    if (!content.trim()) return;
    const example: ContentExample = {
      id: uuidv4(),
      title: title || content.slice(0, 60) + '...',
      content,
      platform,
      contentType,
      tags: [platform, contentType],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addContentExample(example);
    setExamples(getContentExamples());
    setTitle('');
    setContent('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    deleteContentExample(id);
    setExamples(getContentExamples());
  };

  const handleAnalyze = async (id: string) => {
    setAnalyzing(id);
    try {
      const example = examples.find(e => e.id === id);
      if (!example) return;
      const res = await fetch('/api/analyze-example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: example.content }),
      });
      const data = await res.json();
      if (data.patterns) {
        updateContentExample(id, { analyzedPatterns: data.patterns });
        setExamples(getContentExamples());
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    }
    setAnalyzing(null);
  };

  const filtered = filterPlatform === 'all' ? examples : examples.filter(e => e.platform === filterPlatform);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-700/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            Content Examples Library
          </h1>
          <p className="text-slate-500 mt-2">Paste examples of content you love. The AI uses these as few-shot examples to match your tone and style.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary gap-2">
          <Plus size={16} /> Add Example
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterPlatform('all')} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all border', filterPlatform === 'all' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}>
          All ({examples.length})
        </button>
        {PLATFORM_OPTIONS.map(p => {
          const count = examples.filter(e => e.platform === p.key).length;
          if (count === 0) return null;
          return (
            <button key={p.key} onClick={() => setFilterPlatform(p.key)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all border', filterPlatform === p.key ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}>
              {p.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="card p-6 space-y-4 border-indigo-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Add Content Example</h3>
            <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
          </div>
          <div>
            <label className="label">Title (optional)</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g., My best LinkedIn hook" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value as any)} className="select-field">
                {PLATFORM_OPTIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Content Type</label>
              <select value={contentType} onChange={e => setContentType(e.target.value)} className="select-field">
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} className="textarea-field" rows={8} placeholder="Paste the content example here..." />
          </div>
          <button onClick={handleAdd} className="btn-primary gap-2"><Plus size={16} /> Add to Library</button>
        </div>
      )}

      {/* Examples List */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No examples yet</h3>
          <p className="text-slate-600 text-sm mb-4">Add 5-10 examples of content you&apos;ve written or content you love. The AI will match the tone and structure.</p>
          <button onClick={() => setShowAdd(true)} className="btn-secondary gap-2"><Plus size={16} /> Add Your First Example</button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(example => (
            <div key={example.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white text-sm">{example.title}</h3>
                  <div className="flex gap-2 mt-1.5">
                    <span className="badge-brand text-xs">{example.platform}</span>
                    <span className="badge text-xs bg-white/[0.04] text-slate-400 border border-white/[0.06]">{example.contentType}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAnalyze(example.id)}
                    disabled={analyzing === example.id}
                    className="btn-ghost text-xs gap-1"
                  >
                    {analyzing === example.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Analyze
                  </button>
                  <button onClick={() => handleDelete(example.id)} className="btn-ghost text-xs text-red-400 hover:text-red-300">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap bg-white/[0.02] rounded-lg p-3 border border-white/[0.04] max-h-40 overflow-y-auto">
                {example.content}
              </div>
              {example.analyzedPatterns && (
                <div className="bg-indigo-950/20 rounded-lg p-3 border border-indigo-800/20">
                  <p className="text-xs font-semibold text-indigo-400 mb-1 flex items-center gap-1"><Sparkles size={10} /> AI-Extracted Patterns</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{example.analyzedPatterns}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
