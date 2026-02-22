"use client";
import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Calendar, MapPin, Map, Activity, CheckCircle2 } from 'lucide-react';

interface AddPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [newPatientName, setNewPatientName] = useState('');
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
                setNewPatientName(name.trim());
                setIsSuccess(true);
                onSuccess();
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

    const handleClose = () => {
        setIsSuccess(false);
        onClose();
    };

    if (isSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title="Subscription Confirmed" size="md">
                <div className="py-8 flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Member Added & Subscribed!</h2>
                    <p className="text-gray-500 max-w-sm mb-6">
                        {newPatientName} has been added to your care circle and successfully enrolled in the <span className="font-semibold text-gray-900">Core Plan</span>.
                    </p>

                    <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100 mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Subscription Plan</span>
                            <span className="text-sm font-semibold text-gray-900">Core Plan</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Monthly Cost</span>
                            <span className="text-sm font-semibold text-kera-vibrant">990 THB</span>
                        </div>
                    </div>

                    <Button onClick={handleClose} className="w-full">
                        Return to Dashboard
                    </Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add Family Member" size="md">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-kera-vibrant/5 border border-kera-vibrant/10 rounded-lg p-3 mb-4">
                    <p className="text-xs text-kera-vibrant-dark font-medium flex items-center gap-2">
                        <Activity size={14} />
                        Subscription included: 990 THB/month Core Plan
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                        Adding a new member automatically starts a Core Plan subscription to enable health monitoring and care features.
                    </p>
                </div>

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

                {/* Subscription Confirmation Checkbox */}
                <div className="relative flex items-start py-2">
                    <div className="flex h-5 items-center">
                        <input
                            id="confirm-subscription"
                            name="confirmSubscription"
                            type="checkbox"
                            required
                            disabled={isLoading}
                            className="h-4 w-4 rounded border-gray-300 text-kera-vibrant focus:ring-kera-vibrant cursor-pointer"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="confirm-subscription" className="font-medium text-gray-700 cursor-pointer">
                            Confirm Subscription
                        </label>
                        <p className="text-gray-500 text-xs">
                            I understand that adding this member automatically starts a 990 THB monthly Core Plan subscription.
                        </p>
                    </div>
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
