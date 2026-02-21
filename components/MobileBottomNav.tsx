"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

interface MobileBottomNavProps {
    items: NavItem[];
}

export default function MobileBottomNav({ items }: MobileBottomNavProps) {
    const pathname = usePathname();
    const { t } = useLanguage();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-kera-vibrant' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <item.icon
                                className={`h-6 w-6 ${isActive ? 'fill-current' : ''}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className="text-[10px] font-medium">{t(item.name)}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
