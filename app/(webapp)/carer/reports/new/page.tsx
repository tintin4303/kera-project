"use client";
import React, { useState } from 'react';
import { Save, Camera, Plus } from 'lucide-react';

export default function NewReportPage() {
    const [medications, setMedications] = useState([
        { name: 'Metformin', dosage: '500mg', taken: true },
        { name: 'Amlodipine', dosage: '5mg', taken: true },
        { name: 'Atorvastatin', dosage: '10mg', taken: false },
    ]);

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">New Health Report</h1>
                <p className="text-sm text-gray-500">Visit Date: {new Date().toLocaleDateString()}</p>
            </div>

            <form className="space-y-6">
                {/* Patient Selection (Mock) */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                    <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md border">
                        <option>Daw Mya</option>
                        <option>U Hla</option>
                        <option>Daw Khin</option>
                    </select>
                </div>

                {/* Vitals Section */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Vital Signs</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Blood Pressure (mmHg)</label>
                            <div className="mt-1 flex gap-2">
                                <input type="number" placeholder="Sys" className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                                <span className="self-center text-gray-400">/</span>
                                <input type="number" placeholder="Dia" className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
                            <div className="mt-1">
                                <input type="number" className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="72" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Blood Glucose (mg/dL)</label>
                            <div className="mt-1">
                                <input type="number" className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="100" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">SpO2 (%)</label>
                            <div className="mt-1">
                                <input type="number" className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="98" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medication Adherence */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Medication Check</h3>
                    <ul className="space-y-4">
                        {medications.map((med, idx) => (
                            <li key={idx} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{med.name}</p>
                                    <p className="text-xs text-gray-500">{med.dosage}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="inline-flex items-center">
                                        <input type="radio" name={`med-${idx}`} className="form-radio text-teal-600" defaultChecked={med.taken} />
                                        <span className="ml-2 text-sm text-gray-700">Taken</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input type="radio" name={`med-${idx}`} className="form-radio text-red-600" defaultChecked={!med.taken} />
                                        <span className="ml-2 text-sm text-gray-700">Missed</span>
                                    </label>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button type="button" className="mt-4 inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-500">
                        <Plus className="mr-1 h-4 w-4" />
                        Add Medication
                    </button>
                </div>

                {/* Photos & Notes */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notes & Photos</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Clinical Notes</label>
                        <div className="mt-1">
                            <textarea rows={4} className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="Patient complained of slight dizziness..."></textarea>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
                                        <span>Upload a photo</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="button" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 mr-3">
                        Cancel
                    </button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        <Save className="mr-2 h-4 w-4" />
                        Submit Report
                    </button>
                </div>
            </form>
        </div>
    );
}
