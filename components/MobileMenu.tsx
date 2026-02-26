"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LogOut, ChevronRight, LucideIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useLanguage } from '@/components/LanguageContext';

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    items: NavItem[];
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default function MobileMenu({ isOpen, onClose, items, user }: MobileMenuProps) {
    const pathname = usePathname();
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 md:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-kera-dark/5">
                    <div className="flex items-center gap-2">
                        <div className="bg-kera-dark p-1 rounded">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L12 22" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                <path d="M2 12L22 12" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span className="font-bold text-gray-900">KERA Menu</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* User Info */}
                {user && (
                    <div className="p-4 bg-white border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-kera-vibrant/10 flex items-center justify-center text-kera-vibrant font-bold overflow-hidden">
                                {user.image ? (
                                    <img src={user.image} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    user.name?.[0]?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 px-2 py-1">Quick Access</p>
                    {items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center justify-between p-3 rounded-xl transition-all ${isActive
                                    ? 'bg-kera-vibrant/10 text-kera-vibrant shadow-sm border border-kera-vibrant/20'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-kera-vibrant' : 'text-gray-400'}`} />
                                    <span className="text-sm font-medium">{t(item.name)}</span>
                                </div>
                                <ChevronRight className={`h-4 w-4 ${isActive ? 'text-kera-vibrant/50' : 'text-gray-300'}`} />
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => signOut({ callbackUrl: '/signin' })}
                        className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>{t('nav.sign_out') || 'Sign Out'}</span>
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-4">KERA v1.0.0</p>
                </div>
            </div>
        </div>
    );
}
