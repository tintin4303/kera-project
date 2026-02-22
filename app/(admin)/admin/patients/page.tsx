"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { ArrowLeft, RefreshCcw } from "lucide-react";

interface Carer {
    id: string;
    verified: boolean;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    };
    _count: {
        patients: number;
    };
}

interface Patient {
    id: string;
    name: string;
    city: string | null;
    country: string | null;
    carerId: string | null;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
    carer: {
        id: string;
        user: {
            name: string | null;
        };
    } | null;
}

export default function AdminPatientsPage() {
    const [carers, setCarers] = useState<Carer[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<Record<string, string>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const [carersRes, patientsRes] = await Promise.all([
                fetch("/api/admin/carers", { cache: "no-store" }),
                fetch("/api/admin/patients", { cache: "no-store" })
            ]);

            if (carersRes.ok) setCarers(await carersRes.json());
            if (patientsRes.ok) {
                const data = await patientsRes.json();
                setPatients(data);
                const initialAssignments: Record<string, string> = {};
                data.forEach((patient: Patient) => {
                    initialAssignments[patient.id] = patient.carerId || "";
                });
                setAssignments(initialAssignments);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssign = async (patientId: string) => {
        const carerId = assignments[patientId];
        
        const patient = patients.find(p => p.id === patientId);
        const currentCarerId = patient?.carerId || "";
        const finalCarerId = carerId !== undefined ? carerId : currentCarerId;

        console.log(`Assigning patient ${patientId} to carer ${finalCarerId}`);
        setActionLoading(patientId);

        try {
            const res = await fetch("/api/admin/match", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patientId, carerId: finalCarerId })
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to assign carer");
            }

            // Clear the local assignment state for this patient so it falls back to the fetched data
            setAssignments(prev => {
                const next = { ...prev };
                delete next[patientId];
                return next;
            });

            await fetchData();
        } catch (error) {
            console.error("Assignment error:", error);
            alert("Failed to save assignment. Please try again.");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-outfit">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Patient Assignments</h1>
                        <p className="mt-2 text-gray-600">
                            Match each patient with a trusted carer in Myanmar.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchData}
                            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                <Card padding="lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Patient</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Family Contact</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Current Carer</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Assign Carer</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {patients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td className="px-4 py-3 text-gray-900">{patient.name}</td>
                                        <td className="px-4 py-3 text-gray-500">{patient.user.email || patient.user.name || "Unknown"}</td>
                                        <td className="px-4 py-3 text-gray-700">{patient.carer?.user?.name || "Unassigned"}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={assignments[patient.id] ?? ""}
                                                onChange={(event) =>
                                                    setAssignments((prev) => ({
                                                        ...prev,
                                                        [patient.id]: event.target.value
                                                    }))
                                                }
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
                                            >
                                                <option value="">Unassigned</option>
                                                {carers.map((carer) => (
                                                    <option key={carer.id} value={carer.id}>
                                                        {carer.user.name || "Unnamed"} ({carer._count.patients} patients)
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleAssign(patient.id)}
                                                disabled={actionLoading === patient.id}
                                                className="inline-flex items-center justify-center rounded-full bg-kera-vibrant px-4 py-2 text-xs font-semibold text-white hover:bg-[#00a855] disabled:opacity-60"
                                            >
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {patients.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                                            {loading ? "Loading patients..." : "No patients found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
