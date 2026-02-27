"use client";
import React from 'react';
import ChatInterface from '@/components/dashboard/ChatInterface';

export default function ChatPage() {
    return (
        // Restore full-bleed wrapper like previous setup so the connections view fills height
        <div className="-mx-4 sm:-mx-6 md:-mx-8 -my-4 sm:-my-6 h-[calc(100vh-4rem)] md:pb-0">
            <ChatInterface />
        </div>
    );
}
