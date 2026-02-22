"use client";

import { useState, useEffect, useCallback } from 'react';

interface OfflineItem {
    id: string;
    url: string;
    method: string;
    body: Record<string, unknown>;
    timestamp: number;
}

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    const updatePendingCount = useCallback(async () => {
        try {
            const cache = await caches.open('kera-offline-queue-v1');
            const response = await cache.match('/queue');
            if (response) {
                const queue: OfflineItem[] = await response.json();
                setPendingCount(queue?.length || 0);
            }
        } catch {
            // Cache might not exist yet
        }
    }, []);

    const triggerSync = useCallback(async () => {
        if (typeof window === 'undefined' || !window.navigator.onLine || isSyncing) return;

        setIsSyncing(true);

        try {
            // Try to use Background Sync if available
            if ('serviceWorker' in window.navigator && 'sync' in ServiceWorkerRegistration.prototype) {
                const registration = await window.navigator.serviceWorker.ready;
                await (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register('kera-sync');
            } else {
                // Fallback: manually trigger sync
                await fetch('/api/sync', { method: 'POST' });
                await updatePendingCount();
                setIsSyncing(false);
            }
        } catch {
            setIsSyncing(false);
        }
    }, [isSyncing, updatePendingCount]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Listen for online/offline events
        const handleOnline = () => {
            setIsOnline(true);
            triggerSync();
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Listen for sync messages from service worker
        const handleSyncMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SYNC_COMPLETE') {
                setIsSyncing(false);
                updatePendingCount();
            }
        };

        // Register service worker message handler
        if ('serviceWorker' in window.navigator) {
            window.navigator.serviceWorker.addEventListener('message', handleSyncMessage);
        }

        // Update pending count on mount
        const timer = setTimeout(() => {
            updatePendingCount();
        }, 0);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearTimeout(timer);
        };
    }, [triggerSync, updatePendingCount]);

    const saveOfflineData = useCallback(async (url: string, method: string, body: Record<string, unknown>) => {
        if (typeof window === 'undefined') {
            // Server-side rendering, just make the request
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            return response;
        }

        if (window.navigator.onLine) {
            // If online, try to make the request normally
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            return response;
        }

        // If offline, queue the request
        const cache = await caches.open('kera-offline-queue-v1');
        const existingResponse = await cache.match('/queue');
        const queue: OfflineItem[] = existingResponse ? await existingResponse.json() : [];

        queue.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url,
            method,
            body,
            timestamp: Date.now()
        });

        await cache.put('/queue', new Response(JSON.stringify(queue)));
        setPendingCount(queue.length);

        // Return a response indicating the item was queued
        return new Response(JSON.stringify({
            queued: true,
            message: 'Data saved offline and will sync when back online'
        }), {
            status: 202,
            headers: { 'Content-Type': 'application/json' }
        });
    }, []);

    return {
        isOnline,
        pendingCount,
        isSyncing,
        triggerSync,
        saveOfflineData
    };
}
