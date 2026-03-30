import { Hash, AtSign, Camera, Mail, FileText, Play, Video, Globe } from 'lucide-react';

// lucide-react v1.7 removed brand icons (Twitter, Linkedin, etc.)
// We use generic lucide icons as replacements that convey the platform
export const TwitterIcon = Hash;       // # for Twitter/X
export const LinkedinIcon = AtSign;    // @ for LinkedIn
export const InstagramIcon = Camera;   // Camera for Instagram
export const MailIcon = Mail;          // Mail for Email
export const BlogIcon = FileText;      // FileText for Blog
export const YoutubeIcon = Play;       // Play for YouTube
export const VideoIcon = Video;        // Video for Video Scripts

export const platformIcons: Record<string, any> = {
  twitter: TwitterIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  email: MailIcon,
  blog: BlogIcon,
  youtube: YoutubeIcon,
  'video-script': VideoIcon,
};

export const platformColors: Record<string, string> = {
  twitter: 'bg-sky-50 text-sky-600 border-sky-200',
  linkedin: 'bg-blue-50 text-blue-600 border-blue-200',
  instagram: 'bg-pink-50 text-pink-600 border-pink-200',
  email: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  blog: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  youtube: 'bg-red-50 text-red-600 border-red-200',
  'video-script': 'bg-purple-50 text-purple-600 border-purple-200',
};

export const platformHexColors: Record<string, string> = {
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  instagram: '#E4405F',
  email: '#6366f1',
  blog: '#059669',
  youtube: '#FF0000',
  'video-script': '#8B5CF6',
};
