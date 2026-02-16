"use client";
import React, { useState } from 'react';
import AppointmentCard from '../../../../components/AppointmentCard';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const upcomingAppointments = [
    {
        id: 1,
        carerName: 'Nurse May',
        serviceType: 'Health Monitoring Visit',
        date: 'Oct 24, 2026',
        time: '09:00 AM',
        status: 'Upcoming' as const,
        type: 'In-Person' as const,
    },
    {
        id: 2,
        carerName: 'Dr. Su',
        serviceType: 'Specialist Consultation',
        date: 'Nov 02, 2026',
        time: '02:00 PM',
        status: 'Upcoming' as const,
        type: 'Video Call' as const,
    },
];

const pastAppointments = [
    {
        id: 3,
        carerName: 'Nurse May',
        serviceType: 'Health Monitoring Visit',
        date: 'Oct 10, 2026',
        time: '09:00 AM',
        status: 'Completed' as const,
        type: 'In-Person' as const,
    }
];

export default function AppointmentsPage() {
    const [view, setView] = useState<'Upcoming' | 'Past'>('Upcoming');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-kera-vibrant hover:bg-[#00a855] transition-colors">
                    <Plus className="mr-2 h-4 w-4" />
                    Book New Visit
                </button>
            </div>

            {/* Easy Scheduling Calendar Preview (Mock) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
                        October 2026
                    </h2>
                    <div className="flex space-x-2">
                        <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                {/* Simple Weekly View Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-2 font-medium text-gray-500">{day}</div>
                    ))}
                    {/* Mock Days */}
                    {Array.from({ length: 7 }).map((_, i) => {
                        const day = 18 + i;
                        const hasEvent = day === 24;
                        return (
                            <div key={i} className={`py-3 rounded-lg ${hasEvent ? 'bg-teal-50 border border-teal-100' : 'hover:bg-gray-50'}`}>
                                <span className={`block ${hasEvent ? 'font-bold text-teal-700' : 'text-gray-700'}`}>{day}</span>
                                {hasEvent && <div className="mt-1 h-1.5 w-1.5 bg-teal-500 rounded-full mx-auto"></div>}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setView('Upcoming')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${view === 'Upcoming'
                            ? 'border-kera-vibrant text-kera-vibrant'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setView('Past')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${view === 'Past'
                            ? 'border-kera-vibrant text-kera-vibrant'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Past Visits
                    </button>
                </nav>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {view === 'Upcoming' ? (
                    upcomingAppointments.map(appt => (
                        <AppointmentCard key={appt.id} appointment={appt as any} />
                    ))
                ) : (
                    pastAppointments.map(appt => (
                        <AppointmentCard key={appt.id} appointment={appt as any} />
                    ))
                )}
            </div>

            {view === 'Upcoming' && upcomingAppointments.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No upcoming appointments.</p>
                </div>
            )}
        </div>
    );
}
