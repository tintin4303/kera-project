"use client";
import React, { useState, useEffect } from 'react';
import AppointmentCard from '../../../../components/AppointmentCard';
import CalendarView from '@/components/carer/CalendarView';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { isSameDay, format } from 'date-fns';

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
    const [view, setView] = useState<'Upcoming' | 'Past' | 'Calendar'>('Upcoming');
    const [selectedDate, setSelectedDate] = useState(new Date());
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
        if (view === 'Calendar') {
            return isSameDay(new Date(appt.scheduledAt), selectedDate);
        }
        const isPast = new Date(appt.scheduledAt) < new Date();
        return view === 'Upcoming' ? !isPast : isPast;
    });

    const appointmentToCardProps = (appt: Appointment) => ({
        ...appt,
        date: new Date(appt.scheduledAt).toLocaleDateString(),
        time: new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        serviceType: appt.notes?.split('\n')[0]?.replace('Service: ', '') || 'General Checkup',
        carerName: appt.carer?.name || 'Unassigned',
        status: new Date(appt.scheduledAt) < new Date() ? 'Completed' : 'Upcoming',
        type: (appt.location === 'Home' ? 'In-Person' : 'Video Call') as 'In-Person' | 'Video Call'
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900">Health Visits</h1>
                <p className="text-sm text-gray-500">
                    View scheduled checkups and visits managed by your carer.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                    onClick={() => setView('Upcoming')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${view === 'Upcoming' ? 'bg-white shadow-sm text-kera-vibrant' : 'text-gray-500'
                        }`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setView('Calendar')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${view === 'Calendar' ? 'bg-white shadow-sm text-kera-vibrant' : 'text-gray-500'
                        }`}
                >
                    Calendar
                </button>
                <button
                    onClick={() => setView('Past')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${view === 'Past' ? 'bg-white shadow-sm text-kera-vibrant' : 'text-gray-500'
                        }`}
                >
                    History
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-kera-vibrant" />
                </div>
            ) : (
                <div className="space-y-6">
                    {view === 'Calendar' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <CalendarView
                                appointments={appointments.map(a => ({
                                    ...a,
                                    patient: { name: 'You' }, // For user view, just show 'You' or similar
                                    status: new Date(a.scheduledAt) < new Date() ? 'COMPLETED' : 'SCHEDULED'
                                }))}
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                            />

                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 px-1 flex items-center justify-between">
                                    <span>Visits on {format(selectedDate, 'MMM d, yyyy')}</span>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {filteredAppointments.length} Visit{filteredAppointments.length !== 1 && 's'}
                                    </span>
                                </h3>
                                {filteredAppointments.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredAppointments.map(appt => (
                                            <AppointmentCard
                                                key={appt.id}
                                                appointment={appointmentToCardProps(appt)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                                        <p className="text-sm text-gray-500 italic">No visits scheduled for this date.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {(view === 'Upcoming' || view === 'Past') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map(appt => (
                                    <AppointmentCard
                                        key={appt.id}
                                        appointment={appointmentToCardProps(appt)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                    <h3 className="text-gray-900 font-medium">No {view.toLowerCase()} appointments</h3>
                                    <p className="text-sm text-gray-500 mt-1">Your carer will schedule visits for you here.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

