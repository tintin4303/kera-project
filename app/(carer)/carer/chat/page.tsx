"use client";
import React from 'react';
import ChatInterface from '@/components/dashboard/ChatInterface';

export default function CarerChatPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary tracking-tight">Messages</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Chat with family members of the patients under your care.
                    </p>
                </div>
            </div>

            <ChatInterface />
        </div>
    );
}
