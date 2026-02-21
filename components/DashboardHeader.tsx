"use client";
import React from 'react';
import Link from 'next/link';

export default function DashboardHeader() {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 md:hidden">
            <div className="flex items-center justify-center h-14 px-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="bg-kera-dark p-1 rounded-md">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L12 22" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            <path d="M2 12L22 12" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-gray-900">KERA</span>
                </Link>
            </div>
        </header>
    );
}
