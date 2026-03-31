'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { Zap, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';

function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const result = signup(email, password, name);
    if (result.success) {
      router.push('/onboarding');
    } else {
      setError(result.error || 'Signup failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2.5 mb-10">
              <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center shadow-glow">
                <Zap className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Content Factory</span>
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">Start your free trial</h1>
            <p className="text-slate-500 mt-1.5">Build content that doesn&apos;t sound like AI.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/50 text-red-400 text-sm border border-red-900/50">
                {error}
              </div>
            )}

            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Sarah Johnson"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="label">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="sarah@company.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full gap-2"
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 font-medium hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Social proof */}
      <div className="hidden lg:flex flex-1 gradient-bg items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="mb-8">
            <div className="flex -space-x-2 mb-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-white/90 text-lg font-medium mb-1">
              Join 500+ B2B companies
            </p>
            <p className="text-white/60">
              Already using Content Factory to drive pipeline
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-white/90 text-lg leading-relaxed mb-4">
              &ldquo;Content Factory replaced our $4,500/month agency and actually shows us which posts generate pipeline. We saw ROI in the first month.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-medium">
                S
              </div>
              <div>
                <p className="font-medium text-white">Sarah Chen</p>
                <p className="text-white/60 text-sm">CEO, Meridian Consulting</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: 'Avg. ROI', value: '12x' },
              { label: 'Time Saved', value: '15h/wk' },
              { label: 'Pipeline', value: '+340%' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthProvider>
      <SignupForm />
    </AuthProvider>
  );
}
