"use client";
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardSidebar, { dashboardNavigation } from '../../../components/DashboardSidebar';
import DashboardHeader from '../../../components/DashboardHeader';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/signin');
            return;
        }
        if (status === 'authenticated' && session?.user?.role !== 'MIGRANT') {
            router.replace(session?.user?.role === 'ADMIN' ? '/admin' : '/carer');
        }
    }, [status, session?.user?.role, router]);

    if (status === 'loading') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-outfit pb-16 md:pb-0">
            <DashboardSidebar />

            <MobileBottomNav items={dashboardNavigation.filter(item =>
                ['nav.overview', 'nav.schedule', 'nav.chat', 'nav.profile'].includes(item.name)
            )} />

            <div className="md:pl-64 flex flex-col min-h-screen">
                <DashboardHeader />
                <main className="flex-1">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
