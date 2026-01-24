import { Suspense } from "react";
import Image from "next/image";
import LoginForm from "../components/LoginForm";
import { AlertTriangle, Eye, Key, Lock, Shield, Users } from "lucide-react";
import { SkeletonGenerator } from "@/components/skeletons/SkeletonGenerator";

export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl flex overflow-hidden border border-slate-100">
                {/* Left Info */}
                <div className="lg:w-1/2 p-8 bg-linear-to-br from-indigo-600 to-purple-700 text-white">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold mb-2 flex items-center">
                            <Shield className="mr-3 h-8 w-8" />
                            Authentication Security
                        </h2>
                        <p className="text-indigo-100 leading-relaxed">
                            Protect your application with multi-layered security system following industry best practices.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20  rounded-full p-2 shrink-0">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Multi-Factor Authentication</h3>
                                <p className="text-sm text-indigo-100">Combined password, OTP, and biometric for layered security</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20  rounded-full p-2 shrink-0">
                                <Key className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">JWT Token Security</h3>
                                <p className="text-sm text-indigo-100">Session management with refresh token and secure storage</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20  rounded-full p-2 shrink-0">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Role-Based Access</h3>
                                <p className="text-sm text-indigo-100">Granular access control based on roles and permissions</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20  rounded-full p-2 shrink-0">
                                <Eye className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Activity Monitoring</h3>
                                <p className="text-sm text-indigo-100">Real-time detection for suspicious activities and anomalies</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20  rounded-full p-2 shrink-0">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Brute Force Protection</h3>
                                <p className="text-sm text-indigo-100">Rate limiting and account lockout to prevent attacks</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-white/10 rounded-lg">
                        <p className="text-sm font-medium mb-2">🔒 Security Standards</p>
                        <p className="text-xs text-indigo-100">
                            Following OWASP standards, OAuth 2.0, OpenID Connect, and GDPR compliance for maximum data protection.
                        </p>
                    </div>
                </div>
                {/* Right Form */}
                <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 md:p-16">
                    <div className="flex flex-col items-center mb-6">
                        <Image src="/next.svg" alt="Phoenix Logo" width={60} height={60} className="mb-2 w-auto h-auto" priority blurDataURL={'/next.svg'} placeholder="blur" />
                        <h1 className="text-2xl font-bold">Sign In</h1>
                        <p className="text-slate-500 text-sm">Get access to your account</p>
                    </div>
                    <Suspense fallback={<SkeletonGenerator template="form" />}>
                        <LoginForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
} 