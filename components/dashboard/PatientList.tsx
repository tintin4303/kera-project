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
    subscription?: {
        status: string;
    } | null;
    carer?: {
        user: {
            name: string;
            image?: string | null;
        }
    } | null;
    _count?: {
        healthRecords: number;
        appointments: number;
    }
}

export default function PatientList() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Search family members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:max-w-xs text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-kera-vibrant focus:ring-1 focus:ring-kera-vibrant transition-all"
                />
            </div>
            {filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
                    No matching members found
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 whitespace-nowrap">Family Member</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Location</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Carer</th>
                                    <th className="px-4 py-3 text-right whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <Link href={`/dashboard/patient/${patient.id}`} className="flex items-center gap-3 w-max">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                                                    {patient.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900 group-hover:text-kera-vibrant transition-colors">
                                                    {patient.name}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {patient.city}, {patient.country}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {patient.carer ? (
                                                <div className="flex items-center gap-2">
                                                    {patient.carer.user.image ? (
                                                        <img src={patient.carer.user.image} alt="carer" className="w-6 h-6 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                                                            {patient.carer.user.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="text-gray-900">{patient.carer.user.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Assigning...</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1" title="Health Records">
                                                    <Activity className="h-3.5 w-3.5 text-green-600" />
                                                    {patient._count?.healthRecords || 0}
                                                </span>
                                                <span className="flex items-center gap-1" title="Visits">
                                                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                                    {patient._count?.appointments || 0}
                                                </span>
                                                <Link href={`/dashboard/patient/${patient.id}`}>
                                                    <ChevronRight className="h-4 w-4 text-gray-400 ml-1 group-hover:text-kera-vibrant transition-colors" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
