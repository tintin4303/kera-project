"use client";
import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Calendar, Clock, User, MapPin, Activity, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Patient {
    id: string;
    name: string;
}

interface BookAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BookAppointmentModal({ isOpen, onClose, onSuccess }: BookAppointmentModalProps) {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        patientId: '',
        date: '',
        time: '',
        type: 'Health Monitoring Visit', // Default service type -> notes
        notes: '',
        location: 'Home',
    });

    useEffect(() => {
        if (isOpen) {
            fetchPatients();
        }
    }, [isOpen]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/patients');
            if (res.ok) {
                const data = await res.json();
                setPatients(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, patientId: data[0].id }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch patients", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Combine date and time
            const scheduledAt = new Date(`${formData.date}T${formData.time}`);

            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: formData.patientId,
                    scheduledAt: scheduledAt.toISOString(),
                    notes: `Service: ${formData.type}\nNotes: ${formData.notes}`,
                    location: formData.location,
                    duration: 60 // Default 1 hour
                }),
            });

            if (!res.ok) throw new Error('Failed to book');

            onSuccess();
            onClose();
            router.refresh();
        } catch (error) {
            console.error("Error booking appointment:", error);
            alert("Failed to book appointment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Book New Visit" size="md">
            <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-sm text-gray-500 mb-2">
                    Schedule a care visit for your family member. We&apos;ll match you with a professional carer.
                </p>

                {/* Patient Selection */}
                <div className="relative">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Patient
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            <User size={18} />
                        </div>
                        <select
                            required
                            value={formData.patientId}
                            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2 text-sm transition-colors focus:border-kera-vibrant focus:outline-none focus:ring-2 focus:ring-kera-vibrant focus:ring-offset-1 appearance-none bg-white"
                        >
                            {patients.length === 0 ? (
                                <option value="">No patients found</option>
                            ) : (
                                patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))
                            )}
                        </select>
                        <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>

                {/* Service Type */}
                <div className="relative">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Service Type
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            <Activity size={18} />
                        </div>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2 text-sm transition-colors focus:border-kera-vibrant focus:outline-none focus:ring-2 focus:ring-kera-vibrant focus:ring-offset-1 appearance-none bg-white"
                        >
                            <option>Health Monitoring Visit</option>
                            <option>General Care Visit</option>
                            <option>Specialist Consultation</option>
                            <option>Emergency Assessment</option>
                        </select>
                        <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="relative">
                        <div className="absolute left-3 top-[34px] text-gray-400 pointer-events-none">
                            <Calendar size={18} />
                        </div>
                        <Input
                            label="Date"
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="pl-10"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute left-3 top-[34px] text-gray-400 pointer-events-none">
                            <Clock size={18} />
                        </div>
                        <Input
                            label="Time"
                            type="time"
                            required
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="relative">
                    <div className="absolute left-3 top-[34px] text-gray-400">
                        <MapPin size={18} />
                    </div>
                    <Input
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Home, Clinic"
                        className="pl-10"
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Additional Notes
                    </label>
                    <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-kera-vibrant focus:outline-none focus:ring-2 focus:ring-kera-vibrant focus:ring-offset-1"
                        placeholder="Any specific concerns or instructions..."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={submitting} className="px-8">
                        Confirm Booking
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
