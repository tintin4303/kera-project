"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { Check } from 'lucide-react';
import SubscribeButton from '@/components/subscription/SubscribeButton';
import { useSession } from 'next-auth/react';
import { formatPrice } from '@/lib/utils';

interface Package {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
}

export default function PricingPage() {
    const { data: session } = useSession();
    const [packages, setPackages] = useState<Package[]>([]);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await fetch('/api/packages');
                if (res.ok) {
                    const data = await res.json();
                    setPackages(data);
                }
            } catch (error) {
                console.error('Failed to fetch packages:', error);
            }
        };

        fetchPackages();
    }, []);

    // Fallback to hardcoded if API fails or empty
    const defaultCorePlan = {
        id: 'core-plan',
        name: 'Core Plan',
        price: 99000, // stored in cents/satang
        currency: 'THB',
        description: 'Everything needed for ongoing care across borders.',
        features: [
            'Health monitoring and vital tracking',
            'Smart medication and checkup reminders',
            'Regular health reports for families',
            'Chat with the patient’s assigned carer',
            'Burmese language UI',
        ],
    };

    const corePlan = packages.find(p => p.name === 'Core Plan') || defaultCorePlan;

    const addOns = [
        {
            name: 'Transportation for appointments',
            price: 250,
        },
        {
            name: 'Video consults with partnered doctors',
            price: 250,
        },
        {
            name: 'Regular medicine refills',
            price: 250,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-outfit">
            <Navbar />

            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl mb-4">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-xl text-gray-500">
                        One core plan for essential care, plus optional add-ons as needed.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="rounded-2xl bg-white shadow-xl border border-kera-vibrant ring-2 ring-kera-vibrant ring-opacity-50 overflow-hidden transition-all duration-200 hover:shadow-2xl lg:col-span-2">
                        <div className="bg-kera-vibrant text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4">
                            Core Plan
                        </div>
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900">{corePlan.name}</h3>
                            <p className="mt-2 text-gray-500 text-sm">{corePlan.description}</p>
                            <div className="mt-6 flex items-baseline">
                                <span className="text-5xl font-extrabold text-gray-900">
                                    {formatPrice(corePlan.price, corePlan.currency)}
                                </span>
                            </div>

                            {session ? (
                                <SubscribeButton
                                    packageId={corePlan.id}
                                    price={corePlan.price}
                                    currency={corePlan.currency}
                                />
                            ) : (
                                <Link
                                    href="/signup"
                                    className="mt-8 block w-full py-3 px-6 border border-transparent rounded-xl text-center font-bold text-lg transition-colors bg-kera-vibrant text-white hover:bg-[#00a855]"
                                >
                                    Start with Core Plan
                                </Link>
                            )}
                        </div>

                        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
                            <ul className="space-y-4">
                                {corePlan.features.map((feature) => (
                                    <li key={feature} className="flex items-start">
                                        <div className="shrink-0">
                                            <Check className="h-5 w-5 text-kera-vibrant" />
                                        </div>
                                        <p className="ml-3 text-base text-gray-700">{feature}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900">Add-ons</h3>
                            <p className="mt-2 text-gray-500 text-sm">Each add-on adds 250 THB.</p>
                            <ul className="mt-6 space-y-4">
                                {addOns.map((addOn) => (
                                    <li key={addOn.name} className="flex items-start justify-between">
                                        <div className="flex items-start">
                                            <div className="shrink-0">
                                                <Check className="h-5 w-5 text-kera-vibrant" />
                                            </div>
                                            <p className="ml-3 text-base text-gray-700">{addOn.name}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-600">
                                            +{addOn.price} THB
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/signup"
                                className="mt-8 block w-full py-3 px-6 border border-gray-200 rounded-xl text-center font-bold text-lg transition-colors bg-gray-50 text-kera-vibrant hover:bg-gray-100"
                            >
                                Add services later
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
