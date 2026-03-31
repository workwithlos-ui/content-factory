'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!email || !password) { setError('Please fill in all fields.'); setLoading(false); return; }
    const result = login(email, password);
    if (result.success) { router.push('/dashboard'); } else { setError(result.error || 'Login failed.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2.5 mb-10">
              <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center shadow-glow">
                <Zap className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Content Factory</span>
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-slate-500 mt-1.5">Sign in to your Content Engine</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/50 text-red-400 text-sm border border-red-900/50">
                {error}
              </div>
            )}
            <div>
              <label className="label">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@company.com" autoComplete="email" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" placeholder="Enter your password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full gap-2">
              {loading ? <div className="spinner" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-indigo-400 font-medium hover:text-indigo-300">Start free</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 gradient-bg items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="max-w-md text-white relative z-10">
          <h2 className="text-3xl font-bold mb-4">The Anti-Slop Content Engine</h2>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Context engineering, not just prompts. Your brand voice, your audience, your examples. AI that literally cannot produce generic content.
          </p>
          <div className="space-y-4">
            {[
              'Brand Voice DNA injected into every prompt',
              'Platform-specific engines for each channel',
              'Post-generation quality filter with Human Score',
              'Content remix across all platforms',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
