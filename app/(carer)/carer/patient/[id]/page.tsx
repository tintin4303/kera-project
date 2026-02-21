"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Activity, Droplet, Heart, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import MoodBadge from '@/components/MoodBadge';
import AddHealthRecordModal from '@/components/dashboard/AddHealthRecordModal';
import AddMedicationModal from '@/components/dashboard/AddMedicationModal';

interface Patient {
    id: string;
    name: string;
    dateOfBirth: string | null;
    gender: string | null;
    city: string | null;
    country: string | null;
}

interface HealthRecord {
    id: string;
    recordedAt: string;
    systolicBP: number | null;
    diastolicBP: number | null;
    glucose: number | null;
    temperature: number | null;
    mood: Mood | null;
    notes: string | null;
}

interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    isActive: boolean;
}

type Mood = 'Happy' | 'Neutral' | 'Sad' | 'Anxious';

export default function CarerPatientDetail() {
    const params = useParams();
    const patientId = params.id as string;

    const [patient, setPatient] = useState<Patient | null>(null);
    const [records, setRecords] = useState<HealthRecord[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isAddMedicationModalOpen, setIsAddMedicationModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientRes, recordsRes, medsRes] = await Promise.all([
                    fetch(`/api/patients/${patientId}`),
                    fetch(`/api/health-records?patientId=${patientId}`),
                    fetch(`/api/medications?patientId=${patientId}`),
                ]);

                if (patientRes.ok) setPatient(await patientRes.json());
                if (recordsRes.ok) setRecords(await recordsRes.json());
                if (medsRes.ok) setMedications(await medsRes.json());
            } catch (error) {
                console.error("Failed to fetch patient data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [patientId, refreshKey]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateAge = (dob: string | null) => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Patient not found</p>
            </div>
        );
    }

    const latestBP = records.find(r => r.systolicBP && r.diastolicBP);
    const latestGlucose = records.find(r => r.glucose);
    const activeMeds = medications.filter(m => m.isActive);

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link href="/carer/patients">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Patients
                </Button>
            </Link>

            {/* Patient Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                        <p className="text-sm text-gray-500">
                            {patient.gender && `${patient.gender} • `}
                            {patient.dateOfBirth && `${calculateAge(patient.dateOfBirth)} years • `}
                            {patient.city}, {patient.country}
                        </p>
                    </div>
                </div>
                <Button onClick={() => setIsLogModalOpen(true)} size="md">
                    <Plus className="h-4 w-4" />
                    Log Vitals
                </Button>
            </div>

            {/* Key Vitals */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-red-100 p-3">
                            <Activity className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">Blood Pressure</p>
                            <p className="text-lg font-bold text-gray-900">
                                {latestBP ? `${latestBP.systolicBP}/${latestBP.diastolicBP}` : '--/--'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {latestBP ? formatDate(latestBP.recordedAt) : 'No data'}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 p-3">
                            <Droplet className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">Blood Glucose</p>
                            <p className="text-lg font-bold text-gray-900">
                                {latestGlucose?.glucose || '--'} <span className="text-sm font-normal text-gray-500">mg/dL</span>
                            </p>
                            <p className="text-xs text-gray-500">
                                {latestGlucose ? formatDate(latestGlucose.recordedAt) : 'No data'}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-purple-100 p-3">
                            <Heart className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">Active Medications</p>
                            <p className="text-lg font-bold text-gray-900">{activeMeds.length}</p>
                            <p className="text-xs text-gray-500">Prescriptions</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Health Records */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Health Records</h2>
                {records.length === 0 ? (
                    <Card className="text-center py-12">
                        <Activity className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-4 text-sm font-semibold text-gray-900">No records yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Start logging vitals to track this patient&apos;s health.
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {records.map((record) => (
                            <Card key={record.id} padding="md" hover>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatDate(record.recordedAt)}
                                            </p>
                                            {record.mood && <MoodBadge mood={record.mood ?? 'Neutral'} />}
                                        </div>
                                        {record.notes && (
                                            <p className="text-xs text-gray-500 mt-1">{record.notes}</p>
                                        )}
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

            {/* Active Medications */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Active Medications</h2>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsAddMedicationModalOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Medication
                    </Button>
                </div>
                {activeMeds.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {activeMeds.map((med) => (
                            <Card key={med.id} padding="md">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{med.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {med.dosage} • {med.frequency}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-8 bg-gray-50 border-dashed">
                        <p className="text-sm text-gray-500">No active medications</p>
                    </Card>
                )}
            </div>

            {/* Add Health Record Modal */}
            <AddHealthRecordModal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                onSuccess={() => {
                    setRefreshKey(prev => prev + 1);
                }}
                patients={[patient]}
                preSelectedPatientId={patient.id}
            />

            {/* Add Medication Modal */}
            <AddMedicationModal
                isOpen={isAddMedicationModalOpen}
                onClose={() => setIsAddMedicationModalOpen(false)}
                onSuccess={() => {
                    setRefreshKey(prev => prev + 1);
                }}
                patientId={patient.id}
            />
        </div>
    );
}
