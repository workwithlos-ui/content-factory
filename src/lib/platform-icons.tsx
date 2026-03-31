import { Hash, AtSign, Camera, Mail, FileText } from 'lucide-react';

export const TwitterIcon = Hash;
export const LinkedinIcon = AtSign;
export const InstagramIcon = Camera;
export const MailIcon = Mail;
export const BlogIcon = FileText;

export const platformIcons: Record<string, any> = {
  twitter: TwitterIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  email: MailIcon,
  blog: BlogIcon,
};

export const platformColors: Record<string, string> = {
  twitter: 'bg-sky-950/50 text-sky-400 border-sky-800/50',
  linkedin: 'bg-blue-950/50 text-blue-400 border-blue-800/50',
  instagram: 'bg-pink-950/50 text-pink-400 border-pink-800/50',
  email: 'bg-indigo-950/50 text-indigo-400 border-indigo-800/50',
  blog: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50',
};

export const platformHexColors: Record<string, string> = {
  twitter: '#38bdf8',
  linkedin: '#60a5fa',
  instagram: '#f472b6',
  email: '#818cf8',
  blog: '#34d399',
};
