"use client";
import React, { useState, useEffect } from 'react';
import AppointmentCard from '../../../../components/AppointmentCard';
import BookAppointmentModal from '../../../../components/dashboard/BookAppointmentModal';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Appointment {
    id: string;
    scheduledAt: string;
    notes?: string | null;
    location?: string | null;
    carer?: {
        name?: string | null;
    } | null;
}

export default function AppointmentsPage() {
    const [view, setView] = useState<'Upcoming' | 'Past'>('Upcoming');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/appointments');
            if (res.ok) {
                const data = await res.json();
                setAppointments(data);
            }
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const filteredAppointments = appointments.filter(appt => {
        const isPast = new Date(appt.scheduledAt) < new Date();
        return view === 'Upcoming' ? !isPast : isPast;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-kera-vibrant hover:bg-[#00a855] transition-colors"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Book New Visit
                </button>
            </div>

            <BookAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAppointments}
            />

            {/* Easy Scheduling Calendar Preview (Static for now, but dynamic data below) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hidden md:block">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
                        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    {/* Calendar controls can be added later */}
                </div>
                {/* Simple Weekly View Grid Placeholder */}
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-2 font-medium text-gray-500">{day}</div>
                    ))}
                    {Array.from({ length: 7 }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        const isToday = i === 0;
                        return (
                            <div key={i} className={`py-3 rounded-lg ${isToday ? 'bg-kera-vibrant/5 border border-kera-vibrant/20' : 'hover:bg-gray-50'}`}>
                                <span className={`block ${isToday ? 'font-bold text-kera-vibrant' : 'text-gray-700'}`}>{date.getDate()}</span>
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
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-kera-vibrant" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map(appt => (
                            <AppointmentCard
                                key={appt.id}
                                appointment={{
                                    ...appt,
                                    date: new Date(appt.scheduledAt).toLocaleDateString(),
                                    time: new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    serviceType: appt.notes?.split('\n')[0]?.replace('Service: ', '') || 'General Checkup',
                                    carerName: appt.carer?.name || 'Unassigned',
                                    status: new Date(appt.scheduledAt) < new Date() ? 'Completed' : 'Upcoming',
                                    type: appt.location === 'Home' ? 'In-Person' : 'Video Call'
                                }}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-100 border-dashed">
                            <CalendarIcon className="mx-auto h-12 w-12 text-gray-300" />
                            <p className="mt-2 text-gray-500">No {view.toLowerCase()} appointments found.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-4 text-kera-vibrant font-medium hover:underline"
                            >
                                Book your first visit
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
