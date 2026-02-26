"use client";
import React from 'react';
import ChatInterface from '@/components/dashboard/ChatInterface';

export default function ChatPage() {
    return (
        // Escape the parent layout's padded wrapper to go full-bleed
        <div className="-mx-4 sm:-mx-6 md:-mx-8 -my-6 h-[calc(100vh-4rem)] pb-16 md:pb-0">
            <ChatInterface />
        </div>
    );
}
