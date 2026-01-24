import { Suspense } from "react";
import Image from "next/image";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { KeyRound, Lock, Mail, Shield } from "lucide-react";
import { SkeletonGenerator } from "@/components/skeletons/SkeletonGenerator";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl flex overflow-hidden border border-slate-100">
                {/* Left Info */}
                <div className="lg:w-1/2 p-8 bg-linear-to-br from-indigo-600 to-purple-700 text-white">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold mb-2 flex items-center">
                            <KeyRound className="mr-3 h-8 w-8" />
                            Password Recovery
                        </h2>
                        <p className="text-indigo-100 leading-relaxed">
                            Reset your password securely with our encrypted recovery process.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20 rounded-full p-2 shrink-0">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Email Verification</h3>
                                <p className="text-sm text-indigo-100">Receive a secure OTP code via email</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20 rounded-full p-2 shrink-0">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">2FA Protection</h3>
                                <p className="text-sm text-indigo-100">Additional verification if 2FA is enabled</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20 rounded-full p-2 shrink-0">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Secure Process</h3>
                                <p className="text-sm text-indigo-100">All data encrypted end-to-end</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-white/10 rounded-lg">
                        <p className="text-sm font-medium mb-2">Password Requirements</p>
                        <ul className="text-xs text-indigo-100 space-y-1">
                            <li>• Minimum 10 characters</li>
                            <li>• Mix of uppercase and lowercase</li>
                            <li>• Include numbers and special characters</li>
                        </ul>
                    </div>
                </div>

                {/* Right Form */}
                <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 md:p-16">
                    <div className="flex flex-col items-center mb-6">
                        <Image src="/next.svg" alt="Phoenix Logo" width={60} height={60} className="mb-2 w-auto h-auto" priority blurDataURL={'/next.svg'} placeholder="blur" />
                        <h1 className="text-2xl font-bold">Reset Password</h1>
                        <p className="text-slate-500 text-sm">Recover your account access</p>
                    </div>
                    <Suspense fallback={<SkeletonGenerator template="form" />}>
                        <ForgotPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
