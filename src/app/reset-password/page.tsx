"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { LoaderCircle } from "lucide-react";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [requires2FA, setRequires2FA] = useState<boolean>(false);

    useEffect(() => {
        const token = searchParams.get('resetToken');
        const needs2FA = searchParams.get('requires2FA') === 'true';

        setResetToken(token);
        setRequires2FA(needs2FA);
    }, [searchParams]);

    if (!resetToken) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-red-600">Invalid Reset Link</h2>
                    <p className="text-gray-600 mb-4">
                        The password reset link is invalid or has expired.
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                        Please request a new password reset link.
                    </p>
                    <a
                        href="/forgot"
                        className="inline-block text-white bg-blue-600 rounded-xl hover:bg-blue-700 px-6 py-2 text-sm font-medium"
                    >
                        Request New Link
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <ResetPasswordForm resetToken={resetToken} requires2FA={requires2FA} />
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen">
                <LoaderCircle className="animate-spin" size={48} />
                <p className="text-gray-600 mt-4">Loading...</p>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
