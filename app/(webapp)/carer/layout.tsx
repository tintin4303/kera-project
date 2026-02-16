"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Stethoscope } from 'lucide-react';
import CarerSidebar from '../../components/CarerSidebar';

export default function CarerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 font-outfit">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar Content */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col bg-white border-r border-gray-200">
                    <div className="flex items-center h-16 px-4 bg-teal-50 border-b border-gray-100">
                        <Stethoscope className="h-5 w-5 text-teal-600 mr-2" />
                        <span className="text-xl font-bold text-teal-900">KERA Pro</span>
                        <button onClick={() => setSidebarOpen(false)} className="ml-auto text-gray-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <nav className="space-y-2">
                            <Link href="/carer" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">Dashboard</Link>
                            <Link href="/carer/patients" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50">My Patients</Link>
                            <Link href="/carer/reports" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50">Reports</Link>
                            <Link href="/carer/schedule" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50">Schedule</Link>
                        </nav>
                    </div>
                </div>
            </div>

            <CarerSidebar />

            <div className="md:pl-64 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
                    <div className="flex items-center">
                        <button
                            className="mr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="flex items-center gap-2">
                            <div className="bg-teal-600 p-1 rounded-md">
                                <Stethoscope className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-teal-900">KERA Pro</span>
                        </span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">RN</div>
                </div>

                <main className="flex-1">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
