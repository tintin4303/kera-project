"use client";
import React, { useEffect, useState } from 'react';
import { User, MapPin, Calendar, Activity, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';

interface Patient {
    id: string;
    name: string;
    city: string;
    country: string;
    _count?: {
        healthRecords: number;
        appointments: number;
    }
}

export default function PatientList() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch('/api/patients');
                if (res.ok) {
                    const data = await res.json();
                    setPatients(data);
                }
            } catch (error) {
                console.error("Failed to fetch patients", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kera-vibrant"></div>
            </div>
        );
    }

    if (patients.length === 0) {
        return (
            <Card className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-sm font-semibold text-gray-900">No family members yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first family member.
                </p>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patients.map((patient) => (
                <Link
                    key={patient.id}
                    href={`/dashboard/patient/${patient.id}`}
                    className="block"
                >
                    <Card hover padding="md" className="h-full transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {patient.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-kera-vibrant transition-colors">
                                    {patient.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate flex items-center mt-0.5">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {patient.city}, {patient.country}
                                </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-kera-vibrant transition-colors" />
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                                <Activity className="h-3.5 w-3.5 text-green-600" />
                                <span className="font-medium">{patient._count?.healthRecords || 0}</span>
                                <span className="text-gray-500">Records</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                <span className="font-medium">{patient._count?.appointments || 0}</span>
                                <span className="text-gray-500">Visits</span>
                            </div>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
