'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  PenTool,
  Library,
  BarChart3,
  Settings,
  Mic2,
  LogOut,
  Menu,
  X,
  Zap,
  ChevronRight,
  User,
  Lightbulb,
  Shield,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Create Content', href: '/content/new', icon: PenTool },
  { name: 'Topic Generator', href: '/topics', icon: Lightbulb },
  { name: 'Content Library', href: '/library', icon: Library },
  { name: 'Brand Voice', href: '/voice', icon: Mic2 },
  { name: 'Competitive Intel', href: '/competitive', icon: Shield },
  { name: 'UTM Tracking', href: '/utm', icon: Link2 },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[260px] bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Content Factory
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <item.icon
                  size={19}
                  className={cn(
                    'flex-shrink-0 transition-colors',
                    isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                <span>{item.name}</span>
                {isActive && (
                  <ChevronRight size={14} className="ml-auto text-brand-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick create button */}
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

        {/* User section */}
        <div className="px-3 pb-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
              <User size={14} className="text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email || ''}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-[260px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 mr-3"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="badge-brand">
              <Zap size={12} className="mr-1" />
              Pro Plan
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
