'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Clock, MapPin, Loader2, ArrowLeft, RefreshCcw, CheckCircle, XCircle } from 'lucide-react';
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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

                <Card padding="lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Service</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Price</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Patient</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Requester</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Details</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                            {loading ? "Loading requests..." : "No service requests found."}
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((request) => (
                                        <tr key={request.id}>
                                            <td className="px-4 py-3 text-gray-900">
                                                <div className="font-medium text-kera-vibrant">{request.service.name}</div>
                                                <div className="text-xs text-gray-500">{request.service.category}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                    {request.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 font-medium">
                                                {formatPrice(request.price, request.currency)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {request.patient?.name || 'Unknown'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">
                                                <div className="font-medium">{request.user.name || request.user.email || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{request.user.email}</div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {request.scheduledDate && (
                                                    <div className="flex items-center mb-1">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {new Date(request.scheduledDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {request.location && (
                                                    <div className="flex items-center mb-1 text-xs" title={request.location}>
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        <span className="truncate max-w-[150px] block">{request.location}</span>
                                                    </div>
                                                )}
                                                {request.notes && (
                                                    <div className="text-xs italic truncate max-w-[150px]" title={request.notes}>
                                                        "{request.notes}"
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {request.status === 'PENDING' && (
                                                        <>
                                                            <Button 
                                                                size="sm" 
                                                                variant="danger"
                                                                onClick={() => handleStatusUpdate(request.id, 'CANCELLED')}
                                                                isLoading={updating === request.id}
                                                                disabled={!!updating}
                                                                className="px-2 py-1 text-xs h-auto"
                                                            >
                                                                Reject
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                onClick={() => handleStatusUpdate(request.id, 'CONFIRMED')}
                                                                isLoading={updating === request.id}
                                                                disabled={!!updating}
                                                                className="px-2 py-1 text-xs h-auto"
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
                                                            className="px-2 py-1 text-xs h-auto"
                                                        >
                                                            Start
                                                        </Button>
                                                    )}
                                                    {request.status === 'IN_PROGRESS' && (
                                                        <Button 
                                                            size="sm" 
                                                            className="bg-green-600 hover:bg-green-700 px-2 py-1 text-xs h-auto"
                                                            onClick={() => handleStatusUpdate(request.id, 'COMPLETED')}
                                                            isLoading={updating === request.id}
                                                            disabled={!!updating}
                                                        >
                                                            Complete
                                                        </Button>
                                                    )}
                                                    {request.status === 'COMPLETED' && (
                                                        <div className="flex items-center text-green-600">
                                                            <CheckCircle className="h-5 w-5 mr-1" />
                                                            <span className="text-xs font-medium">Done</span>
                                                        </div>
                                                    )}
                                                    {request.status === 'CANCELLED' && (
                                                        <div className="flex items-center text-red-600">
                                                            <XCircle className="h-5 w-5 mr-1" />
                                                            <span className="text-xs font-medium">Cancelled</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
