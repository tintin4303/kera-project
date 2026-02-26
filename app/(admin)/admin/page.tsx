"use client";

// Admin dashboard overview
import React, { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { CheckCircle, RefreshCcw, Users, ClipboardList } from "lucide-react";

interface Overview {
    totalPatients: number;
    totalCarers: number;
    totalMigrants: number;
    totalAdmins: number;
    unassignedPatients: number;
    unverifiedCarers: number;
    pendingRequests: number;
    totalRequests: number;
}

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

export default function AdminPage() {
    console.log("AdminPage rendering");
    const [overview, setOverview] = useState<Overview | null>(null);
    const [carers, setCarers] = useState<Carer[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<Record<string, string>>({});

    const unassignedCount = useMemo(() => patients.filter(p => !p.carerId).length, [patients]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [overviewRes, carersRes, patientsRes] = await Promise.all([
                fetch("/api/admin/overview", { cache: "no-store" }),
                fetch("/api/admin/carers", { cache: "no-store" }),
                fetch("/api/admin/patients", { cache: "no-store" })
            ]);

            if (overviewRes.ok) setOverview(await overviewRes.json());
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

    const handleVerify = async (carerId: string, verified: boolean) => {
        setActionLoading(carerId);
        try {
            await fetch("/api/admin/carers", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ carerId, verified })
            });
            await fetchData();
        } finally {
            setActionLoading(null);
        }
    };

    const handleAssign = async (patientId: string) => {
        const carerId = assignments[patientId];
        // If carerId is undefined, it means the user hasn't changed the selection.
        // In this case, we don't need to do anything, or we could send the current value.
        // But the current implementation sends "" if undefined, which unassigns the patient!
        // Fix: If undefined, use the current patient's carerId.
        
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

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        if (typeof window !== "undefined") {
            if ("caches" in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map((key) => caches.delete(key)));
            }
            if ("serviceWorker" in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map((registration) => registration.unregister()));
            }
            window.location.href = "/signin";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-outfit">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
                        <p className="mt-2 text-gray-600">
                            Verify carers, connect patients to carers, and oversee platform operations.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <button
                            onClick={fetchData}
                            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Refresh
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="inline-flex items-center justify-center rounded-full bg-kera-vibrant text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#00a855] transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>

                <div className="max-w-lg mx-auto mt-8 mb-8">
                    <div className="grid grid-cols-2 gap-6">
                        <Link href="/admin/requests" className="block group">
                            <div className="aspect-square w-full rounded-full bg-white shadow-sm border-2 border-orange-100 hover:border-orange-300 transition-all flex flex-col items-center justify-center p-4 text-center hover:shadow-md group-hover:scale-105">
                                <div className="rounded-full bg-orange-100 p-2.5 mb-2 text-orange-600">
                                    <ClipboardList className="h-6 w-6" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{overview?.totalRequests ?? "-"}</p>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Requests</p>
                                <p className="text-xs text-orange-600 font-medium">{overview?.pendingRequests ?? "-"} pending</p>
                            </div>
                        </Link>

                        <Link href="#patients-table" className="block group">
                            <div className="aspect-square w-full rounded-full bg-white shadow-sm border border-gray-200 flex flex-col items-center justify-center p-4 text-center hover:shadow-md hover:border-kera-vibrant transition-all group-hover:scale-105">
                                <div className="rounded-full bg-kera-vibrant/10 p-2.5 mb-2 text-kera-vibrant">
                                    <Users className="h-6 w-6" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{overview?.totalPatients ?? "-"}</p>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Patients</p>
                                <p className="text-xs text-gray-500">{unassignedCount} unassigned</p>
                            </div>
                        </Link>

                        <div className="aspect-square w-full rounded-full bg-white shadow-sm border border-gray-200 flex flex-col items-center justify-center p-4 text-center">
                            <div className="rounded-full bg-blue-100 p-2.5 mb-2 text-blue-600">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{overview?.totalCarers ?? "-"}</p>
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Carers</p>
                            <p className="text-xs text-gray-500">{overview?.unverifiedCarers ?? "-"} pending</p>
                        </div>

                        <div className="aspect-square w-full rounded-full bg-white shadow-sm border border-gray-200 flex flex-col items-center justify-center p-4 text-center">
                            <div className="rounded-full bg-purple-100 p-2.5 mb-2 text-purple-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{overview?.totalMigrants ?? "-"}</p>
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Families</p>
                            <p className="text-xs text-gray-500">{overview?.totalAdmins ?? "-"} admins</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 mb-8">
                    <Card padding="lg">
                        <div className="mt-4 mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Carer verification</h2>
                            <p className="text-sm text-gray-500">Approve carers before they can accept patient assignments.</p>
                        </div>
                        <div className="mt-4 mb-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Carer</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Patients</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {carers.map((carer) => (
                                    <tr key={carer.id}>
                                        <td className="px-4 py-3 text-gray-900">{carer.user.name || "Unnamed"}</td>
                                        <td className="px-4 py-3 text-gray-500">{carer.user.email || "No email"}</td>
                                        <td className="px-4 py-3 text-gray-700">{carer._count.patients}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${carer.verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                {carer.verified ? "Verified" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleVerify(carer.id, !carer.verified)}
                                                disabled={actionLoading === carer.id}
                                                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                            >
                                                {carer.verified ? "Unverify" : "Verify"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {carers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                                            {loading ? "Loading carers..." : "No carers found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
                </div>

                <div className="mt-8 mb-8" id="patients-table">
                <Card padding="lg">
                    <div className="mt-4 mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Patient assignments</h2>
                        <p className="text-sm text-gray-500">Match each patient with a trusted carer in Myanmar.</p>
                    </div>
                    <div className="mt-4 mb-4 overflow-x-auto">
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

                <div className="mt-8 mb-8">
                <Card padding="lg">
                    <div className="mt-4 mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Add-on services</h2>
                        <p className="text-sm text-gray-500">Track paid upgrades and schedule services.</p>
                    </div>
                    <div className="mt-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
                        <div className="rounded-xl border border-gray-200 p-4">
                            Transportation
                            <p className="mt-2 text-xs text-gray-500">No requests yet</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-4">
                            Video consults
                            <p className="mt-2 text-xs text-gray-500">No requests yet</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-4">
                            Medicine refills
                            <p className="mt-2 text-xs text-gray-500">No requests yet</p>
                        </div>
                    </div>
                </Card>
                </div>
            </div>
        </div>
    );
}
