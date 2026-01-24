import { Suspense } from "react";
import Image from "next/image";
import RegisterForm from "@/components/RegisterForm";
import { AlertTriangle, Eye, Key, Lock, Shield, Users } from "lucide-react";
import { SkeletonGenerator } from "@/components/skeletons/SkeletonGenerator";

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl flex overflow-hidden border border-slate-100">
                {/* Left Info */}
                <div className="lg:w-1/2 p-8 bg-linear-to-br from-indigo-600 to-purple-700 text-white">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold mb-2 flex items-center">
                            <Shield className="mr-3 h-8 w-8" />
                            Join Our Platform
                        </h2>
                        <p className="text-indigo-100 leading-relaxed">
                            Create your account and enjoy enterprise-grade security features from day one.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20 rounded-full p-2 shrink-0">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Secure by Default</h3>
                                <p className="text-sm text-indigo-100">AES-256 encryption for all sensitive data</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20 rounded-full p-2 shrink-0">
                                <Key className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Email Verification</h3>
                                <p className="text-sm text-indigo-100">Instant OTP verification to secure your account</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20 rounded-full p-2 shrink-0">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Optional 2FA</h3>
                                <p className="text-sm text-indigo-100">Enable two-factor authentication anytime from settings</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20 rounded-full p-2 shrink-0">
                                <Eye className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Privacy First</h3>
                                <p className="text-sm text-indigo-100">Your data is encrypted end-to-end</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20 rounded-full p-2 shrink-0">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Recovery Options</h3>
                                <p className="text-sm text-indigo-100">Multiple ways to recover your account</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-white/10 rounded-lg">
                        <p className="text-sm font-medium mb-2">Security Standards</p>
                        <p className="text-xs text-indigo-100">
                            OWASP compliant, GDPR ready, and enterprise-grade encryption.
                        </p>
                    </div>
                </div>

                {/* Right Form */}
                <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 md:p-16">
                    <div className="flex flex-col items-center mb-6">
                        <Image src="/next.svg" alt="Phoenix Logo" width={60} height={60} className="mb-2 w-auto h-auto" priority blurDataURL={'/next.svg'} placeholder="blur" />
                        <h1 className="text-2xl font-bold">Create Account</h1>
                        <p className="text-slate-500 text-sm">Sign up to get started</p>
                    </div>
                    <Suspense fallback={<SkeletonGenerator template="form" />}>
                        <RegisterForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
