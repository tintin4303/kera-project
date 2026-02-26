"use client";
import React from 'react';
import { Users, Plus } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';

interface Patient {
    id: string;
    name: string;
    city: string;
    country: string;
    gender: string | null;
    _count?: {
        healthRecords: number;
        medications: number;
    };
}

export default function CarerPatients() {
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
            {/* Patient List */}
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {patients.map((patient) => (
                        <Link key={patient.id} href={`/carer/patient/${patient.id}`}>
                            <Card hover padding="md" className="h-full cursor-pointer">
                                <div className="flex items-start gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                                        {patient.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {patient.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {patient.gender && `${patient.gender} • `}
                                            {patient.city}, {patient.country}
                                        </p>
                                        <div className="flex gap-3 mt-2 text-xs text-gray-400">
                                            <span>{patient._count?.healthRecords || 0} records</span>
                                            <span>•</span>
                                            <span>{patient._count?.medications || 0} meds</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
