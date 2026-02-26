'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Check, X, Clock, MapPin, Loader2, Calendar, ArrowLeft, RefreshCcw, CheckCircle, XCircle } from 'lucide-react';
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

                {loading && requests.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-kera-vibrant" />
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                        <ul className="divide-y divide-gray-200">
                            {requests.length === 0 ? (
                                <li className="px-6 py-12 text-center text-gray-500">
                                    No service requests found.
                                </li>
                            ) : (
                                requests.map((request) => (
                                    <li key={request.id} className="hover:bg-gray-50 transition-colors">
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-kera-vibrant truncate">
                                                            {request.service.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {request.service.category}
                                                        </p>
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                        {request.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-800">
                                                        {formatPrice(request.price, request.currency)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500 mr-6">
                                                        <span className="font-medium text-gray-900 mr-1">Patient:</span>
                                                        {request.patient?.name || 'Unknown'}
                                                    </p>
                                                    <p className="flex items-center text-sm text-gray-500 mr-6">
                                                        <span className="font-medium text-gray-900 mr-1">Requester:</span>
                                                        {request.user.name || request.user.email}
                                                    </p>
                                                    {request.scheduledDate && (
                                                        <p className="flex items-center text-sm text-gray-500">
                                                            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                            {new Date(request.scheduledDate).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {(request.location || request.notes) && (
                                                <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-100">
                                                    {request.location && (
                                                        <p className="mb-1"><span className="font-semibold">Location:</span> {request.location}</p>
                                                    )}
                                                    {request.notes && (
                                                        <p><span className="font-semibold">Notes:</span> {request.notes}</p>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Action Buttons */}
                                            <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
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
                                                        Start Service
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
                                                        Mark Complete
                                                    </Button>
                                                )}
                                                {request.status === 'COMPLETED' && (
                                                     <span className="text-sm text-green-600 font-medium flex items-center">
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Completed
                                                     </span>
                                                )}
                                                 {request.status === 'CANCELLED' && (
                                                     <span className="text-sm text-red-600 font-medium flex items-center">
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Cancelled
                                                     </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
