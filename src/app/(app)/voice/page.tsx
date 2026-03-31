'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VoicePage() {
  const router = useRouter();
  useEffect(() => { router.replace('/voice-dna'); }, [router]);
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-500">Redirecting to Voice DNA...</p>
    </div>
  );
}
