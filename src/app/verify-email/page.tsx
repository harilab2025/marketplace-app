"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EmailVerificationForm from "@/components/EmailVerificationForm";
import { LoaderCircle } from "lucide-react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const [publicId, setPublicId] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        const id = searchParams.get('publicId');
        const userEmail = searchParams.get('email');

        setPublicId(id);
        setEmail(userEmail);
    }, [searchParams]);

    if (!publicId || !email) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-red-600">Invalid Verification Link</h2>
                    <p className="text-gray-600 mb-4">
                        The verification link is invalid or expired.
                    </p>
                    <p className="text-gray-500 text-sm">
                        Please try registering again or contact support.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <EmailVerificationForm publicId={publicId} email={email} />
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen">
                <LoaderCircle className="animate-spin" size={48} />
                <p className="text-gray-600 mt-4">Loading...</p>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
