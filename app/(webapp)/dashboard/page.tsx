"use client";
import React, { useEffect, useState } from 'react';
import { Activity, Droplet, Pill, Plus, UserPlus } from 'lucide-react';
import MoodBadge from '@/components/MoodBadge';
import AddHealthRecordModal from '@/components/dashboard/AddHealthRecordModal';
import AddPatientModal from '@/components/dashboard/AddPatientModal';
import PatientList from '@/components/dashboard/PatientList';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface HealthRecord {
    id: string;
    recordedAt: string;
    patient: { name: string };
    systolicBP: number | null;
    diastolicBP: number | null;
    glucose: number | null;
    temperature: number | null;
    mood: string | null;
}

interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    patient: { name: string };
}

interface Patient {
    id: string;
    name: string;
}

export default function DashboardOverview() {
    const [records, setRecords] = useState<HealthRecord[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // Triggers re-fetch

    const fetchData = async () => {
        try {
            const [recRes, medRes, patRes] = await Promise.all([
                fetch('/api/health-records'),
                fetch('/api/medications'),
                fetch('/api/patients')
            ]);

            if (recRes.ok) setRecords(await recRes.json());
            if (medRes.ok) setMedications(await medRes.json());
            if (patRes.ok) setPatients(await patRes.json());
        } catch (error) {
            console.error("Failed to fetch health data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshKey]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate latest vitals
    const latestBP = records.find(r => r.systolicBP && r.diastolicBP);
    const latestGlucose = records.find(r => r.glucose);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Health Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Overview of your family&apos;s health and care
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setIsAddPatientModalOpen(true)} variant="secondary" size="md">
                        <UserPlus className="h-4 w-4" />
                        Add Member
                    </Button>
                    <Button onClick={() => setIsLogModalOpen(true)} size="md">
                        <Plus className="h-4 w-4" />
                        Log Vitals
                    </Button>
                </div>
            </div>

            {/* Key Vitals Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Blood Pressure */}
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-red-100 p-3">
                            <Activity className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">Latest Blood Pressure</p>
                            <p className="text-lg font-bold text-gray-900">
                                {latestBP ? `${latestBP.systolicBP}/${latestBP.diastolicBP}` : '--/--'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {latestBP ? `${latestBP.patient.name} • ${formatDate(latestBP.recordedAt)}` : 'No recent data'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Blood Glucose */}
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 p-3">
                            <Droplet className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">Latest Glucose</p>
                            <p className="text-lg font-bold text-gray-900">
                                {latestGlucose?.glucose || '--'} <span className="text-sm font-normal text-gray-500">mg/dL</span>
                            </p>
                            <p className="text-xs text-gray-500">
                                {latestGlucose ? `${latestGlucose.patient.name} • ${formatDate(latestGlucose.recordedAt)}` : 'No recent data'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Active Medications */}
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-purple-100 p-3">
                            <Pill className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">Active Prescriptions</p>
                            <p className="text-lg font-bold text-gray-900">{medications.length}</p>
                            <p className="text-xs text-gray-500">Across all family members</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Family Members List - Takes up 1/3 on large screens */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Family Members</h2>
                    <PatientList key={refreshKey} />
                </div>

                {/* Recent Activity - Takes up 2/3 on large screens */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Health Updates</h2>
                    {loading ? (
                        <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-100">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kera-vibrant"></div>
                        </div>
                    ) : records.length === 0 ? (
                        <Card className="text-center py-12">
                            <Activity className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-4 text-sm font-semibold text-gray-900">No health records yet</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Log vitals to track your family&apos;s health.
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {records.slice(0, 10).map((record) => (
                                <Card key={record.id} padding="md" hover>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {record.patient.name}
                                                </p>
                                                {record.mood && <MoodBadge mood={record.mood} />}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {formatDate(record.recordedAt)}
                                            </p>
                                        </div>
                                        <div className="flex gap-4 text-sm">
                                            {record.systolicBP && record.diastolicBP && (
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500">BP</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {record.systolicBP}/{record.diastolicBP}
                                                    </p>
                                                </div>
                                            )}
                                            {record.glucose && (
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500">Glucose</p>
                                                    <p className="font-semibold text-gray-900">{record.glucose}</p>
                                                </div>
                                            )}
                                            {record.temperature && (
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500">Temp</p>
                                                    <p className="font-semibold text-gray-900">{record.temperature}°C</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Health Record Modal */}
            <AddHealthRecordModal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                onSuccess={() => {
                    setRefreshKey(prev => prev + 1);
                    setIsLogModalOpen(false);
                }}
                patients={patients}
            />

            {/* Add Patient Modal */}
            <AddPatientModal
                isOpen={isAddPatientModalOpen}
                onClose={() => setIsAddPatientModalOpen(false)}
                onSuccess={() => {
                    setRefreshKey(prev => prev + 1);
                    setIsAddPatientModalOpen(false);
                }}
            />
        </div>
    );
}
