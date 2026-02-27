"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import AppointmentCard from '../../../../components/AppointmentCard';
import CalendarView from '@/components/carer/CalendarView';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { isSameDay, format } from 'date-fns';

interface Appointment {
    id: string;
    scheduledAt: string;
    notes?: string | null;
    location?: string | null;
    status?: string | null;
    carer?: {
        name?: string | null;
    } | null;
}

export default function AppointmentsPage() {
    const [view, setView] = useState<'Upcoming' | 'Past' | 'Calendar'>('Upcoming');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [permission, setPermission] = useState<NotificationPermission>(typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default');
    const timersRef = useRef<number[]>([]);

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
        const id = window.setInterval(fetchAppointments, 30000);
        const onVisible = () => {
            if (document.visibilityState === 'visible') fetchAppointments();
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, []);

    const medicationAppointments = useMemo(() => {
        return appointments.filter(a =>
            (a.notes || '').includes('Service: Medication Reminder') &&
            a.status !== 'CANCELLED' &&
            a.status !== 'COMPLETED'
        );
    }, [appointments]);

    useEffect(() => {
        timersRef.current.forEach(t => clearTimeout(t));
        timersRef.current = [];
        if (permission !== 'granted') return;
        const now = Date.now();
        const in24h = now + 24 * 60 * 60 * 1000;
        medicationAppointments.forEach(a => {
            const when = new Date(a.scheduledAt).getTime();
            if (when > now && when < in24h) {
                const delay = when - now;
                const medLine = (a.notes || '').split('\n').find(l => l.startsWith('Medication:')) || '';
                const med = medLine.replace('Medication:', '').trim();
                const id = window.setTimeout(() => {
                    try {
                        new Notification('Medication Reminder', {
                            body: med ? `Time to take ${med}` : 'Time to take your medication',
                        });
                    } catch {}
                }, delay);
                timersRef.current.push(id);
            }
        });
        return () => {
            timersRef.current.forEach(t => clearTimeout(t));
            timersRef.current = [];
        };
    }, [medicationAppointments, permission]);

    const nextMedication = useMemo(() => {
        const future = medicationAppointments.filter(a => new Date(a.scheduledAt).getTime() > Date.now());
        future.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        return future[0];
    }, [medicationAppointments]);

    const requestPermission = async () => {
        if (!('Notification' in window)) return;
        try {
            const p = await Notification.requestPermission();
            setPermission(p);
        } catch {}
    };

    const filteredAppointments = appointments.filter(appt => {
        const status = (appt.status || '').toUpperCase();
        if (view === 'Calendar') {
            return isSameDay(new Date(appt.scheduledAt), selectedDate) && status !== 'CANCELLED';
        }
        const now = new Date();
        const isPastByTime = new Date(appt.scheduledAt) < now;
        const isPastByStatus = status === 'COMPLETED' || status === 'CANCELLED';
        const isUpcomingByStatus = status === 'SCHEDULED' || status === 'PENDING' || status === '';
        return view === 'Upcoming'
            ? (isUpcomingByStatus && !isPastByTime)
            : (isPastByStatus || isPastByTime);
    });

    const appointmentToCardProps = (appt: Appointment) => ({
        ...appt,
        date: new Date(appt.scheduledAt).toLocaleDateString(),
        time: new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        serviceType: appt.notes?.split('\n')[0]?.replace('Service: ', '') || 'General Checkup',
        carerName: appt.carer?.name || 'Unassigned',
        status: (appt.status || '').toUpperCase() || (new Date(appt.scheduledAt) < new Date() ? 'COMPLETED' : 'SCHEDULED'),
        type: (appt.location === 'Home' ? 'In-Person' : 'Video Call') as 'In-Person' | 'Video Call'
    });

    return (
        <div className="space-y-6">

            {permission !== 'granted' && medicationAppointments.length > 0 && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-900">Enable medication reminders</p>
                            <p className="text-xs text-blue-800">Allow notifications to get alerts at the right time.</p>
                        </div>
                        <button
                            onClick={requestPermission}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                        >
                            Enable
                        </button>
                    </div>
                </div>
            )}

            {nextMedication && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                    <p className="text-sm font-medium text-green-900">
                        Next medication at {new Date(nextMedication.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-green-800">
                        {(nextMedication.notes || '').split('\n').find(l => l.startsWith('Medication:'))?.replace('Medication:', '').trim() || 'Medication'}
                    </p>
                </div>
            )}

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
                                    patient: { name: 'You' },
                                    status: (a.status || '').toUpperCase() || (new Date(a.scheduledAt) < new Date() ? 'COMPLETED' : 'SCHEDULED')
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

                    {view === 'Upcoming' && (
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
                                    <h3 className="text-gray-900 font-medium">No upcoming schedules</h3>
                                    <p className="text-sm text-gray-500 mt-1">Your carer will schedule visits for you here.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {view === 'Past' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {filteredAppointments.length > 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 whitespace-nowrap">Date</th>
                                                    <th className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">Time</th>
                                                    <th className="px-4 py-3 whitespace-nowrap">Service</th>
                                                    <th className="px-4 py-3 whitespace-nowrap hidden md:table-cell">Carer</th>
                                                    <th className="px-4 py-3 whitespace-nowrap">Status</th>
                                                    <th className="px-4 py-3 whitespace-nowrap hidden md:table-cell">Location</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredAppointments.map(a => {
                                                    const status = (a.status || '').toUpperCase();
                                                    const disp =
                                                        status === 'COMPLETED' ? 'Completed' :
                                                        status === 'CANCELLED' ? 'Cancelled' : 'Completed';
                                                    const badge =
                                                        disp === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                                                    return (
                                                        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                {new Date(a.scheduledAt).toLocaleDateString()}
                                                                <div className="sm:hidden text-xs text-gray-500">
                                                                    {new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                                                                {new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                {(a.notes || '').split('\n')[0]?.replace('Service: ', '') || 'Visit'}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                                                                {a.carer?.name || '—'}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge}`}>
                                                                    {disp}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                                                                {a.location || 'Home'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <CalendarIcon className="h-6 w-6 text-gray-300" />
                                    </div>
                                    <h3 className="text-gray-900 font-medium">No history</h3>
                                    <p className="text-sm text-gray-500 mt-1">Completed or cancelled schedules will appear here.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
