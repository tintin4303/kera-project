"use client";
import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/components/LanguageContext';

interface Patient {
    id: string;
    name: string;
    city: string;
    country: string;
    gender: string | null;
    _count?: {
        healthRecords: number;
        medications: number;
    };
}

export default function CarerPatients() {
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useLanguage();
    const { data: patients = [], isLoading: loading } = useQuery<Patient[]>({
        queryKey: ['carer-patients'],
        queryFn: async () => {
            const res = await fetch('/api/carer/patients');
            if (!res.ok) throw new Error('Failed to fetch patients');
            return res.json();
        }
    });

    return (
        <div className="space-y-6">


            {/* Patient List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : patients.length === 0 ? (
                <Card className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-sm font-semibold text-gray-900">{t('patients.none_assigned')}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {t('patients.contact_admin')}
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder={t('patients.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:max-w-xs text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>

                    {patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
                            {t('patients.no_match')}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 whitespace-nowrap">{t('patients.patient')}</th>
                                            <th className="px-4 py-3 whitespace-nowrap">{t('patients.location')}</th>
                                            <th className="px-4 py-3 text-right whitespace-nowrap">{t('patients.records_meds')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((patient) => (
                                            <tr key={patient.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-4 py-3">
                                                    <Link href={`/carer/patient/${patient.id}`} className="flex items-center gap-3 w-max">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                                                            {patient.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                                                            {patient.name}
                                                        </span>
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                    {patient.gender && `${patient.gender} • `}
                                                    {patient.city}, {patient.country}
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-3 text-xs">
                                                        <span className="flex items-center gap-1" title="Health Records">
                                                            <span className="text-gray-400">{t('patients.records')}:</span>
                                                            <span className="font-medium">{patient._count?.healthRecords || 0}</span>
                                                        </span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="flex items-center gap-1" title="Medications">
                                                            <span className="text-gray-400">{t('patients.meds')}:</span>
                                                            <span className="font-medium">{patient._count?.medications || 0}</span>
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
