"use client";
import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle } from 'lucide-react';

interface AddReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    patientId: string;
    patientName: string;
}

export default function AddReportModal({
    isOpen,
    onClose,
    onSuccess,
    patientId,
    patientName
}: AddReportModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [periodStart, setPeriodStart] = useState('');
    const [periodEnd, setPeriodEnd] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setSummary('');
            setRecommendations('');
            // Default to today
            const today = new Date().toISOString().split('T')[0];
            setPeriodStart(today);
            setPeriodEnd(today);
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId,
                    title,
                    summary,
                    recommendations,
                    periodStart,
                    periodEnd
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to create report');
            }

            onSuccess();
            onClose();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`New Report for ${patientName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                    <Input
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Weekly Visit Summary"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
                        <div className="relative">
                            <Input
                                type="date"
                                required
                                value={periodStart}
                                onChange={(e) => setPeriodStart(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
                        <div className="relative">
                            <Input
                                type="date"
                                required
                                value={periodEnd}
                                onChange={(e) => setPeriodEnd(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                    <textarea
                        required
                        rows={4}
                        className="block w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-kera-vibrant focus:ring-1 focus:ring-kera-vibrant"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Detailed summary of the patient's condition and care provided..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations (Optional)</label>
                    <textarea
                        rows={3}
                        className="block w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-kera-vibrant focus:ring-1 focus:ring-kera-vibrant"
                        value={recommendations}
                        onChange={(e) => setRecommendations(e.target.value)}
                        placeholder="Any suggestions for the family or future care..."
                    />
                </div>

                <div className="mt-5 sm:mt-6 flex justify-end gap-3">
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
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating...' : 'Create Report'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
