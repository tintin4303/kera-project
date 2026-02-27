"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, Bell, FileText, MessageSquare, Languages, Calendar, Plus } from 'lucide-react';
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Card hover padding="sm" className="border border-gray-100 bg-white/80 backdrop-blur rounded-2xl p-3">
                        <div className="flex flex-col items-center">
                            <div className="mx-auto rounded-lg bg-kera-vibrant/10 p-2.5 text-kera-vibrant">
                                <Activity className="h-5 w-5" />
                            </div>
                            <h3 className="mt-2 text-xs font-bold text-gray-900">{t('family.feature.health_monitor')}</h3>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 text-center">{t('family.feature.health_monitor_desc')}</p>
                            <Link href="/dashboard" className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold text-kera-vibrant bg-kera-vibrant/5 rounded-full w-full">
                                {t('family.feature.view')}
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="border border-gray-100 bg-white/80 backdrop-blur rounded-2xl p-3">
                        <div className="flex flex-col items-center">
                            <div className="mx-auto rounded-lg bg-blue-100 p-2.5 text-blue-600">
                                <Bell className="h-5 w-5" />
                            </div>
                            <h3 className="mt-2 text-xs font-bold text-gray-900">{t('family.feature.reminders')}</h3>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 text-center">{t('family.feature.reminders_desc')}</p>
                            <Link href="/dashboard/appointments" className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 rounded-full w-full">
                                {t('family.feature.schedule')}
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="border border-gray-100 bg-white/80 backdrop-blur rounded-2xl p-3">
                        <div className="flex flex-col items-center">
                            <div className="mx-auto rounded-lg bg-purple-100 p-2.5 text-purple-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <h3 className="mt-2 text-xs font-bold text-gray-900">{t('family.feature.reports')}</h3>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 text-center">{t('family.feature.reports_desc')}</p>
                            <Link href="/dashboard/reports" className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold text-purple-600 bg-purple-50 rounded-full w-full">
                                {t('family.feature.view')}
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="border border-gray-100 bg-white/80 backdrop-blur rounded-2xl p-3">
                        <div className="flex flex-col items-center">
                            <div className="mx-auto rounded-lg bg-teal-100 p-2.5 text-teal-600">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <h3 className="mt-2 text-xs font-bold text-gray-900">{t('family.feature.chat')}</h3>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 text-center">{t('family.feature.chat_desc')}</p>
                            <Link href="/dashboard/chat" className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold text-teal-600 bg-teal-50 rounded-full w-full">
                                {t('family.feature.message')}
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="border border-gray-100 bg-white/80 backdrop-blur rounded-2xl p-3">
                        <div className="flex flex-col items-center">
                            <div className="mx-auto rounded-lg bg-amber-100 p-2.5 text-amber-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <h3 className="mt-2 text-xs font-bold text-gray-900">{t('family.feature.checkups')}</h3>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 text-center">{t('family.feature.checkups_desc')}</p>
                            <Link href="/dashboard/appointments" className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold text-amber-600 bg-amber-50 rounded-full w-full">
                                {t('family.feature.view')}
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="border border-gray-100 bg-white/80 backdrop-blur rounded-2xl p-3">
                        <div className="flex flex-col items-center">
                            <div className="mx-auto rounded-lg bg-gray-100 p-2.5 text-gray-700">
                                <Languages className="h-5 w-5" />
                            </div>
                            <h3 className="mt-2 text-xs font-bold text-gray-900">{t('family.feature.burmese_ui')}</h3>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 text-center">{t('family.feature.burmese_ui_desc')}</p>
                            <Link href="/dashboard/profile" className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-gray-50 rounded-full w-full border border-gray-100">
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
