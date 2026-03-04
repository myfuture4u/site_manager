"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            {children}
            <Toaster position="top-right" toastOptions={{
                style: {
                    background: '#1a2540',
                    color: '#e2e8f0',
                    border: '1px solid #1e2e4a',
                }
            }} />
        </SessionProvider>
    );
}
