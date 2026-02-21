"use client";
import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pill, Calendar, Clock, FileText } from 'lucide-react';

interface AddMedicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    patientId: string;
}

export default function AddMedicationModal({
    isOpen,
    onClose,
    onSuccess,
    patientId
}: AddMedicationModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const dosage = formData.get('dosage') as string;
        const frequency = formData.get('frequency') as string;
        const startDate = formData.get('startDate') as string;
        const endDate = formData.get('endDate') as string;
        const notes = formData.get('notes') as string;

        const data = {
            patientId,
            name,
            dosage,
            frequency,
            startDate,
            endDate,
            notes,
        };

        try {
            const res = await fetch('/api/medications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const errorData = await res.json();
                setErrors({ submit: errorData.error || 'Failed to add medication' });
            }
        } catch (error) {
            console.error(error);
            setErrors({ submit: 'An error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Medication"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {errors.submit && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                        {errors.submit}
                    </div>
                )}

                <Input
                    label="Medication Name"
                    name="name"
                    placeholder="e.g. Lisinopril"
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Dosage"
                        name="dosage"
                        placeholder="e.g. 10mg"
                        required
                    />
                    <Input
                        label="Frequency"
                        name="frequency"
                        placeholder="e.g. Once daily"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Start Date"
                        name="startDate"
                        type="date"
                    />
                    <Input
                        label="End Date"
                        name="endDate"
                        type="date"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Notes
                    </label>
                    <textarea
                        name="notes"
                        rows={3}
                        className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-kera-vibrant focus:outline-none focus:ring-1 focus:ring-kera-vibrant"
                        placeholder="Additional instructions..."
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                    >
                        Add Medication
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
