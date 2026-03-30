import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getQualityColor(score: number): string {
  if (score >= 8) return 'text-success-600';
  if (score >= 6) return 'text-brand-600';
  if (score >= 4) return 'text-warning-600';
  return 'text-danger-600';
}

export function getQualityBg(score: number): string {
  if (score >= 8) return 'bg-success-50 text-success-700';
  if (score >= 6) return 'bg-brand-50 text-brand-700';
  if (score >= 4) return 'bg-warning-50 text-warning-600';
  return 'bg-danger-50 text-danger-600';
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    instagram: '#E4405F',
    email: '#6366f1',
    blog: '#059669',
    youtube: '#FF0000',
    'video-script': '#8B5CF6',
  };
  return colors[platform] || '#64748b';
}

export function downloadAsZip(pieces: { platform: string; content: string }[], projectTitle: string) {
  // Simple text download for now
  const combined = pieces.map(p => 
    `=== ${p.platform.toUpperCase()} ===\n\n${p.content}\n\n`
  ).join('\n---\n\n');
  
  const blob = new Blob([combined], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectTitle.replace(/\s+/g, '-').toLowerCase()}-content.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
