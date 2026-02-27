"use client";

import React from 'react';
import ChatInterface from '@/components/dashboard/ChatInterface';
import { useParams } from 'next/navigation';

export default function ChatConversationPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  return (
    <div className="-mx-4 sm:-mx-6 md:-mx-8 -my-4 sm:-my-6 h-[calc(100vh-4rem)] md:pb-0 overflow-hidden">
      <ChatInterface selectedContactId={id} standalone />
    </div>
  );
}

