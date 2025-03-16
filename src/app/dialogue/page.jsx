'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DialogueInterface from '@/components/DialogueInterface';
import { useStore } from '@/contexts/StoreContext';

// List of authorized Telegram IDs
const AUTHORIZED_IDS = ["765663824", "227702136", "5291293144"];

export default function DialoguePage() {
  const router = useRouter();
  const { user, loading } = useStore();

  useEffect(() => {
    if (!loading && !AUTHORIZED_IDS.includes(user?.telegramId)) {
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

  if (!AUTHORIZED_IDS.includes(user?.telegramId)) {
    return null;
  }

  return (
    <div className="container mx-auto px-3 py-1">
      <DialogueInterface />
    </div>
  );
}