"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
    ShieldAlert,
    Loader2,
    MapPin,
    Clock,
    Unlock,
} from "lucide-react";
import { adminSecurityService, SuspiciousIP } from "@/services/admin.security.service";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import {
    Badge,
} from "../ui/badge";

// Severity badge
const getSeverityBadge = (severity: SuspiciousIP['severity']) => {
    switch (severity) {
        case 'CRITICAL':
            return <Badge variant="destructive" className="bg-red-600">Critical</Badge>;
        case 'HIGH':
            return <Badge variant="destructive" className="bg-orange-600">High</Badge>;
        case 'MEDIUM':
            return <Badge className="bg-yellow-600 text-white">Medium</Badge>;
        case 'LOW':
            return <Badge className="bg-blue-600 text-white">Low</Badge>;
        default:
            return <Badge variant="secondary">Unknown</Badge>;
    }
};

// Format timestamp
const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export function SuspiciousIPsList() {
    const [isLoading, setIsLoading] = useState(true);
    const [ips, setIps] = useState<SuspiciousIP[]>([]);
    const [ipToUnblock, setIpToUnblock] = useState<SuspiciousIP | null>(null);
    const [isUnblocking, setIsUnblocking] = useState(false);

    useEffect(() => {
        fetchIPs();
    }, []);

    const fetchIPs = async () => {
        try {
            setIsLoading(true);
            const response = await adminSecurityService.getSuspiciousIPs();
            setIps(response.data.ips);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch suspicious IPs';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnblock = async () => {
        if (!ipToUnblock) return;

        try {
            setIsUnblocking(true);
            await adminSecurityService.unblockIP(ipToUnblock.ipAddress);
            toast.success(`IP ${ipToUnblock.ipAddress} unblocked successfully`);

            await fetchIPs();
            setIpToUnblock(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to unblock IP';
            toast.error(errorMessage);
        } finally {
            setIsUnblocking(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Blocked IP Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const permanentBlocks = ips.filter(ip => ip.permanent).length;
    const criticalIPs = ips.filter(ip => ip.severity === 'CRITICAL').length;

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-orange-600" />
                            <CardTitle>Blocked IP Addresses</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            {criticalIPs > 0 && (
                                <Badge variant="destructive" className="bg-red-600">
                                    {criticalIPs} Critical
                                </Badge>
                            )}
                            {permanentBlocks > 0 && (
                                <Badge className="bg-gray-700 text-white">
                                    {permanentBlocks} Permanent
                                </Badge>
                            )}
                        </div>
                    </div>
                    <CardDescription>
                        Manage blocked IP addresses and identify false positives
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {ips.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <ShieldAlert className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No blocked IPs</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {ips.map((ip) => (
                                <div
                                    key={ip.id}
                                    className={`
                                        p-4 rounded-lg border transition-colors
                                        ${ip.severity === 'CRITICAL' || ip.severity === 'HIGH'
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-gray-50 border-gray-200'
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getSeverityBadge(ip.severity)}
                                                {ip.permanent && (
                                                    <Badge className="bg-gray-700 text-white">Permanent</Badge>
                                                )}
                                            </div>
                                            <p className="font-mono font-semibold text-sm mb-1">
                                                {ip.ipAddress}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-2">{ip.reason}</p>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                {ip.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {ip.location}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Blocked {formatDate(ip.blockedAt)}
                                                </span>
                                                <span>{ip.attackCount} attack(s)</span>
                                                {ip.blockedUntil && !ip.permanent && (
                                                    <span>Until {formatDate(ip.blockedUntil)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setIpToUnblock(ip)}
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                        >
                                            <Unlock className="h-4 w-4 mr-1" />
                                            Unblock
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats */}
                    {ips.length > 0 && (
                        <div className="text-xs text-gray-500 pt-2 border-t">
                            <p>Total blocked IPs: {ips.length}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Unblock Confirmation Dialog */}
            <AlertDialog open={!!ipToUnblock} onOpenChange={() => setIpToUnblock(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unblock IP Address?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {ipToUnblock && (
                                <>
                                    <p className="mb-2">
                                        You are about to unblock IP address <strong className="font-mono">{ipToUnblock.ipAddress}</strong>.
                                    </p>
                                    <p className="mb-2">
                                        <strong>Reason for block:</strong> {ipToUnblock.reason}
                                    </p>
                                    <p className="mb-2">
                                        <strong>Attack count:</strong> {ipToUnblock.attackCount}
                                    </p>
                                    <p className="text-orange-600 font-semibold">
                                        This IP will be able to access the system immediately after unblocking.
                                    </p>
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUnblocking}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUnblock}
                            disabled={isUnblocking}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isUnblocking ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Unblocking...
                                </>
                            ) : (
                                'Unblock IP'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
