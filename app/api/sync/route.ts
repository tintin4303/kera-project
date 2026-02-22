import { NextResponse } from "next/server";

// This endpoint is called by the service worker to sync queued requests
export async function POST(req: Request) {
    try {
        // The actual sync is handled by the service worker on the client side
        // This endpoint just provides a way to verify the sync capability
        const body = await req.json();

        // Return success - the client-side service worker handles the actual sync
        return NextResponse.json({
            success: true,
            message: "Sync endpoint ready. Use client-side service worker for offline queue."
        });
    } catch (error) {
        console.error("[SYNC_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// Check if there are pending offline items
export async function GET(req: Request) {
    return NextResponse.json({
        offlineSupport: true,
        message: "Offline sync is supported via service worker"
    });
}
