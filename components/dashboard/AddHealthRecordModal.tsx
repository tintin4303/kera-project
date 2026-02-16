"use client";
import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Activity, Droplet, Thermometer, Smile, Meh, Frown } from 'lucide-react';

interface Patient {
    id: string;
    name: string;
}

interface AddHealthRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    patientId?: string;
    patientName?: string;
    patients?: Patient[];
}

const moodOptions = [
    { value: 'Happy', icon: Smile, color: 'text-green-600', bgColor: 'bg-green-100' },
    { value: 'Neutral', icon: Meh, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { value: 'Sad', icon: Frown, color: 'text-red-600', bgColor: 'bg-red-100' },
];

export default function AddHealthRecordModal({
    isOpen,
    onClose,
    onSuccess,
    patientId,
    patientName,
    patients = []
}: AddHealthRecordModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [mood, setMood] = useState('Neutral');
    const [selectedPatientId, setSelectedPatientId] = useState(patientId || '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setSelectedPatientId(patientId || (patients.length > 0 ? patients[0].id : ''));
            setMood('Neutral');
            setErrors({});
        }
    }, [isOpen, patientId, patients]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        if (!selectedPatientId) {
            setErrors({ patient: 'Please select a family member' });
            return;
        }

        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        const getVal = (name: string) => {
            const val = formData.get(name);
            return val && val.toString().trim() !== '' ? val.toString() : null;
        };

        const data = {
            patientId: selectedPatientId,
            systolicBP: getVal('systolicBP'),
            diastolicBP: getVal('diastolicBP'),
            glucose: getVal('glucose'),
            temperature: getVal('temperature'),
            mood,
            notes: getVal('notes'),
        };

        try {
            const res = await fetch('/api/health-records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                onSuccess();
                onClose();
                (e.target as HTMLFormElement).reset();
            } else {
                const error = await res.text();
                setErrors({ submit: error || 'Failed to log vitals' });
            }
        } catch (error) {
            console.error(error);
            setErrors({ submit: 'An error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const displayPatientName = patientName || patients.find(p => p.id === selectedPatientId)?.name || 'Family Member';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Log Vitals${patientId ? ` for ${displayPatientName}` : ''}`}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Patient Selection (if not provided) */}
                {!patientId && (
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Select Family Member
                        </label>
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-kera-vibrant focus:outline-none focus:ring-2 focus:ring-kera-vibrant focus:ring-offset-1"
                            disabled={isLoading}
                        >
                            <option value="" disabled>Select a member</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        {errors.patient && (
                            <p className="mt-1 text-sm text-red-600">{errors.patient}</p>
                        )}
                    </div>
                )}

                {/* Vital Signs Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Blood Pressure */}
                    <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            <Activity className="inline h-4 w-4 mr-1" />
                            Blood Pressure (mmHg)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                name="systolicBP"
                                type="number"
                                placeholder="Systolic (e.g., 120)"
                                disabled={isLoading}
                            />
                            <Input
                                name="diastolicBP"
                                type="number"
                                placeholder="Diastolic (e.g., 80)"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Glucose */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            <Droplet className="inline h-4 w-4 mr-1" />
                            Blood Glucose (mg/dL)
                        </label>
                        <Input
                            name="glucose"
                            type="number"
                            step="0.1"
                            placeholder="e.g., 100"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Temperature */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            <Thermometer className="inline h-4 w-4 mr-1" />
                            Temperature (°C)
                        </label>
                        <Input
                            name="temperature"
                            type="number"
                            step="0.1"
                            placeholder="e.g., 37.0"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Mood Selection */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Mood
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {moodOptions.map(({ value, icon: Icon, color, bgColor }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setMood(value)}
                                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${mood === value
                                        ? 'border-kera-vibrant bg-teal-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                disabled={isLoading}
                            >
                                <div className={`rounded-full p-2 ${bgColor}`}>
                                    <Icon className={`h-5 w-5 ${color}`} />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{value}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Notes (Optional)
                    </label>
                    <textarea
                        name="notes"
                        rows={3}
                        placeholder="Any additional observations..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-kera-vibrant focus:outline-none focus:ring-2 focus:ring-kera-vibrant focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Log Vitals
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
