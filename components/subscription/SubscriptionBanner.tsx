'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function SubscriptionBanner() {
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const res = await fetch('/api/patients');
                if (res.ok) {
                    const patients = await res.json();

                    // If no patients, we don't need the "missing subscription" banner yet
                    // as subscription is bundled with adding a patient now.
                    if (patients.length === 0) {
                        setIsActive(true); // Hide banner
                        return;
                    }

                    // Check if all patients have an active subscription
                    const allActive = patients.every((p: any) => p.subscription?.status === 'ACTIVE');
                    setIsActive(allActive);
                }
            } catch (error) {
                console.error('Failed to check subscription:', error);
            } finally {
                setLoading(false);
            }
        };

        checkSubscription();
    }, []);

    if (loading || isActive) {
        return null;
    }

    return (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
            <div className="flex">
                <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Subscription required</h3>
                    <div className="mt-2 text-sm text-amber-700">
                        <p>
                            You are currently not subscribed to any plan. To access all features including health monitoring, chat, and reports, please subscribe to the Core Plan.
                        </p>
                    </div>
                    <div className="mt-4">
                        <div className="-mx-2 -my-1.5 flex">
                            <Link
                                href="/pricing"
                                className="rounded-md bg-amber-100 px-2 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 focus:ring-offset-amber-50"
                            >
                                View Plans
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
