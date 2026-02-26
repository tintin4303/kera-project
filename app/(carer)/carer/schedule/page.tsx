"use client";
import React, { useState, useEffect } from 'react';
import AppointmentCard from '@/components/AppointmentCard';
import AddScheduleModal from '@/components/carer/AddScheduleModal';
import CalendarView from '@/components/carer/CalendarView';
import { Plus, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { isSameDay, format } from 'date-fns';

interface Appointment {
    id: string;
    scheduledAt: string;
    status: string;
    notes?: string | null;
    location?: string | null;
    patient: {
        name: string;
        address?: string | null;
    };
}

export default function CarerSchedulePage() {
    const [view, setView] = useState<'Upcoming' | 'Past' | 'Calendar'>('Upcoming');
    const [selectedDate, setSelectedDate] = useState(new Date());
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
        if (view === 'Calendar') {
            return isSameDay(new Date(appt.scheduledAt), selectedDate) && appt.status !== 'CANCELLED';
        }
        const isPast = appt.status === 'COMPLETED' || appt.status === 'CANCELLED' || new Date(appt.scheduledAt) < new Date();
        return view === 'Upcoming' ? !isPast : isPast;
    });

    const appointmentToCardProps = (appt: Appointment) => ({
        ...appt,
        serviceType: appt.notes?.split('\n')[0]?.replace('Service: ', '') || 'Visit',
        date: new Date(appt.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
        time: new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patientName: appt.patient.name,
        location: appt.location || 'Home Visit',
        status: appt.status
    });

    return (
        <div className="space-y-6 pb-20 md:pb-6">

            <AddScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAppointments}
            />

            {/* View Toggle (Mobile Priority Tabs) */}
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

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-kera-vibrant" />
                </div>
            ) : (
                <div className="space-y-6">
                    {view === 'Calendar' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <CalendarView
                                appointments={appointments}
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
                                    <div className="space-y-4">
                                        {filteredAppointments.map(appt => (
                                            <AppointmentCard
                                                key={appt.id}
                                                appointment={appointmentToCardProps(appt)}
                                                isCarer={true}
                                                onUpdate={fetchAppointments}
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
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map(appt => (
                                    <AppointmentCard
                                        key={appt.id}
                                        appointment={appointmentToCardProps(appt)}
                                        isCarer={true}
                                        onUpdate={fetchAppointments}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <CalendarIcon className="h-6 w-6 text-gray-300" />
                                    </div>
                                    <h3 className="text-gray-900 font-medium">No {view.toLowerCase()} schedules</h3>
                                    <p className="text-sm text-gray-500 mt-1">Start by adding a new visit or regular checkup.</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-6 text-kera-vibrant font-medium text-sm flex items-center justify-center mx-auto"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add first schedule
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            {/* Floating Add Button */}
            <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-40">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-4 bg-kera-vibrant text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 hover:shadow-xl transition-all duration-200 ring-4 ring-white"
                    aria-label="Add Schedule"
                >
                    <Plus className="h-6 w-6 relative z-10" />
                </button>
            </div>
        </div>
    );
}

