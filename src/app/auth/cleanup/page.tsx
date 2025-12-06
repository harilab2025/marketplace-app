"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function CleanupPage() {
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/';

    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.clear();
                window.sessionStorage.clear();
            }
        } catch { }
        signOut({ callbackUrl: next, redirect: true }).catch(() => {
            window.location.href = next;
        });
    }, [next]);

    return (
        <div className="p-6 text-sm text-gray-600">Membersihkan sesi...</div>
    );
}



