"use client";
import React, { useState } from 'react';
import DashboardSidebar from '../../../components/DashboardSidebar';
import DashboardHeader from '../../../components/DashboardHeader';

export default function DashboardLayout({
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

            {/* Mobile Navigation Drawer */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col bg-white border-r border-gray-200">
                    <div className="flex items-center h-16 px-4 bg-kera-dark/5 border-b border-gray-100">
                        <span className="text-xl font-bold text-gray-900">KERA</span>
                        <button onClick={() => setSidebarOpen(false)} className="ml-auto text-gray-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <nav className="space-y-2">
                            <a href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">Overview</a>
                            <a href="/dashboard/health" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50">Health Updates</a>
                            <a href="/dashboard/appointments" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50">Appointments</a>
                            <a href="/dashboard/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50">Profile</a>
                        </nav>
                    </div>
                </div>
            </div>

            <DashboardSidebar />

            <div className="md:pl-64 flex flex-col min-h-screen">
                <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
