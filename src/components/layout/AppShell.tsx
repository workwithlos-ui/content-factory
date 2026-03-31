'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard, PenTool, Library, Settings, Mic2, LogOut,
  Menu, X, Zap, ChevronRight, User, Lightbulb, Users, BookOpen,
  Shuffle, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Create Content', href: '/content/new', icon: PenTool },
  { name: 'Content Remix', href: '/remix', icon: Shuffle },
  { name: 'Content Library', href: '/library', icon: Library },
  { name: 'Brand Voice DNA', href: '/voice-dna', icon: Mic2 },
  { name: 'Examples Library', href: '/examples', icon: BookOpen },
  { name: 'Audience Profiles', href: '/audiences', icon: Users },
  { name: 'Topic Generator', href: '/topics', icon: Lightbulb },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[260px] bg-[#0c0c14] border-r border-white/[0.06] flex flex-col transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-glow">
              <Zap className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Content Factory
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-white/5"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                    : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 border border-transparent'
                )}
              >
                <item.icon
                  size={18}
                  className={cn(
                    'flex-shrink-0 transition-colors',
                    isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'
                  )}
                />
                <span>{item.name}</span>
                {isActive && (
                  <ChevronRight size={14} className="ml-auto text-indigo-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3">
          <Link
            href="/content/new"
            className="btn-primary w-full gap-2"
            onClick={() => setSidebarOpen(false)}
          >
            <PenTool size={16} />
            Create Content
          </Link>
        </div>

        <div className="px-3 pb-4 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-950/50 border border-indigo-800/30 flex items-center justify-center">
              <User size={14} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-600 truncate">
                {user?.email || ''}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-slate-400 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.04] flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/5 mr-3"
          >
            <Menu size={20} className="text-slate-400" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs">
              <Zap size={12} className="mr-1" />
              Pro Engine
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
