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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Family</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your family members
                    </p>
                </div>
                <div>
                    <Button onClick={() => setIsAddPatientModalOpen(true)} size="md">
                        <UserPlus className="h-4 w-4" />
                        Add Member
                    </Button>
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card hover>
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-kera-vibrant/10 p-2 text-kera-vibrant">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Health monitoring</h3>
                                <p className="text-xs text-gray-500 mt-1">Track vitals and trends for each patient.</p>
                                <Link href="/dashboard" className="text-xs font-semibold text-kera-vibrant mt-2 inline-flex">
                                    View patients
                                </Link>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Smart reminders</h3>
                                <p className="text-xs text-gray-500 mt-1">Stay on top of medications and regular checkups.</p>
                                <Link href="/dashboard/appointments" className="text-xs font-semibold text-kera-vibrant mt-2 inline-flex">
                                    Schedule checkups
                                </Link>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Health reports</h3>
                                <p className="text-xs text-gray-500 mt-1">Receive regular reports from carers.</p>
                                <Link href="/dashboard/reports" className="text-xs font-semibold text-kera-vibrant mt-2 inline-flex">
                                    View reports
                                </Link>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-teal-100 p-2 text-teal-600">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Care chat</h3>
                                <p className="text-xs text-gray-500 mt-1">Chat directly with your patient’s carer.</p>
                                <Link href="/dashboard/chat" className="text-xs font-semibold text-kera-vibrant mt-2 inline-flex">
                                    Open chat
                                </Link>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Regular checkups</h3>
                                <p className="text-xs text-gray-500 mt-1">Track upcoming visits and schedules.</p>
                                <Link href="/dashboard/appointments" className="text-xs font-semibold text-kera-vibrant mt-2 inline-flex">
                                    Manage visits
                                </Link>
                            </div>
                        </div>
                    </Card>
                    <Card hover>
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-gray-100 p-2 text-gray-700">
                                <Languages className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Burmese UI</h3>
                                <p className="text-xs text-gray-500 mt-1">Use the interface in Burmese for families in Myanmar.</p>
                                <Link href="/dashboard/profile" className="text-xs font-semibold text-kera-vibrant mt-2 inline-flex">
                                    Language settings
                                </Link>
                            </div>
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
