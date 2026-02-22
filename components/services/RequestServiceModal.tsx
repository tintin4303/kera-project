'use client';

// Request service modal component
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: string;
}

interface Patient {
    id: string;
    name: string;
}

interface RequestServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
}

export default function RequestServiceModal({ isOpen, onClose, service }: RequestServiceModalProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [formData, setFormData] = useState({
        patientId: '',
        scheduledDate: '',
        location: '',
        notes: '',
    });

    useEffect(() => {
        if (isOpen) {
            const fetchPatients = async () => {
                try {
                    const res = await fetch('/api/patients');
                    if (res.ok) {
                        const data = await res.json();
                        setPatients(data);
                        // Default to first patient if available
                        if (data.length > 0) {
                            setFormData(prev => ({ ...prev, patientId: data[0].id }));
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch patients:', error);
                }
            };
            fetchPatients();
        }
    }, [isOpen]);

    if (!isOpen || !service) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/services/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    serviceId: service.id,
                    ...formData,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to request service');
            }

            alert('Service requested successfully! A coordinator will contact you shortly.');
            onClose();
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop with Blur */}
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div 
                    className="fixed inset-0 bg-gray-900/75 transition-opacity" 
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div 
                    className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-8 border border-gray-100 relative z-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div>
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-kera-light/30 ring-8 ring-kera-light/20">
                            <Plus className="h-8 w-8 text-kera-dark" />
                        </div>
                        <div className="mt-5 text-center">
                            <h3 className="text-2xl font-bold text-gray-900">
                                Request {service.name}
                            </h3>
                            <div className="mt-3">
                                <p className="text-base text-gray-500">
                                    {service.description}
                                </p>
                                <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-green-50 text-green-700 border border-green-100">
                                    Price: {(service.price / 100).toLocaleString()} {service.currency}
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="patientId" className="block text-sm font-semibold text-gray-700 mb-2">
                                Patient (Family Member)
                            </label>
                            <div className="relative flex items-center rounded-xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-kera-vibrant/20 focus-within:border-kera-vibrant transition-all duration-200">
                                <select
                                    name="patientId"
                                    id="patientId"
                                    required
                                    className="appearance-none block w-full pl-4 pr-10 py-3 bg-transparent border-none focus:ring-0 sm:text-sm text-gray-900"
                                    value={formData.patientId}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select a patient</option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            {patients.length === 0 && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    You need to add a family member in the &quot;Patients&quot; tab first.
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="scheduledDate" className="block text-sm font-semibold text-gray-700 mb-2">
                                Preferred Date
                            </label>
                            <div className="relative flex items-center rounded-xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-kera-vibrant/20 focus-within:border-kera-vibrant transition-all duration-200">
                                <input
                                    type="date"
                                    name="scheduledDate"
                                    id="scheduledDate"
                                    required
                                    className="block w-full pl-4 py-3 bg-transparent border-none focus:ring-0 sm:text-sm text-gray-900 placeholder-gray-500"
                                    value={formData.scheduledDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {service.category === 'TRANSPORT' && (
                            <div>
                                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Pickup Location / Destination
                                </label>
                                <div className="relative flex items-center rounded-xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-kera-vibrant/20 focus-within:border-kera-vibrant transition-all duration-200">
                                    <input
                                        type="text"
                                        name="location"
                                        id="location"
                                        required
                                        className="block w-full pl-4 py-3 bg-transparent border-none focus:ring-0 sm:text-sm text-gray-900 placeholder-gray-500"
                                        placeholder="Enter address"
                                        value={formData.location}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                                Additional Notes
                            </label>
                            <div className="relative flex items-start rounded-xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-kera-vibrant/20 focus-within:border-kera-vibrant transition-all duration-200">
                                <textarea
                                    name="notes"
                                    id="notes"
                                    rows={3}
                                    className="block w-full pl-4 py-3 bg-transparent border-none focus:ring-0 sm:text-sm text-gray-900 placeholder-gray-500 resize-none"
                                    placeholder="Any specific instructions or details..."
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-200 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent shadow-lg shadow-kera-vibrant/20 text-sm font-bold rounded-xl text-white bg-kera-vibrant hover:bg-[#00a855] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kera-vibrant transition-all transform active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm Request'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
