"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import MoodBadge from '@/components/MoodBadge';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/components/LanguageContext';

interface Patient {
    id: string;
    name: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    country?: string;
    healthRecords: HealthRecord[];
    appointments: Appointment[];
    medications: Medication[];
    carer?: {
        user: {
            name: string;
            image?: string | null;
        }
    } | null;
}

interface HealthRecord {
    id: string;
    recordedAt: string;
    systolicBP?: number | null;
    diastolicBP?: number | null;
    glucose?: number | null;
    mood?: Mood | null;
}

interface Medication {
    id: string;
    name: string;
    dosage?: string | null;
    frequency?: string | null;
}

interface Appointment {
    id: string;
    scheduledAt: string;
    notes?: string | null;
}

type Mood = 'Happy' | 'Neutral' | 'Sad' | 'Anxious';

export default function PatientDetailsPage() {
    const params = useParams();
    const { id } = params;
    const { t } = useLanguage();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        country: ''
    });

    const fetchPatient = useCallback(async () => {
        if (!id) return;
        try {
            const res = await fetch(`/api/patients/${id}`);
            if (res.ok) {
                const data = await res.json();
                setPatient(data);
            } else {
                console.error("Failed to fetch patient");
            }
        } catch (error) {
            console.error("Error fetching patient", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPatient();
    }, [fetchPatient]);

    const handleEditClick = () => {
        if (!patient) return;
        setEditFormData({
            name: patient.name,
            dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
            gender: patient.gender || '',
            address: patient.address || '',
            city: patient.city || '',
            country: patient.country || ''
        });
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/patients/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData)
            });

            if (res.ok) {
                const updatedPatient = await res.json();
                setPatient(prev => prev ? { ...prev, ...updatedPatient } : updatedPatient);
                setIsEditModalOpen(false);
            } else {
                alert("Failed to update patient");
            }
        } catch (error) {
            console.error("Error updating patient", error);
            alert("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">{t('patient.loading')}</div>;
    if (!patient) return <div className="p-8 text-center text-red-500">{t('patient.not_found')}</div>;

    return (
        <div className="space-y-6">
            {/* Header / Profile Card */}
            <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
                <div className="p-4 sm:flex sm:items-center sm:justify-between">
                    <div className="sm:flex sm:space-x-4">
                        <div className="shrink-0">
                            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                                {patient.name.charAt(0)}
                            </div>
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:pt-1 sm:text-left">
                            <p className="text-lg font-bold text-gray-900 sm:text-xl">{patient.name}</p>
                            <p className="text-sm font-medium text-gray-500">
                                {patient.gender ? <span className="capitalize">{patient.gender}</span> : t('patient.gender_unspecified')}
                                {patient.dateOfBirth && ` • ${new Date(patient.dateOfBirth).toLocaleDateString()}`}
                            </p>
                            <div className="mt-1 flex items-center text-sm text-gray-500 justify-center sm:justify-start">
                                {patient.city || t('patient.unknown_city')}, {patient.country || 'Myanmar'}
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-center sm:mt-0">
                        <button
                            onClick={handleEditClick}
                            className="flex justify-center items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Health Summary */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Recent Vitals */}
                    <div className="bg-white shadow rounded-lg border border-gray-100">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {t('patient.recent_records')}
                            </h3>
                        </div>
                        {patient.healthRecords && patient.healthRecords.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('patient.table.date')}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('patient.table.bp')}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('patient.table.glucose')}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('patient.table.mood')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {patient.healthRecords.map((record) => (
                                            <tr key={record.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(record.recordedAt).toLocaleDateString()}
                                                    <span className="block text-xs text-gray-400">
                                                        {new Date(record.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {record.systolicBP ? `${record.systolicBP}/${record.diastolicBP}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {record.glucose ? `${record.glucose} mg/dL` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <MoodBadge mood={record.mood ?? 'Neutral'} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                <p>{t('patient.no_records')}</p>
                            </div>
                        )}
                    </div>

                    {/* Medications */}
                    <div className="bg-white shadow rounded-lg border border-gray-100">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {t('patient.medications')}
                            </h3>
                        </div>
                        <div className="p-4">
                            {patient.medications && patient.medications.length > 0 ? (
                                <ul className="space-y-3">
                                    {patient.medications.map((med) => (
                                        <li key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{med.name}</p>
                                                <p className="text-xs text-gray-500">{med.dosage} • {med.frequency}</p>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                {t('patient.active')}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm text-center">{t('patient.no_active_meds')}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Appointments */}
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg border border-gray-100">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {t('patient.upcoming_visits')}
                            </h3>
                        </div>
                        <div className="p-4">
                            {patient.appointments && patient.appointments.length > 0 ? (
                                <ul className="space-y-4">
                                    {patient.appointments.map((appt) => (
                                        <li key={appt.id} className="pl-3 py-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(appt.scheduledAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">{appt.notes || t('patient.routine_visit')}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500 mb-3">{t('patient.no_upcoming')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assigned Carer */}
                    <div className="bg-white shadow rounded-lg border border-gray-100">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {t('patient.assigned_carer')}
                            </h3>
                        </div>
                        <div className="p-4">
                            {patient.carer ? (
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden">
                                        {patient.carer.user.image ? (
                                            <img src={patient.carer.user.image} alt={patient.carer.user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{patient.carer.user.name}</p>
                                        <p className="text-xs text-kera-vibrant font-medium mt-0.5">{t('patient.verified_pro')}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500 italic text-center">{t('patient.assigning_carer')}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 text-center">{t('patient.matching')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={t('patient.modal.title')}
            >
                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <Input
                        label={t('patient.modal.name')}
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('patient.modal.dob')}
                            type="date"
                            value={editFormData.dateOfBirth}
                            onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                        />
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('patient.modal.gender')}</label>
                            <select
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-kera-vibrant focus:outline-none focus:ring-kera-vibrant"
                                value={editFormData.gender}
                                onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                            >
                                <option value="">{t('patient.modal.gender_select')}</option>
                                <option value="male">{t('patient.modal.gender_male')}</option>
                                <option value="female">{t('patient.modal.gender_female')}</option>
                                <option value="other">{t('patient.modal.gender_other')}</option>
                            </select>
                        </div>
                    </div>

                    <Input
                        label="Address"
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="City"
                            value={editFormData.city}
                            onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                        />
                        <Input
                            label="Country"
                            value={editFormData.country}
                            onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                        />
                    </div>

                    <div className="mt-5 flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={saving}
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
