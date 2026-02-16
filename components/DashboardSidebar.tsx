"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, User, FileText, LogOut } from 'lucide-react';

const navigation = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
];

import { signOut, useSession } from 'next-auth/react';

export default function DashboardSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="flex items-center h-16 shrink-0 px-4 bg-kera-dark/5">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="bg-kera-dark p-1.5 rounded-lg mr-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L12 22" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            <path d="M2 12L22 12" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">KERA</span>
                </Link>
            </div>

            {/* Nav Links */}
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? 'bg-kera-vibrant/10 text-kera-vibrant'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-kera-vibrant' : 'text-gray-400 group-hover:text-gray-500'}`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User / Logout */}
            <div className="shrink-0 flex border-t border-gray-200 p-4">
                <div className="shrink-0 w-full group block">
                    <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-5 w-5" />
                            )}
                        </div>
                        <div className="ml-3 truncate max-w-[100px]">
                            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">
                                {session?.user?.name || 'User'}
                            </p>
                            <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                                View profile
                            </p>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="ml-auto shrink-0 bg-white p-1 rounded-full text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
