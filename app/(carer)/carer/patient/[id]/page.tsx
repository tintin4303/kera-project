"use client";
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import MoodBadge from '@/components/MoodBadge';
import AddHealthRecordModal from '@/components/dashboard/AddHealthRecordModal';
import AddMedicationModal from '@/components/dashboard/AddMedicationModal';
import AddReportModal from '@/components/dashboard/AddReportModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/components/LanguageContext';

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

interface Report {
    id: string;
    title: string;
    summary: string;
    createdAt: string;
    periodStart: string;
    periodEnd: string;
}

type Mood = 'Happy' | 'Neutral' | 'Sad' | 'Anxious';

export default function CarerPatientDetail() {
    const params = useParams();
    const patientId = params.id as string;
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isAddMedicationModalOpen, setIsAddMedicationModalOpen] = useState(false);
    const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);

    const { data: patient, isLoading: loadingPatient } = useQuery<Patient>({
        queryKey: ['patient', patientId],
        queryFn: async () => {
            const res = await fetch(`/api/patients/${patientId}`);
            if (!res.ok) throw new Error('Failed to fetch patient');
            return res.json();
        }
    });

    const { data: records = [] } = useQuery<HealthRecord[]>({
        queryKey: ['health-records', patientId],
        queryFn: async () => {
            const res = await fetch(`/api/health-records?patientId=${patientId}`);
            if (!res.ok) throw new Error('Failed to fetch records');
            return res.json();
        }
    });

    const { data: medications = [] } = useQuery<Medication[]>({
        queryKey: ['medications', patientId],
        queryFn: async () => {
            const res = await fetch(`/api/medications?patientId=${patientId}`);
            if (!res.ok) throw new Error('Failed to fetch medications');
            return res.json();
        }
    });

    const { data: reports = [] } = useQuery<Report[]>({
        queryKey: ['reports', patientId],
        queryFn: async () => {
            const res = await fetch(`/api/reports?patientId=${patientId}`);
            if (!res.ok) throw new Error('Failed to fetch reports');
            return res.json();
        }
    });

    const loading = loadingPatient;
    const activeMeds = medications.filter(m => m.isActive);

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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">{t('carer_patient_detail.patient_not_found')}</p>
            </div>
        );
    }

    const latestBP = records.find(r => r.systolicBP && r.diastolicBP);
    const latestGlucose = records.find(r => r.glucose);

    return (
        <div className="space-y-6">
            {/* Patient Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-2xl">
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
                    {t('carer_patient_detail.log_vitals')}
                </Button>
            </div>

            {/* Key Vitals */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">{t('carer_patient_detail.blood_pressure')}</p>
                            <p className="text-lg font-bold text-gray-900">
                                {latestBP ? `${latestBP.systolicBP}/${latestBP.diastolicBP}` : '--/--'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {latestBP ? formatDate(latestBP.recordedAt) : t('carer_patient_detail.no_data')}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">{t('carer_patient_detail.blood_glucose')}</p>
                            <p className="text-lg font-bold text-gray-900">
                                {latestGlucose?.glucose || '--'} <span className="text-sm font-normal text-gray-500">{t('carer_patient_detail.mg_dl')}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                                {latestGlucose ? formatDate(latestGlucose.recordedAt) : t('carer_patient_detail.no_data')}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">{t('carer_patient_detail.active_medications')}</p>
                            <p className="text-lg font-bold text-gray-900">{activeMeds.length}</p>
                            <p className="text-xs text-gray-500">{t('carer_patient_detail.prescriptions')}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Health Records */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('carer_patient_detail.recent_records')}</h2>
                {records.length === 0 ? (
                    <Card className="text-center py-12">
                        <h3 className="text-sm font-semibold text-gray-900">{t('carer_patient_detail.no_records')}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {t('carer_patient_detail.log_vitals_info')}
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
                                                <p className="text-xs text-gray-500">{t('carer_patient_detail.bp')}</p>
                                                <p className="font-semibold text-gray-900">
                                                    {record.systolicBP}/{record.diastolicBP}
                                                </p>
                                            </div>
                                        )}
                                        {record.glucose && (
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500">{t('carer_patient_detail.glucose')}</p>
                                                <p className="font-semibold text-gray-900">{record.glucose}</p>
                                            </div>
                                        )}
                                        {record.temperature && (
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500">{t('carer_patient_detail.temp')}</p>
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
                    <h2 className="text-lg font-semibold text-gray-900">{t('carer_patient_detail.active_medications')}</h2>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsAddMedicationModalOpen(true)}
                    >
                        {t('carer_patient_detail.add_medication')}
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
                        <p className="text-sm text-gray-500">{t('carer_patient_detail.no_active_medications')}</p>
                    </Card>
                )}
            </div>

            {/* Reports */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{t('carer_patient_detail.reports')}</h2>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsAddReportModalOpen(true)}
                    >
                        {t('carer_patient_detail.create_report')}
                    </Button>
                </div>
                {reports.length > 0 ? (
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <Card key={report.id} padding="md" hover>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-900">{report.title}</p>
                                        <p className="text-xs text-gray-500">{formatDate(report.createdAt)}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t('carer_patient_detail.period')} {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{report.summary}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-8 bg-gray-50 border-dashed">
                        <p className="text-sm text-gray-500">{t('carer_patient_detail.no_reports')}</p>
                    </Card>
                )}
            </div>

            {/* Add Health Record Modal */}
            <AddHealthRecordModal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['health-records', patientId] });
                    setIsLogModalOpen(false);
                }}
                patients={[patient]}
                preSelectedPatientId={patient.id}
            />

            {/* Add Medication Modal */}
            <AddMedicationModal
                isOpen={isAddMedicationModalOpen}
                onClose={() => setIsAddMedicationModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['medications', patientId] });
                    setIsAddMedicationModalOpen(false);
                }}
                patientId={patient.id}
            />

            {/* Add Report Modal */}
            <AddReportModal
                isOpen={isAddReportModalOpen}
                onClose={() => setIsAddReportModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['reports', patientId] });
                    setIsAddReportModalOpen(false);
                }}
                patientId={patient.id}
                patientName={patient.name}
            />
        </div>
    );
}
