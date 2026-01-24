"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/login");
            return;
        }

        // Check if user has SUPERADMIN role
        if (session.user?.role !== "SUPERADMIN") {
            router.push("/dashboard");
            return;
        }

        setIsAuthorized(true);
    }, [session, status, router]);

    // Loading state
    if (status === "loading" || !isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Verifying admin access...</p>
            </div>
        );
    }

    // Unauthorized state
    if (!session || session.user?.role !== "SUPERADMIN") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <ShieldAlert className="h-16 w-16 text-red-600 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-6">You don&apos;t have permission to access this area.</p>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Badge */}
            <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white py-2 px-4 text-center text-sm font-medium">
                🛡️ Admin Panel - SUPERADMIN Access
            </div>
            {children}
        </div>
    );
}
