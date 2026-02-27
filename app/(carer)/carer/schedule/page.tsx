"use client";
import React, { useState, useEffect } from 'react';
import AppointmentCard from '@/components/AppointmentCard';
import AddScheduleModal from '@/components/carer/AddScheduleModal';
import CalendarView from '@/components/carer/CalendarView';
import { Plus, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
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
    const { t } = useLanguage();
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
        serviceType: appt.notes?.split('\n')[0]?.replace('Service: ', '') || t('carer_schedule.visit'),
        date: new Date(appt.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
        time: new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patientName: appt.patient.name,
        location: appt.location || t('carer_schedule.home_visit'),
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
                    {t('carer_schedule.upcoming')}
                </button>
                <button
                    onClick={() => setView('Calendar')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${view === 'Calendar' ? 'bg-white shadow-sm text-kera-vibrant' : 'text-gray-500'
                        }`}
                >
                    {t('carer_schedule.calendar')}
                </button>
                <button
                    onClick={() => setView('Past')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${view === 'Past' ? 'bg-white shadow-sm text-kera-vibrant' : 'text-gray-500'
                        }`}
                >
                    {t('carer_schedule.history')}
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
                                    <span>{t('carer_schedule.visits_on')} {format(selectedDate, 'MMM d, yyyy')}</span>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {filteredAppointments.length} {filteredAppointments.length !== 1 ? t('carer_schedule.visits') : t('carer_schedule.visit')}
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
                                        <p className="text-sm text-gray-500 italic">{t('carer_schedule.no_visits')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {view === 'Upcoming' && (
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
                                    <h3 className="text-gray-900 font-medium">{t('carer_schedule.no_upcoming')}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{t('carer_schedule.add_visit_desc')}</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-6 text-kera-vibrant font-medium text-sm flex items-center justify-center mx-auto"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        {t('carer_schedule.add_first')}
                                    </button>
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
                                                    <th className="px-4 py-3 whitespace-nowrap">{t('carer_schedule.patient')}</th>
                                                    <th className="px-4 py-3 whitespace-nowrap">{t('carer_schedule.date')}</th>
                                                    <th className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">{t('carer_schedule.time')}</th>
                                                    <th className="px-4 py-3 whitespace-nowrap">{t('carer_schedule.service')}</th>
                                                    <th className="px-4 py-3 whitespace-nowrap">{t('carer_schedule.status')}</th>
                                                    <th className="px-4 py-3 whitespace-nowrap hidden md:table-cell">{t('carer_schedule.location')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredAppointments.map(a => {
                                                    const status = a.status.toUpperCase();
                                                    const disp =
                                                        status === 'COMPLETED' ? t('carer_schedule.completed') :
                                                        status === 'CANCELLED' ? t('carer_schedule.cancelled') : t('carer_schedule.completed');
                                                    const badge =
                                                        disp === t('carer_schedule.completed') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                                                    return (
                                                        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                {a.patient.name}
                                                            </td>
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
                                                                {(a.notes || '').split('\n')[0]?.replace('Service: ', '') || t('carer_schedule.visit')}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge}`}>
                                                                    {disp}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                                                                {a.location || t('carer_schedule.home')}
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
                                    <h3 className="text-gray-900 font-medium">{t('carer_schedule.no_history')}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{t('carer_schedule.history_desc')}</p>
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
                    aria-label={t('carer_schedule.add_schedule')}
                >
                    <Plus className="h-6 w-6 relative z-10" />
                </button>
            </div>
        </div>
    );
}
