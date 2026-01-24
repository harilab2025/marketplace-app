"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Activity,
    AlertTriangle,
    Clock,
    Loader2,
    LogIn,
    LogOut,
    Key,
    Shield,
    ShieldAlert,
    MapPin,
    Monitor,
} from "lucide-react";
import { securityService, SecurityActivity } from "@/services/security.service";
import { userData } from "@/lib/auth.user";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

// Activity type icon mapping
const getActivityIcon = (type: SecurityActivity['type']) => {
    switch (type) {
        case 'LOGIN':
            return <LogIn className="h-4 w-4 text-green-600" />;
        case 'LOGOUT':
            return <LogOut className="h-4 w-4 text-gray-600" />;
        case 'PASSWORD_CHANGE':
            return <Key className="h-4 w-4 text-blue-600" />;
        case '2FA_ENABLED':
            return <Shield className="h-4 w-4 text-green-600" />;
        case '2FA_DISABLED':
            return <Shield className="h-4 w-4 text-orange-600" />;
        case 'RECOVERY_CODE_GENERATED':
            return <Key className="h-4 w-4 text-blue-600" />;
        case 'RECOVERY_CODE_USED':
            return <Key className="h-4 w-4 text-purple-600" />;
        case 'FAILED_LOGIN':
            return <AlertTriangle className="h-4 w-4 text-red-600" />;
        case 'SUSPICIOUS_LOGIN':
            return <ShieldAlert className="h-4 w-4 text-red-600" />;
        default:
            return <Activity className="h-4 w-4 text-gray-600" />;
    }
};

// Format timestamp
const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
};

export function SecurityActivityList() {
    const [isLoading, setIsLoading] = useState(true);
    const [activities, setActivities] = useState<SecurityActivity[]>([]);
    const [suspiciousCount, setSuspiciousCount] = useState(0);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            setIsLoading(true);
            const user = await userData();
            if (!user || !user.accessToken) {
                toast.error("Please login to view security activity");
                return;
            }

            const response = await securityService.getSecurityActivity(user.accessToken, 10);
            setActivities(response.data.activities);
            setSuspiciousCount(response.data.activities.filter(a => a.suspicious).length);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch security activity';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Security Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <CardTitle>Recent Security Activity</CardTitle>
                    </div>
                    {suspiciousCount > 0 && (
                        <span className="flex items-center gap-1 text-sm font-medium text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            {suspiciousCount} suspicious
                        </span>
                    )}
                </div>
                <CardDescription>
                    Last 10 security-related events on your account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Suspicious Activity Warning */}
                {suspiciousCount > 0 && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Suspicious Activity Detected</AlertTitle>
                        <AlertDescription>
                            We detected {suspiciousCount} suspicious activit{suspiciousCount > 1 ? 'ies' : 'y'} on your account.
                            Please review below and secure your account if you don&apos;t recognize them.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Activities List */}
                {activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No security activity yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className={`
                                    flex items-start gap-3 p-4 rounded-lg border transition-colors
                                    ${activity.suspicious
                                        ? 'bg-red-50 border-red-200 hover:bg-red-100'
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }
                                `}
                            >
                                {/* Icon */}
                                <div className="mt-0.5">
                                    {getActivityIcon(activity.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium text-sm">
                                                {activity.description}
                                                {activity.suspicious && (
                                                    <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                                                        <ShieldAlert className="h-3 w-3" />
                                                        Suspicious
                                                    </span>
                                                )}
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Monitor className="h-3 w-3" />
                                                    {activity.device}
                                                </span>
                                                {activity.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {activity.location}
                                                    </span>
                                                )}
                                                <span className="text-gray-400">{activity.ipAddress}</span>
                                            </div>
                                        </div>
                                        <span className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                                            <Clock className="h-3 w-3" />
                                            {formatTimestamp(activity.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Info */}
                {activities.length > 0 && (
                    <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                        <p>Showing {activities.length} most recent activities</p>
                        <p>Activities older than 90 days are automatically deleted</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
