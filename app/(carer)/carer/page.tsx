"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/components/LanguageContext';
import { format } from 'date-fns';

interface Patient {
    id: string;
    name: string;
    city: string;
    country: string;
    _count?: {
        healthRecords: number;
    };
}

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

export default function CarerDashboard() {
    const { t } = useLanguage();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(true);

    const { data: patients = [], isLoading: loading } = useQuery<Patient[]>({
        queryKey: ['carer-patients'],
        queryFn: async () => {
            const res = await fetch('/api/carer/patients');
            if (!res.ok) throw new Error('Failed to fetch patients');
            return res.json();
        }
    });

    useEffect(() => {
        const fetchAppointments = async () => {
            setAppointmentsLoading(true);
            try {
                const res = await fetch('/api/appointments');
                if (res.ok) {
                    const data = await res.json();
                    setAppointments(data);
                }
            } catch (error) {
                console.error('Failed to fetch appointments:', error);
            } finally {
                setAppointmentsLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const upcomingAppointments = appointments
        .filter(appt => {
            const isNotCancelled = appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED';
            const isInFuture = new Date(appt.scheduledAt) >= new Date();
            return isNotCancelled && isInFuture;
        })
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-6">

            {/* Upcoming Appointments */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                    <Link href="/carer/schedule">
                        <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                </div>
                {appointmentsLoading ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto"></div>
                    </div>
                ) : upcomingAppointments.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                        <p className="text-sm">No appointments scheduled</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {upcomingAppointments.map((appt) => (
                                <div key={appt.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{appt.patient.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {format(new Date(appt.scheduledAt), 'MMM d, yyyy h:mm a')}
                                            </p>
                                            {appt.location && (
                                                <p className="text-sm text-gray-500 mt-1">{appt.location}</p>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded">
                                            {appt.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Assigned Patients */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{t('carer_dashboard.my_patients')}</h2>
                    <Link href="/carer/patients">
                        <Button variant="ghost" size="sm">{t('carer_dashboard.view_all')}</Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : patients.length === 0 ? (
                    <Card className="text-center py-12">
                        <h3 className="text-sm font-semibold text-gray-900">{t('carer_dashboard.no_patients')}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {t('carer_dashboard.contact_admin')}
                        </p>
                    </Card>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 whitespace-nowrap">{t('nav.patients')}</th>
                                        <th className="px-4 py-3 whitespace-nowrap">{t('carer_dashboard.location')}</th>
                                        <th className="px-4 py-3 text-right whitespace-nowrap">{t('carer_dashboard.records')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {patients.slice(0, 6).map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-4 py-3">
                                                <Link href={`/carer/patient/${patient.id}`} className="flex items-center gap-3 w-max">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                                                        {patient.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                                                        {patient.name}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                {patient.city}, {patient.country}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                                                {patient._count?.healthRecords || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('carer_dashboard.quick_actions')}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/carer/patients">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all h-full flex items-center justify-center">
                            <p className="text-sm font-semibold text-gray-900">{t('carer_dashboard.log_vitals')}</p>
                        </div>
                    </Link>

                    <Link href="/carer/schedule">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all h-full flex items-center justify-center">
                            <p className="text-sm font-semibold text-gray-900">{t('carer_dashboard.schedule')}</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
