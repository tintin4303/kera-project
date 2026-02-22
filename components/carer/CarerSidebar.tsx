"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, MessageSquare, Calendar, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/components/LanguageContext';

export const carerNavigation = [
    { name: 'nav.dashboard', href: '/carer', icon: Home },
    { name: 'nav.patients', href: '/carer/patients', icon: Users },
    { name: 'nav.chat', href: '/carer/chat', icon: MessageSquare },
    { name: 'nav.schedule', href: '/carer/schedule', icon: Calendar },
    { name: 'nav.profile', href: '/carer/profile', icon: User },
];

export default function CarerSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { t } = useLanguage();


    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="flex items-center h-16 shrink-0 px-4 bg-kera-dark/5">
                <Link href="/carer" className="flex items-center gap-2">
                    <div className="bg-kera-dark p-1.5 rounded-lg mr-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L12 22" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            <path d="M2 12L22 12" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">KERA</span>
                    <span className="text-xs bg-accent text-primary px-2 py-0.5 rounded-full font-semibold">Carer</span>
                </Link>
            </div>

            {/* Nav Links */}
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {carerNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? 'bg-accent text-primary'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 shrink-0 h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                />
                                {t(item.name)}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile */}
            <div className="shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center w-full">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {session?.user?.name || 'Carer'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {session?.user?.email}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
