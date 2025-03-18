'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DialogueInterface from '@/components/DialogueInterface';
import { useStore } from '@/contexts/StoreContext';

export default function DialoguePage() {
  const router = useRouter();
  const { user, loading } = useStore();

  if (loading) {
    return (
      <div className="container mx-auto px-3 py-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <DialogueInterface />
    </div>
  );
}