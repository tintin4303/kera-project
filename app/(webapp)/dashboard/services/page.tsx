'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Package, Truck, Video, Pill, Plus, Clock, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import RequestServiceModal from '@/components/services/RequestServiceModal';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/utils';

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: 'TRANSPORT' | 'MEDICAL' | 'LOGISTICS' | string;
}

interface ServiceRequest {
    id: string;
    service: Service;
    status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    scheduledDate: string | null;
    createdAt: string;
}

export default function ServicesPage() {
    const { data: session } = useSession();
    const [services, setServices] = useState<Service[]>([]);
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [servicesRes, requestsRes] = await Promise.all([
                fetch('/api/services'),
                fetch('/api/services/requests')
            ]);

            if (servicesRes.ok) setServices(await servicesRes.json());
            if (requestsRes.ok) setRequests(await requestsRes.json());
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    const handleRequestClick = (service: Service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const getIconForCategory = (category: string) => {
        switch (category) {
            case 'TRANSPORT': return <Truck className="h-6 w-6 text-blue-500" />;
            case 'MEDICAL': return <Video className="h-6 w-6 text-red-500" />;
            case 'LOGISTICS': return <Pill className="h-6 w-6 text-green-500" />;
            default: return <Package className="h-6 w-6 text-gray-500" />;
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

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Add-on Services</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Request additional support for your family members.
                </p>
            </div>

            {/* Available Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && services.length === 0 ? (
                    <div className="col-span-full flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-kera-vibrant" />
                    </div>
                ) : (
                    services.map((service) => (
                        <Card key={service.id} hover className="flex flex-col h-full">
                            <div className="flex items-start justify-between">
                                <div className="p-2 rounded-lg bg-gray-50">
                                    {getIconForCategory(service.category)}
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {formatPrice(service.price, service.currency)}
                                </span>
                            </div>
                            <div className="mt-4 flex-1">
                                <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                                <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                            </div>
                            <div className="mt-6">
                                <Button 
                                    onClick={() => handleRequestClick(service)}
                                    className="w-full justify-center"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Request Service
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Request History */}
            {requests.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900">Request History</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {requests.map((request) => (
                                <li key={request.id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 mr-3">
                                                    {getIconForCategory(request.service.category)}
                                                </div>
                                                <p className="text-sm font-medium text-kera-vibrant truncate">
                                                    {request.service.name}
                                                </p>
                                            </div>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                    Requested on {format(new Date(request.createdAt), 'MMM d, yyyy')}
                                                </p>
                                                {request.scheduledDate && (
                                                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                        <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                        Scheduled for {format(new Date(request.scheduledDate), 'MMM d, yyyy')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <RequestServiceModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    fetchData(); // Refresh history
                }} 
                service={selectedService} 
            />
        </div>
    );
}
