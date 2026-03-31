'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { getScheduledPosts, saveScheduledPost, deleteScheduledPost, updateScheduledPost, getProjects } from '@/lib/storage';
import { ScheduledPost, Platform, PLATFORMS, ContentProject } from '@/types';
import { platformIcons, platformColors } from '@/lib/platform-icons';
import { cn } from '@/lib/utils';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Copy, Check,
  Trash2, Edit3, X, GripVertical, List, LayoutGrid, Eye, Repeat, AlertCircle
} from 'lucide-react';

type ViewMode = 'month' | 'week' | 'day';

const PLATFORM_CALENDAR_COLORS: Record<string, string> = {
  linkedin: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  twitter: 'bg-slate-500/20 border-slate-400/40 text-slate-200',
  instagram: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/40 text-pink-300',
  email: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  blog: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
};

const STATUS_BADGES: Record<string, { label: string; class: string }> = {
  draft: { label: 'Draft', class: 'bg-slate-800/50 text-slate-400 border-slate-700/50' },
  scheduled: { label: 'Scheduled', class: 'bg-indigo-950/50 text-indigo-400 border-indigo-800/50' },
  published: { label: 'Published', class: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const wd = new Date(d);
    wd.setDate(diff + i);
    dates.push(wd);
  }
  return dates;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showQueueView, setShowQueueView] = useState(false);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [draggedPost, setDraggedPost] = useState<string | null>(null);

  // Schedule modal state
  const [modalPlatform, setModalPlatform] = useState<Platform>('linkedin');
  const [modalContent, setModalContent] = useState('');
  const [modalDate, setModalDate] = useState('');
  const [modalTime, setModalTime] = useState('09:00');
  const [modalStatus, setModalStatus] = useState<'draft' | 'scheduled'>('scheduled');
  const [modalRecurring, setModalRecurring] = useState(false);
  const [modalFrequency, setModalFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [selectedProjectPiece, setSelectedProjectPiece] = useState<string>('');

  useEffect(() => {
    setPosts(getScheduledPosts());
    setProjects(getProjects());
  }, []);

  const postsByDate = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {};
    posts.forEach(p => {
      if (!map[p.scheduledDate]) map[p.scheduledDate] = [];
      map[p.scheduledDate].push(p);
    });
    // Sort each day's posts by time
    Object.keys(map).forEach(k => {
      map[k].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    });
    return map;
  }, [posts]);

  const upcomingPosts = useMemo(() => {
    const today = formatDateKey(new Date());
    return posts
      .filter(p => p.scheduledDate >= today && p.status !== 'published')
      .sort((a, b) => a.scheduledDate === b.scheduledDate
        ? a.scheduledTime.localeCompare(b.scheduledTime)
        : a.scheduledDate.localeCompare(b.scheduledDate));
  }, [posts]);

  const openScheduleModal = (date?: string, post?: ScheduledPost) => {
    if (post) {
      setEditingPost(post);
      setModalPlatform(post.platform);
      setModalContent(post.content);
      setModalDate(post.scheduledDate);
      setModalTime(post.scheduledTime);
      setModalStatus(post.status === 'published' ? 'scheduled' : post.status);
      setModalRecurring(post.recurring?.enabled || false);
      setModalFrequency(post.recurring?.frequency || 'weekly');
    } else {
      setEditingPost(null);
      setModalPlatform('linkedin');
      setModalContent('');
      setModalDate(date || formatDateKey(new Date()));
      setModalTime('09:00');
      setModalStatus('scheduled');
      setModalRecurring(false);
      setModalFrequency('weekly');
    }
    setSelectedProjectPiece('');
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = () => {
    if (!modalContent.trim() || !modalDate) return;
    const post: ScheduledPost = {
      id: editingPost?.id || uuidv4(),
      contentPieceId: editingPost?.contentPieceId,
      projectId: editingPost?.projectId,
      platform: modalPlatform,
      content: modalContent,
      scheduledDate: modalDate,
      scheduledTime: modalTime,
      status: modalStatus,
      recurring: modalRecurring ? { enabled: true, frequency: modalFrequency, dayOfWeek: new Date(modalDate).getDay() } : undefined,
      createdAt: editingPost?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveScheduledPost(post);
    setPosts(getScheduledPosts());
    setShowScheduleModal(false);
  };

  const handleDeletePost = (id: string) => {
    deleteScheduledPost(id);
    setPosts(getScheduledPosts());
  };

  const handleCopyContent = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMarkPublished = (id: string) => {
    updateScheduledPost(id, { status: 'published' });
    setPosts(getScheduledPosts());
  };

  const handleDrop = (dateKey: string) => {
    if (!draggedPost) return;
    updateScheduledPost(draggedPost, { scheduledDate: dateKey });
    setPosts(getScheduledPosts());
    setDraggedPost(null);
  };

  const handleLoadFromProject = (value: string) => {
    setSelectedProjectPiece(value);
    if (!value) return;
    const [projId, pieceIdx] = value.split('::');
    const proj = projects.find(p => p.id === projId);
    if (proj && proj.pieces[parseInt(pieceIdx)]) {
      const piece = proj.pieces[parseInt(pieceIdx)];
      setModalContent(piece.content);
      setModalPlatform(piece.platform);
    }
  };

  const navigateDate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  // Render month view
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = formatDateKey(new Date());
    const cells: React.ReactNode[] = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-[100px] bg-white/[0.01] rounded-lg border border-white/[0.03]" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayPosts = postsByDate[dateKey] || [];
      const isToday = dateKey === today;

      cells.push(
        <div
          key={dateKey}
          className={cn(
            'min-h-[100px] rounded-lg border p-1.5 transition-all cursor-pointer hover:border-white/[0.12]',
            isToday ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-white/[0.02] border-white/[0.06]'
          )}
          onClick={() => openScheduleModal(dateKey)}
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(dateKey)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={cn('text-xs font-medium', isToday ? 'text-indigo-400' : 'text-slate-500')}>{day}</span>
            {dayPosts.length > 0 && <span className="text-[10px] text-slate-600">{dayPosts.length}</span>}
          </div>
          <div className="space-y-0.5">
            {dayPosts.slice(0, 3).map(post => {
              const Icon = platformIcons[post.platform];
              return (
                <div
                  key={post.id}
                  draggable
                  onDragStart={(e) => { e.stopPropagation(); setDraggedPost(post.id); }}
                  onClick={(e) => { e.stopPropagation(); openScheduleModal(undefined, post); }}
                  className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border cursor-grab active:cursor-grabbing', PLATFORM_CALENDAR_COLORS[post.platform] || 'bg-slate-800/50 border-slate-700/50 text-slate-400')}
                >
                  {Icon && <Icon size={10} />}
                  <span className="truncate flex-1">{post.content.slice(0, 25)}</span>
                  <span className="text-[9px] opacity-60">{post.scheduledTime}</span>
                </div>
              );
            })}
            {dayPosts.length > 3 && <p className="text-[10px] text-slate-600 pl-1">+{dayPosts.length - 3} more</p>}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_NAMES.map(d => <div key={d} className="text-center text-xs font-medium text-slate-600 py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">{cells}</div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const today = formatDateKey(new Date());
    const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm

    return (
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-0 min-w-[800px]">
          {/* Header row */}
          <div className="p-2 text-xs text-slate-600 border-b border-white/[0.06]" />
          {weekDates.map(d => {
            const dk = formatDateKey(d);
            const isToday = dk === today;
            return (
              <div key={dk} className={cn('p-2 text-center border-b', isToday ? 'border-indigo-500/30 bg-indigo-950/10' : 'border-white/[0.06]')}>
                <p className={cn('text-xs font-medium', isToday ? 'text-indigo-400' : 'text-slate-500')}>{DAY_NAMES[d.getDay()]}</p>
                <p className={cn('text-lg font-bold', isToday ? 'text-indigo-300' : 'text-slate-300')}>{d.getDate()}</p>
              </div>
            );
          })}

          {/* Time slots */}
          {hours.map(hour => (
            <>
              <div key={`h-${hour}`} className="p-2 text-xs text-slate-600 border-b border-white/[0.04] text-right pr-3">
                {hour > 12 ? `${hour - 12}pm` : hour === 12 ? '12pm' : `${hour}am`}
              </div>
              {weekDates.map(d => {
                const dk = formatDateKey(d);
                const hourStr = String(hour).padStart(2, '0');
                const dayPosts = (postsByDate[dk] || []).filter(p => p.scheduledTime.startsWith(hourStr));
                return (
                  <div
                    key={`${dk}-${hour}`}
                    className="border-b border-l border-white/[0.04] p-0.5 min-h-[48px] hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => { setModalTime(`${hourStr}:00`); openScheduleModal(dk); }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDrop(dk)}
                  >
                    {dayPosts.map(post => {
                      const Icon = platformIcons[post.platform];
                      return (
                        <div
                          key={post.id}
                          draggable
                          onDragStart={() => setDraggedPost(post.id)}
                          onClick={(e) => { e.stopPropagation(); openScheduleModal(undefined, post); }}
                          className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border mb-0.5 cursor-grab', PLATFORM_CALENDAR_COLORS[post.platform])}
                        >
                          {Icon && <Icon size={10} />}
                          <span className="truncate">{post.content.slice(0, 20)}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dk = formatDateKey(currentDate);
    const dayPosts = postsByDate[dk] || [];
    const hours = Array.from({ length: 18 }, (_, i) => i + 6);

    return (
      <div className="space-y-0">
        <div className="text-center mb-4">
          <p className="text-lg font-bold text-white">{DAY_NAMES[currentDate.getDay()]}, {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getDate()}</p>
          <p className="text-sm text-slate-500">{dayPosts.length} scheduled post{dayPosts.length !== 1 ? 's' : ''}</p>
        </div>
        {hours.map(hour => {
          const hourStr = String(hour).padStart(2, '0');
          const hourPosts = dayPosts.filter(p => p.scheduledTime.startsWith(hourStr));
          return (
            <div key={hour} className="flex gap-4 border-b border-white/[0.04] min-h-[60px]">
              <div className="w-16 py-3 text-right pr-2 text-xs text-slate-600 flex-shrink-0">
                {hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`}
              </div>
              <div
                className="flex-1 py-2 hover:bg-white/[0.02] cursor-pointer px-2"
                onClick={() => { setModalTime(`${hourStr}:00`); openScheduleModal(dk); }}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(dk)}
              >
                {hourPosts.map(post => {
                  const Icon = platformIcons[post.platform];
                  const statusInfo = STATUS_BADGES[post.status];
                  return (
                    <div
                      key={post.id}
                      draggable
                      onDragStart={() => setDraggedPost(post.id)}
                      onClick={(e) => { e.stopPropagation(); openScheduleModal(undefined, post); }}
                      className={cn('p-3 rounded-xl border mb-2 cursor-grab', PLATFORM_CALENDAR_COLORS[post.platform])}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {Icon && <Icon size={14} />}
                        <span className="text-xs font-semibold">{PLATFORMS.find(p => p.key === post.platform)?.label}</span>
                        <span className={cn('badge border text-[10px]', statusInfo?.class)}>{statusInfo?.label}</span>
                        <span className="text-[10px] opacity-60 ml-auto">{post.scheduledTime}</span>
                      </div>
                      <p className="text-xs opacity-80 line-clamp-2">{post.content.slice(0, 120)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
            </div>
            Content Calendar
          </h1>
          <p className="text-slate-500 mt-1">{upcomingPosts.length} upcoming post{upcomingPosts.length !== 1 ? 's' : ''} scheduled</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowQueueView(!showQueueView)} className={cn('btn-ghost text-xs gap-1.5', showQueueView && 'bg-white/5 text-white')}>
            <List size={14} /> Queue
          </button>
          <button onClick={() => openScheduleModal()} className="btn-primary gap-2 text-sm">
            <Plus size={14} /> Schedule Post
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card p-4 flex items-start gap-3 border-amber-800/20 bg-amber-950/10">
        <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-300">Copy & Post Workflow</p>
          <p className="text-xs text-slate-500 mt-0.5">Scheduled posts will show a reminder at the scheduled time. Click "Copy & Post" to copy the content and post it manually to the platform. Direct API publishing is coming soon.</p>
        </div>
      </div>

      {showQueueView ? (
        /* Queue View */
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
            <h3 className="font-bold text-white">Upcoming Queue</h3>
            <span className="text-xs text-slate-500">{upcomingPosts.length} posts</span>
          </div>
          {upcomingPosts.length === 0 ? (
            <div className="p-10 text-center">
              <CalendarIcon className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No upcoming posts. Schedule some content!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {upcomingPosts.map(post => {
                const Icon = platformIcons[post.platform];
                const statusInfo = STATUS_BADGES[post.status];
                const postDate = new Date(post.scheduledDate + 'T' + post.scheduledTime);
                return (
                  <div key={post.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', platformColors[post.platform])}>
                      {Icon && <Icon size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-slate-200">{PLATFORMS.find(p => p.key === post.platform)?.label}</span>
                        <span className={cn('badge border text-[10px]', statusInfo?.class)}>{statusInfo?.label}</span>
                        {post.recurring?.enabled && <span className="badge border text-[10px] bg-violet-950/50 text-violet-400 border-violet-800/50"><Repeat size={8} className="mr-0.5" />Recurring</span>}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{post.content.slice(0, 100)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-slate-300">{postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-[10px] text-slate-600">{post.scheduledTime}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleCopyContent(post.content, post.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-white" title="Copy & Post">
                        {copiedId === post.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                      <button onClick={() => openScheduleModal(undefined, post)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-white" title="Edit">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleMarkPublished(post.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-emerald-400" title="Mark Published">
                        <Check size={14} />
                      </button>
                      <button onClick={() => handleDeletePost(post.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-red-400" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Calendar View */
        <div className="card p-4">
          {/* Calendar Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button onClick={() => navigateDate(-1)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400"><ChevronLeft size={18} /></button>
              <h2 className="text-lg font-bold text-white min-w-[200px] text-center">
                {viewMode === 'day'
                  ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
                  : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              </h2>
              <button onClick={() => navigateDate(1)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400"><ChevronRight size={18} /></button>
              <button onClick={() => setCurrentDate(new Date())} className="btn-ghost text-xs ml-2">Today</button>
            </div>
            <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5">
              {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all', viewMode === mode ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300')}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowScheduleModal(false)}>
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">{editingPost ? 'Edit Scheduled Post' : 'Schedule Content'}</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              {/* Load from existing content */}
              {projects.length > 0 && !editingPost && (
                <div>
                  <label className="label">Load from Library</label>
                  <select value={selectedProjectPiece} onChange={e => handleLoadFromProject(e.target.value)} className="select-field text-sm">
                    <option value="">Write new content...</option>
                    {projects.slice(0, 10).map(proj => (
                      proj.pieces.map((piece, idx) => (
                        <option key={`${proj.id}::${idx}`} value={`${proj.id}::${idx}`}>
                          {proj.title.slice(0, 40)} — {PLATFORMS.find(p => p.key === piece.platform)?.label}
                        </option>
                      ))
                    ))}
                  </select>
                </div>
              )}

              {/* Platform */}
              <div>
                <label className="label">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p.key}
                      onClick={() => setModalPlatform(p.key)}
                      className={cn('px-3 py-2 rounded-xl text-xs font-medium transition-all border', modalPlatform === p.key ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'text-slate-600 border-white/[0.06] hover:text-slate-400')}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="label">Content</label>
                <textarea value={modalContent} onChange={e => setModalContent(e.target.value)} className="textarea-field text-sm" rows={6} placeholder="Paste or write the content to schedule..." />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)} className="input-field text-sm" />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input type="time" value={modalTime} onChange={e => setModalTime(e.target.value)} className="input-field text-sm" />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="label">Status</label>
                <div className="flex gap-2">
                  <button onClick={() => setModalStatus('draft')} className={cn('px-4 py-2 rounded-xl text-xs font-medium border transition-all', modalStatus === 'draft' ? 'bg-slate-800/50 text-slate-300 border-slate-600/50' : 'text-slate-600 border-white/[0.06]')}>Draft</button>
                  <button onClick={() => setModalStatus('scheduled')} className={cn('px-4 py-2 rounded-xl text-xs font-medium border transition-all', modalStatus === 'scheduled' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'text-slate-600 border-white/[0.06]')}>Scheduled</button>
                </div>
              </div>

              {/* Recurring */}
              <div className="card p-3 bg-white/[0.02]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={modalRecurring} onChange={e => setModalRecurring(e.target.checked)} className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30" />
                  <span className="text-sm text-slate-300 font-medium">Recurring Post</span>
                  <Repeat size={14} className="text-slate-600" />
                </label>
                {modalRecurring && (
                  <div className="mt-3">
                    <select value={modalFrequency} onChange={e => setModalFrequency(e.target.value as any)} className="select-field text-sm">
                      <option value="daily">Every Day</option>
                      <option value="weekly">Every Week</option>
                      <option value="biweekly">Every 2 Weeks</option>
                      <option value="monthly">Every Month</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSaveSchedule} className="btn-primary flex-1 gap-2">
                  <CalendarIcon size={14} /> {editingPost ? 'Update Schedule' : 'Add to Calendar'}
                </button>
                {editingPost && (
                  <button onClick={() => { handleDeletePost(editingPost.id); setShowScheduleModal(false); }} className="btn-ghost text-red-400 hover:text-red-300">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
