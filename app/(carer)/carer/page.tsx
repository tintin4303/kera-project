"use client";
import React, { useEffect, useState } from 'react';
import { Activity, Users, Calendar, Plus } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

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
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                // This will need to be updated to fetch only assigned patients
                const res = await fetch('/api/carer/patients');
                if (res.ok) {
                    setPatients(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch patients", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Carer Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage care for your assigned patients
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-purple-100 p-3">
                            <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">Assigned Patients</p>
                            <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-3">
                            <Activity className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">Records This Week</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 p-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">Upcoming Visits</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                    </div>
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {patients.slice(0, 6).map((patient) => (
                            <Link key={patient.id} href={`/carer/patient/${patient.id}`}>
                                <Card hover padding="md" className="h-full cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {patient.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {patient.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {patient.city}, {patient.country}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {patient._count?.healthRecords || 0} records
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link href="/carer/patients">
                        <Card hover padding="md" className="cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-purple-100 p-3">
                                    <Plus className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Log Vitals</p>
                                    <p className="text-xs text-gray-500">Record patient health data</p>
                                </div>
                            </div>
                        </Card>
                    </Link>

                    <Link href="/carer/appointments">
                        <Card hover padding="md" className="cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-100 p-3">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Schedule Visit</p>
                                    <p className="text-xs text-gray-500">Plan upcoming appointments</p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
