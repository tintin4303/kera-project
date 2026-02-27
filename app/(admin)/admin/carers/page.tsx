'use client';

import React, { useEffect, useState } from 'react';
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

export default function AdminCarersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [carers, setCarers] = useState<Carer[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/signin');
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/dashboard');
        }
    }, [status, session, router]);

    const fetchCarers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/carers', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setCarers(data);
            }
        } catch (error) {
            console.error('Failed to fetch carers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
            fetchCarers();
        }
    }, [status, session]);

    const handleVerify = async (carerId: string, verified: boolean) => {
        setActionLoading(carerId);
        try {
            await fetch('/api/admin/carers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carerId, verified }),
            });
            await fetchCarers();
        } catch (error) {
            console.error('Failed to verify carer:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredCarers = carers.filter(carer => {
        const searchLower = search.toLowerCase();
        return (
            carer.user.name?.toLowerCase().includes(searchLower) ||
            carer.user.email?.toLowerCase().includes(searchLower)
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
                            <h1 className="text-2xl font-bold text-gray-900">Carers</h1>
                            <p className="text-sm text-gray-500">Approve carers before they can accept patient assignments.</p>
                        </div>
                    </div>
                    <Button 
                        variant="secondary" 
                        onClick={fetchCarers}
                        disabled={loading}
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-300"
                    />
                </div>

                {loading && carers.length === 0 ? (
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
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Patients
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCarers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                {loading ? 'Loading carers...' : search ? 'No carers match your search.' : 'No carers found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCarers.map((carer) => (
                                            <tr key={carer.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {carer.user.name || 'Unnamed'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {carer.user.email || 'No email'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {carer._count.patients}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-700">
                                                        {carer.verified ? 'Verified' : 'Pending'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <Button
                                                        size="sm"
                                                        variant={carer.verified ? 'danger' : 'primary'}
                                                        onClick={() => handleVerify(carer.id, !carer.verified)}
                                                        isLoading={actionLoading === carer.id}
                                                        disabled={!!actionLoading}
                                                    >
                                                        {carer.verified ? 'Unverify' : 'Verify'}
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
