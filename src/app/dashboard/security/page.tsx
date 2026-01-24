import { Suspense } from "react";
import { Shield } from "lucide-react";
import { SecurityActivityList } from "@/components/SecurityActivityList";
import { TrustedDevicesList } from "@/components/TrustedDevicesList";
import { ActiveSessionsList } from "@/components/ActiveSessionsList";

// Loading skeleton for components
function ComponentSkeleton() {
    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-3 mt-4">
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                </div>
            </div>
        </div>
    );
}

export default function SecurityDashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
                    </div>
                    <p className="text-gray-600">
                        Monitor your account security, active sessions, and trusted devices
                    </p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Security Activity */}
                        <Suspense fallback={<ComponentSkeleton />}>
                            <SecurityActivityList />
                        </Suspense>

                        {/* Active Sessions */}
                        <Suspense fallback={<ComponentSkeleton />}>
                            <ActiveSessionsList />
                        </Suspense>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Trusted Devices */}
                        <Suspense fallback={<ComponentSkeleton />}>
                            <TrustedDevicesList />
                        </Suspense>

                        {/* Security Tips Card */}
                        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                Security Tips
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Enable Two-Factor Authentication for enhanced security</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Review your trusted devices regularly and remove unused ones</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Check for suspicious login attempts from unknown locations</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Revoke sessions on devices you no longer use</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Keep your recovery codes in a safe place</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
