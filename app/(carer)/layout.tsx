"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CarerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/signin');
            return;
        }

        if (status === 'authenticated' && session?.user?.role !== 'CARER') {
            router.replace(session?.user?.role === 'ADMIN' ? '/admin' : '/dashboard');
        }
    }, [status, session?.user?.role, router]);

    if (status === 'loading') {
        return null;
    }

    return <>{children}</>;
}
