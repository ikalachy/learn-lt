'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DialogueInterface from '@/components/DialogueInterface';
import { useStore } from '@/contexts/StoreContext';

export default function DialoguePage() {
  const router = useRouter();
  const { user, loading } = useStore();

  useEffect(() => {
    if (!loading && user?.telegramId !== "765663824") {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-3 py-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (user?.telegramId !== "765663824") {
    return null;
  }

  return (
    <div className="container mx-auto px-3 py-1">
      <DialogueInterface />
    </div>
  );
}