"use client";
import React from 'react';
import { FileText, Download, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Report {
    id: string;
    title: string;
    summary: string;
    createdAt: string;
    periodStart: string;
    periodEnd: string;
    carer: {
        name: string | null;
        image: string | null;
    };
    patient: {
        name: string;
    };
}

export default function ReportsPage() {
    const { data: reports = [], isLoading } = useQuery<Report[]>({
        queryKey: ['reports'],
        queryFn: async () => {
            const res = await fetch('/api/reports');
            if (!res.ok) throw new Error('Failed to fetch reports');
            return res.json();
        }
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Digital Reports</h1>
                <div className="mt-3 sm:mt-0">
                    <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm border">
                        <option>All Reports</option>
                        <option>Weekly Summaries</option>
                        <option>Urgent Care</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
                {reports.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
                        <p className="mt-1 text-sm text-gray-500">You don't have any reports yet.</p>
                    </div>
                ) : (
                    <ul role="list" className="divide-y divide-gray-200">
                        {reports.map((report) => (
                            <li key={report.id}>
                                <div className="block hover:bg-gray-50 transition-colors cursor-pointer">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-900">{report.title}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(report.createdAt)} • {report.carer.name || 'Unknown Carer'} • For {report.patient.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="hidden sm:flex flex-col items-end mr-4">
                                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500 line-clamp-2">
                                                    {report.summary}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
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
