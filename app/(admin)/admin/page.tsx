"use client";

// Admin dashboard overview
import React, { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RefreshCcw } from "lucide-react";

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

export default function AdminPage() {
    const [overview, setOverview] = useState<Overview | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const overviewRes = await fetch("/api/admin/overview", { cache: "no-store" });
            if (overviewRes.ok) setOverview(await overviewRes.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
                        <Button 
                            variant="secondary"
                            onClick={fetchData}
                            disabled={loading}
                        >
                            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button 
                            onClick={handleSignOut}
                            className="bg-kera-vibrant text-white hover:bg-[#00a855]"
                        >
                            Sign out
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                    <Link href="/admin/requests" className="block group">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Service Requests</h3>
                            <p className="text-2xl font-bold text-gray-900 mb-2">{overview?.totalRequests ?? "-"}</p>
                            <p className="text-xs text-gray-500">{overview?.pendingRequests ?? "-"} pending</p>
                        </div>
                    </Link>

                    <Link href="/admin/patients" className="block group">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Patients</h3>
                            <p className="text-2xl font-bold text-gray-900 mb-2">{overview?.totalPatients ?? "-"}</p>
                            <p className="text-xs text-gray-500">{overview?.unassignedPatients ?? "-"} unassigned</p>
                        </div>
                    </Link>

                    <Link href="/admin/carers" className="block group">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Carers</h3>
                            <p className="text-2xl font-bold text-gray-900 mb-2">{overview?.totalCarers ?? "-"}</p>
                            <p className="text-xs text-gray-500">{overview?.unverifiedCarers ?? "-"} pending</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
