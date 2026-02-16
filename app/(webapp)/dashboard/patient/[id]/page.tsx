"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { User, MapPin, Activity, Heart, Calendar, Clock, FileText } from 'lucide-react';
import MoodBadge from '@/components/MoodBadge';
import AddHealthRecordModal from '@/components/dashboard/AddHealthRecordModal';

interface Patient {
    id: string;
    name: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    country?: string;
    healthRecords: any[];
    appointments: any[];
    medications: any[];
}

export default function PatientDetailsPage() {
    const params = useParams();
    const { id } = params;
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

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
    }, [fetchPatient, refreshKey]);

    const handleHealthRecordSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading patient details...</div>;
    if (!patient) return <div className="p-8 text-center text-red-500">Patient not found</div>;

    return (
        <div className="space-y-6">
            {/* Header / Profile Card */}
            <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
                <div className="p-6 sm:flex sm:items-center sm:justify-between">
                    <div className="sm:flex sm:space-x-5">
                        <div className="shrink-0">
                            <div className="mx-auto h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                                {patient.name.charAt(0)}
                            </div>
                        </div>
                        <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                            <p className="text-xl font-bold text-gray-900 sm:text-2xl">{patient.name}</p>
                            <p className="text-sm font-medium text-gray-500">
                                {patient.gender ? <span className="capitalize">{patient.gender}</span> : 'Gender not specified'}
                                {patient.dateOfBirth && ` • ${new Date(patient.dateOfBirth).toLocaleDateString()}`}
                            </p>
                            <div className="mt-2 flex items-center text-sm text-gray-500 justify-center sm:justify-start">
                                <MapPin className="mr-1.5 h-4 w-4 shrink-0 text-gray-400" />
                                {patient.city || 'Unknown City'}, {patient.country || 'Myanmar'}
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex justify-center sm:mt-0">
                        <button className="flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                <Activity className="mr-2 h-5 w-5 text-kera-vibrant" />
                                Recent Health Records
                            </h3>
                            <button
                                onClick={() => setIsHealthModalOpen(true)}
                                className="text-sm text-white bg-kera-vibrant hover:bg-[#00a855] px-3 py-1 rounded shadow-sm font-medium transition-colors"
                            >
                                + Log Vitals
                            </button>
                        </div>
                        {patient.healthRecords && patient.healthRecords.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BP</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Glucose</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mood</th>
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
                                                    <MoodBadge mood={record.mood} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                                <Activity className="h-10 w-10 text-gray-300 mb-2" />
                                <p>No health records yet.</p>
                                <button
                                    onClick={() => setIsHealthModalOpen(true)}
                                    className="mt-2 text-kera-vibrant hover:underline"
                                >
                                    Log the first check-up
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Medications */}
                    <div className="bg-white shadow rounded-lg border border-gray-100">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                <Heart className="mr-2 h-5 w-5 text-red-500" />
                                Medications
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
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm text-center">No active medications.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Appointments & Actions */}
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg border border-gray-100">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                                Upcoming Visits
                            </h3>
                        </div>
                        <div className="p-4">
                            {patient.appointments && patient.appointments.length > 0 ? (
                                <ul className="space-y-4">
                                    {patient.appointments.map((appt) => (
                                        <li key={appt.id} className="border-l-4 border-blue-500 pl-3 py-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(appt.scheduledAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center mt-1">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">{appt.notes || 'Routine Visit'}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500 mb-3">No upcoming visits.</p>
                                    <button className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md shadow-sm transition-colors">
                                        Schedule Visit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg border border-gray-100 p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setIsHealthModalOpen(true)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md flex items-center"
                            >
                                <Activity className="mr-2 h-4 w-4 text-green-600" />
                                Log Vitals
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md flex items-center">
                                <FileText className="mr-2 h-4 w-4 text-purple-600" />
                                Add Care Note
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AddHealthRecordModal
                isOpen={isHealthModalOpen}
                onClose={() => setIsHealthModalOpen(false)}
                onSuccess={handleHealthRecordSuccess}
                patientId={patient.id}
                patientName={patient.name}
            />
        </div>
    );
}
