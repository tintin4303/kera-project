"use client";
import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Calendar, Clock, User, MapPin, Activity, ChevronDown, Repeat } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Patient {
    id: string;
    name: string;
}

interface AddScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddScheduleModal({ isOpen, onClose, onSuccess }: AddScheduleModalProps) {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        patientId: '',
        date: '',
        time: '',
        type: 'Regular Checkup',
        notes: '',
        location: 'Home',
        recurring: false,
    });

    useEffect(() => {
        if (isOpen) {
            fetchPatients();
        }
    }, [isOpen]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/carer/patients');
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
            const scheduledAt = new Date(`${formData.date}T${formData.time}`);

            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: formData.patientId,
                    scheduledAt: scheduledAt.toISOString(),
                    notes: `Service: ${formData.type}\nNotes: ${formData.notes}`,
                    location: formData.location,
                    duration: 60,
                    recurring: formData.recurring
                }),
            });

            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(errorData || 'Failed to schedule');
            }

            onSuccess();
            onClose();
            router.refresh();
        } catch (error) {
            console.error("Error scheduling visit:", error);
            alert(error instanceof Error ? error.message : "Failed to schedule. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Schedule" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Patient Selection */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Patient</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                            required
                            disabled={loading}
                            value={formData.patientId}
                            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-sm focus:border-kera-vibrant focus:ring-1 focus:ring-kera-vibrant outline-none appearance-none bg-white disabled:bg-gray-50"
                        >
                            {loading ? (
                                <option>Loading patients...</option>
                            ) : patients.length === 0 ? (
                                <option value="">No patients assigned</option>
                            ) : (
                                patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))
                            )}
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Service Type */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Visit Type</label>
                    <div className="relative">
                        <Activity className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-sm focus:border-kera-vibrant focus:ring-1 focus:ring-kera-vibrant outline-none appearance-none bg-white"
                        >
                            <option>Regular Checkup</option>
                            <option>Vitals Check</option>
                            <option>Medication Review</option>
                            <option>Follow-up Visit</option>
                            <option>Initial Assessment</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 pl-10 py-2 text-sm focus:border-kera-vibrant focus:ring-1 focus:ring-kera-vibrant outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Time</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 pl-10 py-2 text-sm focus:border-kera-vibrant focus:ring-1 focus:ring-kera-vibrant outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Recurring Option */}
                <div className="bg-kera-vibrant/5 p-3 rounded-lg border border-kera-vibrant/20">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.recurring}
                            onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                            className="h-4 w-4 text-kera-vibrant border-gray-300 rounded focus:ring-kera-vibrant"
                        />
                        <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900 flex items-center">
                                <Repeat className="mr-1.5 h-3.5 w-3.5" />
                                Set Regular Schedule
                            </span>
                            <p className="text-xs text-gray-500">
                                This will create 4 visits (once per week) starting from the selected date.
                            </p>
                        </div>
                    </label>
                </div>

                {/* Location */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Home, Clinic, etc."
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="pl-10 h-10"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-kera-vibrant focus:ring-1 focus:ring-kera-vibrant outline-none placeholder:text-gray-400"
                        placeholder="Instructions or symptoms to check..."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={submitting}
                        className="text-gray-500"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={submitting} className="px-6 bg-kera-vibrant hover:bg-[#00a855]">
                        {formData.recurring ? 'Add Regular Schedule' : 'Confirm Schedule'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
