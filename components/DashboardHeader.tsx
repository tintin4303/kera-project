"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import MobileMenu from './MobileMenu';
import { dashboardNavigation } from './DashboardSidebar';

export default function DashboardHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session } = useSession();

    return (
        <>
            <header className="bg-white shadow-sm border-b border-gray-200 md:hidden sticky top-0 z-40">
                <div className="flex items-center justify-between h-14 px-4">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg"
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

                    <div className="w-10"></div> {/* Spacer for symmetry */}
                </div>
            </header>

            <MobileMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                items={dashboardNavigation}
                user={session?.user}
            />
        </>
    );
}
