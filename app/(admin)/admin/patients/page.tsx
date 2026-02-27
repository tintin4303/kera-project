'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, RefreshCcw, Loader2 } from 'lucide-react';

interface Carer {
    id: string;
    verified: boolean;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    };
    _count: {
        patients: number;
    };
}

interface Patient {
    id: string;
    name: string;
    city: string | null;
    country: string | null;
    carerId: string | null;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
    carer: {
        id: string;
        user: {
            name: string | null;
        };
    } | null;
}

export default function AdminPatientsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [carers, setCarers] = useState<Carer[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<Record<string, string>>({});
    const [search, setSearch] = useState('');

    const unassignedCount = useMemo(() => patients.filter((p) => !p.carerId).length, [patients]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/signin');
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/dashboard');
        }
    }, [status, session, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [carersRes, patientsRes] = await Promise.all([
                fetch('/api/admin/carers', { cache: 'no-store' }),
                fetch('/api/admin/patients', { cache: 'no-store' }),
            ]);

            if (carersRes.ok) {
                const carersData = await carersRes.json();
                setCarers(carersData);
            }

            if (patientsRes.ok) {
                const patientsData = await patientsRes.json();
                setPatients(patientsData);
                const initialAssignments: Record<string, string> = {};
                patientsData.forEach((patient: Patient) => {
                    initialAssignments[patient.id] = patient.carerId || '';
                });
                setAssignments(initialAssignments);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
            fetchData();
        }
    }, [status, session]);

    const handleAssign = async (patientId: string) => {
        const carerId = assignments[patientId];
        const patient = patients.find((p) => p.id === patientId);
        const currentCarerId = patient?.carerId || '';
        const finalCarerId = carerId !== undefined ? carerId : currentCarerId;

        setActionLoading(patientId);

        try {
            const res = await fetch('/api/admin/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId, carerId: finalCarerId }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Failed to assign carer');
            }

            setAssignments((prev) => {
                const next = { ...prev };
                delete next[patientId];
                return next;
            });

            await fetchData();
        } catch (error) {
            console.error('Assignment error:', error);
            alert('Failed to save assignment. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredPatients = patients.filter(patient => {
        const searchLower = search.toLowerCase();
        return (
            patient.name.toLowerCase().includes(searchLower) ||
            patient.user.email?.toLowerCase().includes(searchLower) ||
            patient.user.name?.toLowerCase().includes(searchLower) ||
            patient.city?.toLowerCase().includes(searchLower) ||
            patient.country?.toLowerCase().includes(searchLower)
        );
    });

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-kera-vibrant" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-outfit px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
                            <p className="text-sm text-gray-500">Match each patient with a trusted carer in Myanmar.</p>
                        </div>
                    </div>
                    <Button 
                        variant="secondary" 
                        onClick={fetchData}
                        disabled={loading}
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by patient name, family contact, or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-300"
                    />
                </div>

                {unassignedCount > 0 && (
                    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                            {unassignedCount} unassigned patient{unassignedCount > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-600">
                            Please assign carers to ensure continuous care coverage.
                        </p>
                    </div>
                )}

                {loading && patients.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-kera-vibrant" />
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Patient Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Family Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Current Carer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assign Carer
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPatients.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                {loading ? 'Loading patients...' : search ? 'No patients match your search.' : 'No patients found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPatients.map((patient) => (
                                            <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {patient.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {patient.user.email || patient.user.name || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {patient.city || patient.country || '—'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div
                                                        className={`text-sm font-medium ${
                                                            patient.carerId ? 'text-green-600' : 'text-red-600'
                                                        }`}
                                                    >
                                                        {patient.carer?.user?.name || 'Unassigned'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={assignments[patient.id] ?? ''}
                                                        onChange={(event) =>
                                                            setAssignments((prev) => ({
                                                                ...prev,
                                                                [patient.id]: event.target.value,
                                                            }))
                                                        }
                                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-kera-vibrant focus:ring-1 focus:ring-kera-vibrant"
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {carers.map((carer) => (
                                                            <option key={carer.id} value={carer.id}>
                                                                {carer.user.name || 'Unnamed'} ({carer._count.patients})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAssign(patient.id)}
                                                        isLoading={actionLoading === patient.id}
                                                        disabled={!!actionLoading}
                                                    >
                                                        Save
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
