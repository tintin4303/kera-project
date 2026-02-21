"use client";
import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Calendar, MapPin, Map } from 'lucide-react';

interface AddPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;

        // Validation
        if (!name || name.trim() === '') {
            setErrors({ name: 'Name is required' });
            setIsLoading(false);
            return;
        }

        const data = {
            name: name.trim(),
            dateOfBirth: formData.get('dateOfBirth') || null,
            gender: formData.get('gender') || null,
            city: formData.get('city') || null,
            country: 'Myanmar',
            address: formData.get('address') || null,
        };

        try {
            const res = await fetch('/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                onSuccess();
                onClose();
                // Reset form
                (e.target as HTMLFormElement).reset();
            } else {
                const error = await res.text();
                setErrors({ submit: error || 'Failed to add family member' });
            }
        } catch (error) {
            console.error(error);
            setErrors({ submit: 'An error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Family Member" size="md">
            <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-sm text-gray-500 mb-2">
                    Fill in the details below to add a new family member to your care circle.
                </p>

                {/* Name */}
                <div className="relative">
                    <div className="absolute left-3 top-[34px] text-gray-400">
                        <User size={18} />
                    </div>
                    <Input
                        label="Full Name"
                        name="name"
                        placeholder="e.g., Daw Khin Khin"
                        required
                        error={errors.name}
                        disabled={isLoading}
                        className="pl-10"
                    />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* Date of Birth */}
                    <div className="relative">
                        <div className="absolute left-3 top-[34px] text-gray-400 pointer-events-none">
                            <Calendar size={18} />
                        </div>
                        <Input
                            label="Date of Birth"
                            name="dateOfBirth"
                            type="date"
                            disabled={isLoading}
                            className="pl-10"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Gender
                        </label>
                        <select
                            name="gender"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-kera-vibrant focus:outline-none focus:ring-2 focus:ring-kera-vibrant focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-50"
                            disabled={isLoading}
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* City */}
                <div className="relative">
                    <div className="absolute left-3 top-[34px] text-gray-400">
                        <Map size={18} />
                    </div>
                    <Input
                        label="City"
                        name="city"
                        placeholder="e.g., Yangon"
                        disabled={isLoading}
                        className="pl-10"
                    />
                </div>

                {/* Address */}
                <div className="relative">
                    <div className="absolute left-3 top-[34px] text-gray-400">
                        <MapPin size={18} />
                    </div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Address
                    </label>
                    <textarea
                        name="address"
                        rows={3}
                        placeholder="Enter full address"
                        className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-kera-vibrant focus:outline-none focus:ring-2 focus:ring-kera-vibrant focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-50"
                        disabled={isLoading}
                    />
                </div>

                {/* Error Message */}
                {errors.submit && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                        <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="px-8">
                        Add Member
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
