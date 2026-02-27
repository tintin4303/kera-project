"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, FileText, MessageSquare, Languages, Calendar, Plus } from 'lucide-react';
import AddPatientModal from '@/components/dashboard/AddPatientModal';
import PatientList from '@/components/dashboard/PatientList';
import Card from '@/components/ui/Card';
import { useLanguage } from '@/components/LanguageContext';
export default function DashboardOverview() {
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            {/* Family Members List - Full Width */}
            <div className="space-y-4">
                <PatientList key={refreshKey} />
            </div>

            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{t('family.core.title')}</h2>
                    <p className="text-xs text-gray-500">{t('family.core.subtitle')}</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <Card hover padding="sm" className="border border-gray-100 bg-white rounded-2xl p-3">
                        <div className="flex flex-col items-center">
                            <Activity className="h-5 w-5 text-gray-400 mb-2" />
                            <h3 className="text-xs font-bold text-gray-900">{t('family.feature.health_monitor')}</h3>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 text-center">{t('family.feature.health_monitor_desc')}</p>
                            <Link href="/dashboard" className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-gray-100 rounded-full w-full">
                                {t('family.feature.view')}
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="border border-gray-100 bg-white rounded-2xl p-3">
                        <div className="flex flex-col items-center">
                            <FileText className="h-5 w-5 text-gray-400 mb-2" />
                            <h3 className="text-xs font-bold text-gray-900">{t('family.feature.reports')}</h3>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 text-center">{t('family.feature.reports_desc')}</p>
                            <Link href="/dashboard/reports" className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-gray-100 rounded-full w-full">
                                {t('family.feature.view')}
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="border border-gray-100 bg-white rounded-2xl p-3">
                        <div className="flex flex-col items-center">
                            <MessageSquare className="h-5 w-5 text-gray-400 mb-2" />
                            <h3 className="text-xs font-bold text-gray-900">{t('family.feature.chat')}</h3>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 text-center">{t('family.feature.chat_desc')}</p>
                            <Link href="/dashboard/chat" className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-gray-100 rounded-full w-full">
                                {t('family.feature.message')}
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="border border-gray-100 bg-white rounded-2xl p-3">
                        <div className="flex flex-col items-center">
                            <Calendar className="h-5 w-5 text-gray-400 mb-2" />
                            <h3 className="text-xs font-bold text-gray-900">{t('family.feature.checkups')}</h3>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 text-center">{t('family.feature.checkups_desc')}</p>
                            <Link href="/dashboard/appointments" className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-gray-100 rounded-full w-full">
                                {t('family.feature.view')}
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="border border-gray-100 bg-white rounded-2xl p-3">
                        <div className="flex flex-col items-center">
                            <Languages className="h-5 w-5 text-gray-400 mb-2" />
                            <h3 className="text-xs font-bold text-gray-900">{t('family.feature.burmese_ui')}</h3>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 text-center">{t('family.feature.burmese_ui_desc')}</p>
                            <Link href="/dashboard/profile" className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-gray-100 rounded-full w-full">
                                {t('family.feature.settings')}
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Add Patient Modal */}
            <AddPatientModal
                isOpen={isAddPatientModalOpen}
                onClose={() => setIsAddPatientModalOpen(false)}
                onSuccess={() => {
                    setRefreshKey(prev => prev + 1);
                }}
            />

            {/* Floating Add Member Button (matches carer's Add Schedule) */}
            <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-40">
                <button
                    onClick={() => setIsAddPatientModalOpen(true)}
                    className="p-4 bg-kera-vibrant text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 hover:shadow-xl transition-all duration-200 ring-4 ring-white"
                    aria-label="Add Member"
                >
                    <Plus className="h-6 w-6 relative z-10" />
                </button>
            </div>
        </div>
    );
}
