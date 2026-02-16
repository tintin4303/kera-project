"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, Calendar, LogOut, Stethoscope } from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/carer', icon: Home },
    { name: 'My Patients', href: '/carer/patients', icon: Users },
    { name: 'Reports', href: '/carer/reports', icon: FileText },
    { name: 'Schedule', href: '/carer/schedule', icon: Calendar },
];

export default function CarerSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="flex items-center h-16 shrink-0 px-4 bg-teal-50">
                <div className="bg-teal-600 p-1.5 rounded-lg mr-2">
                    <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-teal-900 tracking-tight">KERA Pro</span>
            </div>

            {/* Nav Links */}
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? 'bg-teal-50 text-teal-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
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
                        <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                            RN
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                Nurse May
                            </p>
                            <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                                Senior Carer
                            </p>
                        </div>
                        <button className="ml-auto shrink-0 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
