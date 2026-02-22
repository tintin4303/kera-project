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

export default function AdminCarersPage() {
    const [carers, setCarers] = useState<Carer[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const carersRes = await fetch("/api/admin/carers", { cache: "no-store" });
            if (carersRes.ok) setCarers(await carersRes.json());
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

    return (
        <div className="min-h-screen bg-gray-50 font-outfit">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Carer Verification</h1>
                        <p className="mt-2 text-gray-600">
                            Approve carers before they can accept patient assignments.
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
        </div>
    );
}
