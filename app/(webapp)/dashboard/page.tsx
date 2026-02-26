"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, Bell, FileText, MessageSquare, UserPlus, Languages, Calendar } from 'lucide-react';
import AddPatientModal from '@/components/dashboard/AddPatientModal';
import PatientList from '@/components/dashboard/PatientList';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
export default function DashboardOverview() {
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-end pb-2">
                <Button onClick={() => setIsAddPatientModalOpen(true)} size="md">
                    <UserPlus className="h-4 w-4" />
                    Add Member
                </Button>
            </div>

            {/* Family Members List - Full Width */}
            <div className="space-y-4">
                <PatientList key={refreshKey} />
            </div>

            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Core plan features</h2>
                    <p className="text-sm text-gray-500">
                        Everything included in your 990 THB plan is available in your portal.
                    </p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    <Card hover padding="sm" className="flex flex-col h-full active:scale-[0.98] transition-all">
                        <div className="flex flex-col h-full text-center">
                            <div className="mx-auto rounded-xl bg-kera-vibrant/10 p-3 text-kera-vibrant mb-3 shadow-sm">
                                <Activity className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">Health Monitor</h3>
                            <p className="text-xs text-gray-500 mt-1.5 flex-1 line-clamp-2">Track vitals and trends.</p>
                            <Link href="/dashboard" className="text-xs font-semibold text-kera-vibrant mt-3 py-1.5 bg-kera-vibrant/5 rounded-md w-full">
                                View
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="flex flex-col h-full active:scale-[0.98] transition-all">
                        <div className="flex flex-col h-full text-center">
                            <div className="mx-auto rounded-xl bg-blue-100 p-3 text-blue-600 mb-3 shadow-sm">
                                <Bell className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">Reminders</h3>
                            <p className="text-xs text-gray-500 mt-1.5 flex-1 line-clamp-2">Track daily meds.</p>
                            <Link href="/dashboard/appointments" className="text-xs font-semibold text-blue-600 mt-3 py-1.5 bg-blue-50 rounded-md w-full">
                                Schedule
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="flex flex-col h-full active:scale-[0.98] transition-all">
                        <div className="flex flex-col h-full text-center">
                            <div className="mx-auto rounded-xl bg-purple-100 p-3 text-purple-600 mb-3 shadow-sm">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">Reports</h3>
                            <p className="text-xs text-gray-500 mt-1.5 flex-1 line-clamp-2">Weekly care summaries.</p>
                            <Link href="/dashboard/reports" className="text-xs font-semibold text-purple-600 mt-3 py-1.5 bg-purple-50 rounded-md w-full">
                                View
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="flex flex-col h-full active:scale-[0.98] transition-all">
                        <div className="flex flex-col h-full text-center">
                            <div className="mx-auto rounded-xl bg-teal-100 p-3 text-teal-600 mb-3 shadow-sm">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">Care Chat</h3>
                            <p className="text-xs text-gray-500 mt-1.5 flex-1 line-clamp-2">Chat with your carer.</p>
                            <Link href="/dashboard/chat" className="text-xs font-semibold text-teal-600 mt-3 py-1.5 bg-teal-50 rounded-md w-full">
                                Message
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="flex flex-col h-full active:scale-[0.98] transition-all">
                        <div className="flex flex-col h-full text-center">
                            <div className="mx-auto rounded-xl bg-amber-100 p-3 text-amber-600 mb-3 shadow-sm">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">Checkups</h3>
                            <p className="text-xs text-gray-500 mt-1.5 flex-1 line-clamp-2">Track home visits.</p>
                            <Link href="/dashboard/appointments" className="text-xs font-semibold text-amber-600 mt-3 py-1.5 bg-amber-50 rounded-md w-full">
                                Manage
                            </Link>
                        </div>
                    </Card>
                    <Card hover padding="sm" className="flex flex-col h-full active:scale-[0.98] transition-all">
                        <div className="flex flex-col h-full text-center">
                            <div className="mx-auto rounded-xl bg-gray-100 p-3 text-gray-700 mb-3 shadow-sm">
                                <Languages className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">Burmese UI</h3>
                            <p className="text-xs text-gray-500 mt-1.5 flex-1 line-clamp-2">Native translation.</p>
                            <Link href="/dashboard/profile" className="text-xs font-semibold text-gray-700 mt-3 py-1.5 bg-gray-50 rounded-md w-full border border-gray-100">
                                Settings
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
        </div>
    );
}
