"use client";

import { Suspense } from "react";
import { Shield, Activity, Lock, Smartphone, Key, AlertTriangle } from "lucide-react";
import { TwoFactorSettings } from "@/components/TwoFactorSettings";
import { RecoveryCodesManagement } from "@/components/RecoveryCodesManagement";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { SecurityActivityList } from "@/components/SecurityActivityList";
import { TrustedDevicesList } from "@/components/TrustedDevicesList";
import { ActiveSessionsList } from "@/components/ActiveSessionsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSession } from "next-auth/react";

// Loading skeleton component
function ComponentSkeleton() {
    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="animate-pulse space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="space-y-3 mt-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
        </div>
    );
}

// Security Level Badge Component
function SecurityLevelBadge({ level }: { level?: string }) {
    if (!level) return null;

    const getLevelConfig = (securityLevel: string) => {
        switch (securityLevel) {
            case 'ENHANCED':
                return {
                    label: 'Enhanced Security',
                    description: 'Your account has the highest level of protection',
                    color: 'bg-green-100 text-green-800 border-green-300',
                    icon: <Shield className="h-5 w-5 text-green-600" />,
                };
            case 'MODERATE':
                return {
                    label: 'Moderate Security',
                    description: 'Good security level, consider enabling all features',
                    color: 'bg-blue-100 text-blue-800 border-blue-300',
                    icon: <Shield className="h-5 w-5 text-blue-600" />,
                };
            case 'BASIC':
            default:
                return {
                    label: 'Basic Security',
                    description: 'Upgrade your security by enabling 2FA and recovery codes',
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                    icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
                };
        }
    };

    const config = getLevelConfig(level);

    return (
        <Card className={`border-2 ${config.color}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {config.icon}
                        <div>
                            <CardTitle className="text-lg">{config.label}</CardTitle>
                            <CardDescription className="mt-1">{config.description}</CardDescription>
                        </div>
                    </div>
                    <Badge variant="secondary" className={config.color}>
                        {level}
                    </Badge>
                </div>
            </CardHeader>
        </Card>
    );
}

export default function SecuritySettingsPage() {
    const { data: session } = useSession();
    const securityLevel = (session?.user as { securityLevel?: string })?.securityLevel;

    return (
        <div className="w-full max-w-full px-2 sm:px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
                </div>
                <p className="text-gray-600">
                    Manage your account security, authentication methods, and monitor activity
                </p>
            </div>

            <div className="space-y-6">
                {/* Security Level Badge */}
                <SecurityLevelBadge level={securityLevel} />

                {/* Security Settings Navigation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="#authentication" className="flex items-start gap-3 p-4 bg-white rounded-lg border hover:border-blue-300 hover:shadow-sm transition-all">
                        <div className="bg-blue-50 rounded-lg p-2">
                            <Smartphone className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Authentication</h3>
                            <p className="text-sm text-gray-600">2FA and security codes</p>
                        </div>
                    </a>

                    <a href="#password" className="flex items-start gap-3 p-4 bg-white rounded-lg border hover:border-blue-300 hover:shadow-sm transition-all">
                        <div className="bg-blue-50 rounded-lg p-2">
                            <Lock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Password</h3>
                            <p className="text-sm text-gray-600">Change your password</p>
                        </div>
                    </a>

                    <a href="#activity" className="flex items-start gap-3 p-4 bg-white rounded-lg border hover:border-blue-300 hover:shadow-sm transition-all">
                        <div className="bg-blue-50 rounded-lg p-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Activity</h3>
                            <p className="text-sm text-gray-600">Sessions and devices</p>
                        </div>
                    </a>
                </div>

                {/* Authentication Section */}
                <div id="authentication" className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Smartphone className="h-6 w-6 text-blue-600" />
                        <h2 className="text-2xl font-semibold text-gray-900">Authentication Methods</h2>
                    </div>

                    {/* 2FA Settings */}
                    <Suspense fallback={<ComponentSkeleton />}>
                        <TwoFactorSettings />
                    </Suspense>

                    {/* Recovery Codes */}
                    <Suspense fallback={<ComponentSkeleton />}>
                        <RecoveryCodesManagement />
                    </Suspense>
                </div>

                {/* Password Section */}
                <div id="password" className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Lock className="h-6 w-6 text-blue-600" />
                        <h2 className="text-2xl font-semibold text-gray-900">Password Management</h2>
                    </div>

                    <ChangePasswordForm />
                </div>

                {/* Activity & Devices Section */}
                <div id="activity" className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Activity className="h-6 w-6 text-blue-600" />
                        <h2 className="text-2xl font-semibold text-gray-900">Activity & Devices</h2>
                    </div>

                    {/* Active Sessions */}
                    <Suspense fallback={<ComponentSkeleton />}>
                        <ActiveSessionsList />
                    </Suspense>

                    {/* Trusted Devices */}
                    <Suspense fallback={<ComponentSkeleton />}>
                        <TrustedDevicesList />
                    </Suspense>

                    {/* Security Activity */}
                    <Suspense fallback={<ComponentSkeleton />}>
                        <SecurityActivityList />
                    </Suspense>
                </div>

                {/* Security Tips */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Security Best Practices
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-1">
                                    <Key className="h-4 w-4 text-blue-600" />
                                    Strong Authentication
                                </h4>
                                <ul className="space-y-1 text-gray-600 ml-5">
                                    <li>• Enable Two-Factor Authentication</li>
                                    <li>• Store recovery codes securely</li>
                                    <li>• Use a unique, strong password</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-1">
                                    <Activity className="h-4 w-4 text-blue-600" />
                                    Monitor Activity
                                </h4>
                                <ul className="space-y-1 text-gray-600 ml-5">
                                    <li>• Review active sessions regularly</li>
                                    <li>• Remove unused trusted devices</li>
                                    <li>• Check for suspicious login attempts</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
