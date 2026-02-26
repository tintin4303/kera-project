"use client";
import CarerSidebar, { carerNavigation } from '@/components/carer/CarerSidebar';
import CarerHeader from '@/components/carer/CarerHeader';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function CarerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 font-outfit pb-16 md:pb-0">
            <CarerSidebar />

            <MobileBottomNav items={carerNavigation.filter(item =>
                ['nav.dashboard', 'nav.patients', 'nav.schedule', 'nav.chat'].includes(item.name)
            )} />

            <div className="md:pl-64 flex flex-col min-h-screen">
                <CarerHeader />
                <main className="flex-1">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
