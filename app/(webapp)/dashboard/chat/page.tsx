"use client";
import React from 'react';
import ChatInterface from '@/components/dashboard/ChatInterface';

export default function ChatPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chat with Carers</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Communicate directly with the carers looking after your family.
                    </p>
                </div>
            </div>

            <ChatInterface />
        </div>
    );
}
