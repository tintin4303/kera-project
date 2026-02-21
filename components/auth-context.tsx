"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";

export interface AuthContextProps {
    children: React.ReactNode;
}

export default function AuthContext({ children }: AuthContextProps) {
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!("serviceWorker" in navigator)) return;
        navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }, []);

    return <SessionProvider basePath="/api/auth">{children}</SessionProvider>;
}
