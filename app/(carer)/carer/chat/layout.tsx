"use client";
import CarerSidebar, { carerNavigation } from '@/components/carer/CarerSidebar';
import CarerHeader from '@/components/carer/CarerHeader';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function CarerChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen bg-gray-50 font-outfit overflow-hidden">
            <CarerSidebar />
            <MobileBottomNav items={carerNavigation} />

            <div className="md:pl-64 h-full flex flex-col">
                <CarerHeader />
                <main className="flex-1 overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
