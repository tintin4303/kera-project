import React from 'react';
import { Search, Filter, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

const patients = [
    {
        id: 1,
        name: 'Daw Mya',
        age: 68,
        condition: 'Hypertension',
        address: 'No. 12, Baho Road, Kamaryut, Yangon',
        phone: '+95 9 1234 5678',
        lastVisit: 'Today',
        status: 'Stable',
        avatarColor: 'bg-green-100 text-green-700',
    },
    {
        id: 2,
        name: 'U Hla',
        age: 72,
        condition: 'Diabetes Type 2',
        address: 'No. 45, Dhammazedi Road, Bahan, Yangon',
        phone: '+95 9 8765 4321',
        lastVisit: '3 days ago',
        status: 'Attention Needed',
        avatarColor: 'bg-orange-100 text-orange-700',
    },
    {
        id: 3,
        name: 'Daw Khin',
        age: 65,
        condition: 'Post-Stroke Recovery',
        address: 'No. 88, Pyay Road, Sanchaung, Yangon',
        phone: '+95 9 1122 3344',
        lastVisit: 'Yesterday',
        status: 'Improving',
        avatarColor: 'bg-blue-100 text-blue-700',
    },
    {
        id: 4,
        name: 'U Kyaw',
        age: 70,
        condition: 'COPD',
        address: 'No. 5, Inya Road, Yangon',
        phone: '+95 9 5566 7788',
        lastVisit: '1 week ago',
        status: 'Stable',
        avatarColor: 'bg-gray-100 text-gray-700',
    },
];

export default function PatientListPage() {
    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
                <div className="mt-3 sm:mt-0 flex space-x-3">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Filter className="mr-2 h-4 w-4 text-gray-500" />
                        Filter
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700">
                        Add New Patient
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder="Search patients by name or ID"
                />
            </div>

            {/* Patient List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
                <ul role="list" className="divide-y divide-gray-200">
                    {patients.map((patient) => (
                        <li key={patient.id}>
                            <Link href={`/carer/patients/${patient.id}`} className="block hover:bg-gray-50 transition-colors">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold ${patient.avatarColor}`}>
                                                {patient.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-teal-600 truncate">{patient.name} <span className="text-gray-500 font-normal">({patient.age} yrs)</span></p>
                                                <p className="text-sm text-gray-500">{patient.condition}</p>
                                            </div>
                                        </div>
                                        <div className="ml-2 shrink-0 flex flex-col items-end">
                                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.status === 'Attention Needed' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {patient.status}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">Last visited: {patient.lastVisit}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500 mr-6">
                                                <Phone className="shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                {patient.phone}
                                            </p>
                                            <p className="flex items-center text-sm text-gray-500">
                                                <MapPin className="shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                {patient.address}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
