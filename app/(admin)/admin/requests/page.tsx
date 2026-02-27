'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Loader2, ArrowLeft, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/utils';

interface ServiceRequest {
    id: string;
    status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    scheduledDate: string | null;
    location: string | null;
    notes: string | null;
    price: number;
    currency: string;
    createdAt: string;
    user: {
        name: string | null;
        email: string | null;
    };
    patient: {
        name: string;
    } | null;
    service: {
        name: string;
        category: string;
    };
}

export default function AdminRequestsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/signin');
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/dashboard');
        }
    }, [status, session, router]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/requests');
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
            fetchRequests();
        }
    }, [status, session]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdating(id);
        try {
            const res = await fetch('/api/admin/requests', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (res.ok) {
                setRequests(prev => prev.map(req => 
                    req.id === id ? { ...req, status: newStatus as ServiceRequest['status'] } : req
                ));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(null);
        }
    };

    const filteredRequests = requests.filter(request => {
        const searchLower = search.toLowerCase();
        return (
            request.service.name.toLowerCase().includes(searchLower) ||
            request.patient?.name.toLowerCase().includes(searchLower) ||
            request.user.name?.toLowerCase().includes(searchLower) ||
            request.user.email?.toLowerCase().includes(searchLower)
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
                            <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
                            <p className="text-sm text-gray-500">Manage incoming service requests from families.</p>
                        </div>
                    </div>
                    <Button 
                        variant="secondary" 
                        onClick={fetchRequests}
                        disabled={loading}
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by service, patient, requester..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-300"
                    />
                </div>

                {loading && requests.length === 0 ? (
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
                                            Service
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Patient
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Requester
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
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
                                    {filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                {search ? 'No requests match your search.' : 'No service requests found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map((request) => (
                                            <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {request.service.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {request.service.category}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {request.patient?.name || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {request.user.name || request.user.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {request.scheduledDate 
                                                            ? new Date(request.scheduledDate).toLocaleDateString() 
                                                            : '—'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatPrice(request.price, request.currency)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-700">
                                                        {request.status.replace('_', ' ')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {request.status === 'PENDING' && (
                                                            <>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="danger"
                                                                    onClick={() => handleStatusUpdate(request.id, 'CANCELLED')}
                                                                    isLoading={updating === request.id}
                                                                    disabled={!!updating}
                                                                >
                                                                    Reject
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    onClick={() => handleStatusUpdate(request.id, 'CONFIRMED')}
                                                                    isLoading={updating === request.id}
                                                                    disabled={!!updating}
                                                                >
                                                                    Confirm
                                                                </Button>
                                                            </>
                                                        )}
                                                        {request.status === 'CONFIRMED' && (
                                                            <Button 
                                                                size="sm" 
                                                                onClick={() => handleStatusUpdate(request.id, 'IN_PROGRESS')}
                                                                isLoading={updating === request.id}
                                                                disabled={!!updating}
                                                            >
                                                                Start
                                                            </Button>
                                                        )}
                                                        {request.status === 'IN_PROGRESS' && (
                                                            <Button 
                                                                size="sm" 
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => handleStatusUpdate(request.id, 'COMPLETED')}
                                                                isLoading={updating === request.id}
                                                                disabled={!!updating}
                                                            >
                                                                Complete
                                                            </Button>
                                                        )}
                                                    </div>
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
