import React from 'react';
import { FileText, Download, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const reports = [
    {
        id: 101,
        title: 'Monthly Health Summary',
        date: 'Oct 01, 2026',
        author: 'Nurse May',
        type: 'Routine Checkup',
        status: 'Viewed',
    },
    {
        id: 102,
        title: 'Urgent Care Report',
        date: 'Sep 15, 2026',
        author: 'Dr. Su',
        type: 'Specialist Visit',
        status: 'Viewed',
    },
    {
        id: 103,
        title: 'Monthly Health Summary',
        date: 'Sep 01, 2026',
        author: 'Nurse May',
        type: 'Routine Checkup',
        status: 'Viewed',
    },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Digital Reports</h1>
                <div className="mt-3 sm:mt-0">
                    <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-kera-vibrant focus:border-kera-vibrant sm:text-sm rounded-md shadow-sm border">
                        <option>All Reports</option>
                        <option>Weekly Summaries</option>
                        <option>Urgent Care</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
                <ul role="list" className="divide-y divide-gray-200">
                    {reports.map((report) => (
                        <li key={report.id}>
                            <a href="#" className="block hover:bg-gray-50 transition-colors">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-900">{report.title}</p>
                                                <p className="text-sm text-gray-500">{report.date} • {report.author}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="hidden sm:flex flex-col items-end mr-4">
                                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    {report.type}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Empty State / Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
                <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">About Digital Reports</h3>
                    <div className="mt-2 text-sm text-blue-700">
                        <p>
                            Digital reports are generated after every carer visit. They include vital signs, medication logs, and clinical notes. You can download them as PDF for your records.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
