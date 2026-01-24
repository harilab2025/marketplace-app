"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
    Monitor,
    Smartphone,
    Tablet,
    Loader2,
    LogOut,
    CheckCircle2,
    Clock,
    MapPin,
    AlertCircle,
} from "lucide-react";
import { securityService, ActiveSession } from "@/services/security.service";
import { userData } from "@/lib/auth.user";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

// Device icon based on user agent
const getDeviceIconByName = (deviceName: string) => {
    const lowerName = deviceName.toLowerCase();
    if (lowerName.includes('mobile') || lowerName.includes('iphone') || lowerName.includes('android')) {
        return <Smartphone className="h-5 w-5 text-blue-600" />;
    }
    if (lowerName.includes('tablet') || lowerName.includes('ipad')) {
        return <Tablet className="h-5 w-5 text-purple-600" />;
    }
    return <Monitor className="h-5 w-5 text-green-600" />;
};

// Format timestamp
const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Time until expiry
const getExpiryInfo = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 1) return 'Expires soon';
    if (diffHours < 24) return `Expires in ${diffHours}h`;
    return `Expires in ${Math.floor(diffHours / 24)}d`;
};

export function ActiveSessionsList() {
    const [isLoading, setIsLoading] = useState(true);
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [sessionToRevoke, setSessionToRevoke] = useState<ActiveSession | null>(null);
    const [isRevoking, setIsRevoking] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setIsLoading(true);
            const user = await userData();
            if (!user || !user.accessToken) {
                toast.error("Please login to view active sessions");
                return;
            }

            const response = await securityService.getActiveSessions(user.accessToken);
            setSessions(response.data.sessions);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch active sessions';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevokeSession = async () => {
        if (!sessionToRevoke) return;

        try {
            setIsRevoking(true);
            const user = await userData();
            if (!user || !user.accessToken) {
                toast.error("Authentication required");
                return;
            }

            await securityService.revokeSession(sessionToRevoke.id, user.accessToken);
            toast.success("Session revoked successfully");

            // Refresh sessions list
            await fetchSessions();
            setSessionToRevoke(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to revoke session';
            toast.error(errorMessage);
        } finally {
            setIsRevoking(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Active Sessions
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

    const currentSession = sessions.find(s => s.current);
    const otherSessions = sessions.filter(s => !s.current);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-blue-600" />
                        <CardTitle>Active Sessions</CardTitle>
                    </div>
                    <CardDescription>
                        {`Manage sessions where you're currently logged in`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Monitor className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No active sessions</p>
                        </div>
                    ) : (
                        <>
                            {/* Current Session */}
                            {currentSession && (
                                <>
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Current Session</AlertTitle>
                                        <AlertDescription>
                                            {`This is the device you're currently using`}
                                        </AlertDescription>
                                    </Alert>

                                    <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {getDeviceIconByName(currentSession.deviceName)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-sm flex items-center gap-2">
                                                            {currentSession.deviceName}
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Current
                                                            </span>
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-0.5">
                                                            {currentSession.browser} on {currentSession.os}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                            {currentSession.location && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {currentSession.location}
                                                                </span>
                                                            )}
                                                            <span className="text-gray-400">{currentSession.ipAddress}</span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDate(currentSession.lastActivity)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Other Sessions */}
                            {otherSessions.length > 0 && (
                                <>
                                    <div className="pt-2">
                                        <p className="text-sm font-medium text-gray-700 mb-3">
                                            Other Sessions ({otherSessions.length})
                                        </p>
                                        <div className="space-y-3">
                                            {otherSessions.map((session) => (
                                                <div
                                                    key={session.id}
                                                    className="flex items-start gap-3 p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="mt-0.5">
                                                        {getDeviceIconByName(session.deviceName)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {session.deviceName}
                                                                </p>
                                                                <p className="text-xs text-gray-600 mt-0.5">
                                                                    {session.browser} on {session.os}
                                                                </p>
                                                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                                    {session.location && (
                                                                        <span className="flex items-center gap-1">
                                                                            <MapPin className="h-3 w-3" />
                                                                            {session.location}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-gray-400">{session.ipAddress}</span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {formatDate(session.lastActivity)}
                                                                    </span>
                                                                    <span className="text-orange-600 font-medium">
                                                                        {getExpiryInfo(session.expiresAt)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setSessionToRevoke(session)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <LogOut className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* Footer Info */}
                    {sessions.length > 0 && (
                        <div className="text-xs text-gray-500 pt-2 border-t">
                            <p>Total active sessions: {sessions.length}</p>
                            <p className="mt-1">
                                Sessions automatically expire after 24 hours of inactivity
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Revoke Session Confirmation Dialog */}
            <AlertDialog open={!!sessionToRevoke} onOpenChange={() => setSessionToRevoke(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {sessionToRevoke && (
                                <>
                                    <p className="mb-2">
                                        You are about to revoke the session on <strong>{sessionToRevoke.deviceName}</strong>.
                                    </p>
                                    <p>
                                        This will immediately log out this device. The user will need to log in again to access your account.
                                    </p>
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRevokeSession}
                            disabled={isRevoking}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isRevoking ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Revoking...
                                </>
                            ) : (
                                'Revoke Session'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
