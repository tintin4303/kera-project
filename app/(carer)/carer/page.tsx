"use client";
import React from 'react';
import { Activity, Users, Calendar, Plus } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

interface Patient {
    id: string;
    name: string;
    city: string;
    country: string;
    _count?: {
        healthRecords: number;
    };
}

export default function CarerDashboard() {
    const { data: patients = [], isLoading: loading } = useQuery<Patient[]>({
        queryKey: ['carer-patients'],
        queryFn: async () => {
            const res = await fetch('/api/carer/patients');
            if (!res.ok) throw new Error('Failed to fetch patients');
            return res.json();
        }
    });

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Card padding="sm" className="flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-accent p-2 mb-2">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-xs font-medium text-gray-500">Patients</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{patients.length}</p>
                </Card>

                <Card padding="sm" className="flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-green-100 p-2 mb-2">
                        <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-xs font-medium text-gray-500">Records</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">0</p>
                </Card>

                <Card padding="sm" className="flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
                    <div className="rounded-full bg-blue-100 p-2 mb-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-xs font-medium text-gray-500">Visits</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">0</p>
                </Card>
            </div>

            {/* Assigned Patients */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">My Patients</h2>
                    <Link href="/carer/patients">
                        <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : patients.length === 0 ? (
                    <Card className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-4 text-sm font-semibold text-gray-900">No patients assigned</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Contact your administrator to get assigned to patients.
                        </p>
                    </Card>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 whitespace-nowrap">Patient</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Location</th>
                                        <th className="px-4 py-3 text-right whitespace-nowrap">Records</th>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Link href="/carer/patients">
                        <Card hover padding="sm" className="cursor-pointer text-center h-full active:scale-[0.98] transition-all">
                            <div className="flex flex-col items-center justify-center">
                                <div className="rounded-full bg-purple-100 p-2 mb-2">
                                    <Plus className="h-5 w-5 text-purple-600" />
                                </div>
                                <p className="text-sm font-bold text-gray-900">Log Vitals</p>
                            </div>
                        </Card>
                    </Link>

                    <Link href="/carer/appointments">
                        <Card hover padding="sm" className="cursor-pointer text-center h-full active:scale-[0.98] transition-all">
                            <div className="flex flex-col items-center justify-center">
                                <div className="rounded-full bg-blue-100 p-2 mb-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <p className="text-sm font-bold text-gray-900">Schedule</p>
                            </div>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
