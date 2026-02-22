'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

interface SubscribeButtonProps {
    packageId: string;
    price: number;
    currency: string;
    className?: string;
}

export default function SubscribeButton({ packageId, price, currency, className }: SubscribeButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    const handleSubscribe = async () => {
        if (!session) {
            router.push('/signup'); // Or signin
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    packageId,
                    // paymentMethodId: 'pm_card_visa', // Simulated payment method
                }),
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || 'Failed to subscribe');
            }

            // Success
            router.push('/dashboard?subscribed=true');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Subscription failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSubscribe}
            disabled={loading}
            className={className || "mt-8 block w-full py-3 px-6 border border-transparent rounded-xl text-center font-bold text-lg transition-colors bg-kera-vibrant text-white hover:bg-[#00a855] disabled:opacity-50 disabled:cursor-not-allowed"}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    Processing...
                </span>
            ) : (
                `Subscribe for ${(price / 100).toLocaleString()} ${currency}`
            )}
        </button>
    );
}
