"use client";

// Admin dashboard overview
import React, { useEffect, useState } from "react";
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

export default function AdminPage() {
    console.log("AdminPage rendering");
    // Force refresh to clear HMR cache
    const [overview, setOverview] = useState<Overview | null>(null);

    const fetchOverview = async () => {
        try {
            const overviewRes = await fetch("/api/admin/overview", { cache: "no-store" });
            if (overviewRes.ok) return await overviewRes.json();
        } catch (error) {
            console.error("Failed to fetch overview", error);
        }
        return null;
    };

    useEffect(() => {
        let mounted = true;
        fetchOverview().then((data) => {
            if (mounted && data) setOverview(data);
        });
        return () => {
            mounted = false;
        };
    }, []);

    const handleRefresh = async () => {
        const data = await fetchOverview();
        if (data) setOverview(data);
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
                            onClick={handleRefresh}
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

                <div className="max-w-2xl mx-auto mt-8 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <Link href="/admin/requests" className="block group">
                            <div className="w-36 h-36 mx-auto rounded-full bg-white shadow-sm border-2 border-orange-100 hover:border-orange-300 transition-all flex flex-col items-center justify-center p-2 text-center hover:shadow-md group-hover:scale-105">
                                <div className="rounded-full bg-orange-100 p-2.5 mb-2 text-orange-600">
                                    <ClipboardList className="h-6 w-6" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{overview?.totalRequests ?? "-"}</p>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Requests</p>
                                <p className="text-xs text-orange-600 font-medium">{overview?.pendingRequests ?? "-"} pending</p>
                            </div>
                        </Link>

                        <Link href="/admin/patients" className="block group">
                            <div className="w-36 h-36 mx-auto rounded-full bg-white shadow-sm border border-gray-200 flex flex-col items-center justify-center p-2 text-center hover:shadow-md hover:border-kera-vibrant transition-all group-hover:scale-105">
                                <div className="rounded-full bg-kera-vibrant/10 p-2.5 mb-2 text-kera-vibrant">
                                    <Users className="h-6 w-6" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{overview?.totalPatients ?? "-"}</p>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Patients</p>
                                <p className="text-xs text-gray-500">{overview?.unassignedPatients ?? "-"} unassigned</p>
                            </div>
                        </Link>

                        <Link href="/admin/carers" className="block group">
                            <div className="w-36 h-36 mx-auto rounded-full bg-white shadow-sm border border-gray-200 flex flex-col items-center justify-center p-2 text-center hover:shadow-md hover:border-blue-500 transition-all group-hover:scale-105">
                                <div className="rounded-full bg-blue-100 p-2.5 mb-2 text-blue-600">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{overview?.totalCarers ?? "-"}</p>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Carers</p>
                                <p className="text-xs text-gray-500">{overview?.unverifiedCarers ?? "-"} pending</p>
                            </div>
                        </Link>
                    </div>
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
