"use client";
import React from 'react';
import Link from 'next/link';
import { Menu, LogOut, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

export default function DashboardHeader({ onMenuClick }: { onMenuClick: () => void }) {
    const { data: session } = useSession();

    return (
        <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
            <div className="flex items-center">
                <button
                    className="mr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={onMenuClick}
                >
                    <Menu className="h-6 w-6" />
                </button>
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
            <div className="flex items-center gap-3">
                {/* Mobile Profile Icon */}
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {session?.user?.image ? (
                        <img src={session.user.image} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <User className="h-5 w-5 text-gray-500" />
                    )}
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-gray-400 hover:text-red-500 p-1"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
