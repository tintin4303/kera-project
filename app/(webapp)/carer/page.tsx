import React from 'react';
import { Users, FileText, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const stats = [
    { name: 'Total Patients', stat: '12', icon: Users, color: 'bg-blue-500' },
    { name: 'Reports Due', stat: '3', icon: FileText, color: 'bg-orange-500' },
    { name: 'Today\'s Visits', stat: '4', icon: Calendar, color: 'bg-teal-500' },
];

const todaysVisits = [
    {
        id: 1,
        patientName: 'Daw Mya',
        condition: 'Hypertension',
        time: '09:00 AM',
        location: 'Yangon, Kamaryut',
        status: 'Completed',
        statusColor: 'bg-green-100 text-green-800'
    },
    {
        id: 2,
        patientName: 'U Hla',
        condition: 'Diabetes Type 2',
        time: '11:30 AM',
        location: 'Yangon, Bahan',
        status: 'In Progress',
        statusColor: 'bg-blue-100 text-blue-800'
    },
    {
        id: 3,
        patientName: 'Daw Khin',
        condition: 'Post-Stroke Recovery',
        time: '02:00 PM',
        location: 'Yangon, Sanchaung',
        status: 'Pending',
        statusColor: 'bg-gray-100 text-gray-800'
    }
];

export default function CarerDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Carer Dashboard</h1>
                <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {stats.map((item) => (
                    <div key={item.name} className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden border border-gray-100">
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.color}`}>
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
                        </dt>
                        <dd className="ml-16 pb-1 flex items-baseline sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                        </dd>
                    </div>
                ))}
            </div>

            {/* Today's Schedule */}
            <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Today&apos;s Schedule</h2>

                <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
                    <ul role="list" className="divide-y divide-gray-200">
                        {todaysVisits.map((visit) => (
                            <li key={visit.id}>
                                <Link href={`/carer/patients/${visit.id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-teal-600 truncate">{visit.patientName}</p>
                                            <div className="ml-2 shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${visit.statusColor}`}>
                                                    {visit.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    <Users className="shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {visit.condition}
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    <MapPin className="shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {visit.location}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <Clock className="shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                <p>{visit.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-teal-50 rounded-lg p-6 border border-teal-100">
                <h3 className="text-lg font-medium text-teal-900 mb-4">Quick Actions</h3>
                <div className="flex gap-4">
                    <Link href="/carer/reports/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700">
                        <FileText className="mr-2 h-4 w-4" />
                        Create New Report
                    </Link>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
                        Report Incident
                    </button>
                </div>
            </div>
        </div>
    );
}
