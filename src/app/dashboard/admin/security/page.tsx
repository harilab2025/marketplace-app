/**
 * Admin Security Dashboard - Main Page
 * SUPERADMIN ONLY - Complete security overview and management
 * Location: /dashboard/admin/security
 */

import { IncidentsList } from "@/components/admin/IncidentsList";
import { SuspiciousIPsList } from "@/components/admin/SuspiciousIPsList";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Shield,
    FileText,
    ShieldAlert,
    Activity,
    BarChart3,
} from "lucide-react";
import Link from "next/link";

export default function AdminSecurityPage() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        Security Operations Center
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Monitor security incidents, audit logs, and blocked threats
                    </p>
                </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/admin/security/incidents">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-red-200 hover:border-red-300">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium">
                                    Security Incidents
                                </CardTitle>
                                <ShieldAlert className="h-4 w-4 text-red-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-gray-500">
                                View all security incidents and threats
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/admin/security/audit-logs">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 hover:border-blue-300">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium">
                                    Audit Trail
                                </CardTitle>
                                <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-gray-500">
                                Complete audit logs of all activities
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="hover:shadow-md transition-shadow border-orange-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                                Blocked IPs
                            </CardTitle>
                            <ShieldAlert className="h-4 w-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-gray-500">
                            Manage suspicious and blocked IP addresses
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Security Incidents */}
                <div className="xl:col-span-2">
                    <IncidentsList />
                </div>

                {/* Blocked IPs */}
                <SuspiciousIPsList />

                {/* Recent Audit Logs */}
                <AuditLogViewer />
            </div>

            {/* Security Tips for Admins */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-600" />
                        <CardTitle>Security Best Practices</CardTitle>
                    </div>
                    <CardDescription>
                        Guidelines for managing security operations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-1">
                                <ShieldAlert className="h-4 w-4 text-red-600" />
                                Incident Response
                            </h4>
                            <ul className="space-y-1 text-gray-600">
                                <li>• Review critical incidents within 1 hour</li>
                                <li>• Document all mitigation steps</li>
                                <li>• Mark incidents as resolved only after verification</li>
                                <li>• Check for related incidents before closing</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-1">
                                <Shield className="h-4 w-4 text-orange-600" />
                                IP Blocking
                            </h4>
                            <ul className="space-y-1 text-gray-600">
                                <li>• Review blocked IPs weekly for false positives</li>
                                <li>• Only use permanent blocks for confirmed threats</li>
                                <li>• Document reason clearly before blocking</li>
                                <li>• Monitor attack patterns for trends</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-1">
                                <FileText className="h-4 w-4 text-blue-600" />
                                Audit Logs
                            </h4>
                            <ul className="space-y-1 text-gray-600">
                                <li>• Export logs monthly for compliance</li>
                                <li>• Logs are retained for 90 days</li>
                                <li>• Review failed actions regularly</li>
                                <li>• Look for unusual activity patterns</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-1">
                                <BarChart3 className="h-4 w-4 text-green-600" />
                                Compliance
                            </h4>
                            <ul className="space-y-1 text-gray-600">
                                <li>• Generate compliance reports quarterly</li>
                                <li>• Keep incident resolution documentation</li>
                                <li>• Maintain audit trail integrity</li>
                                <li>• Follow data retention policies</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-linear-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/dashboard/admin/security/incidents">
                            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors">
                                View All Incidents
                            </button>
                        </Link>
                        <Link href="/dashboard/admin/security/audit-logs">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors">
                                View Audit Logs
                            </button>
                        </Link>
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium transition-colors">
                            Export Reports
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
