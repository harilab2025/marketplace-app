"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
    Smartphone,
    Monitor,
    Tablet,
    Loader2,
    Trash2,
    CheckCircle2,
    Clock,
    MapPin,
} from "lucide-react";
import { securityService, TrustedDevice } from "@/services/security.service";
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

// Device type icon mapping
const getDeviceIcon = (type: TrustedDevice['deviceType']) => {
    switch (type) {
        case 'MOBILE':
            return <Smartphone className="h-5 w-5 text-blue-600" />;
        case 'TABLET':
            return <Tablet className="h-5 w-5 text-purple-600" />;
        case 'DESKTOP':
            return <Monitor className="h-5 w-5 text-green-600" />;
        default:
            return <Monitor className="h-5 w-5 text-gray-600" />;
    }
};

// Format timestamp
const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export function TrustedDevicesList() {
    const [isLoading, setIsLoading] = useState(true);
    const [devices, setDevices] = useState<TrustedDevice[]>([]);
    const [deviceToRemove, setDeviceToRemove] = useState<TrustedDevice | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            setIsLoading(true);

            const response = await securityService.getTrustedDevices();
            setDevices(response.data.devices);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch trusted devices';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveDevice = async () => {
        if (!deviceToRemove) return;

        try {
            setIsRemoving(true);

            await securityService.removeTrustedDevice(deviceToRemove.id);
            toast.success(`${deviceToRemove.deviceName} removed from trusted devices`);

            // Refresh devices list
            await fetchDevices();
            setDeviceToRemove(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove device';
            toast.error(errorMessage);
        } finally {
            setIsRemoving(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Trusted Devices
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
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-green-600" />
                        <CardTitle>Trusted Devices</CardTitle>
                    </div>
                    <CardDescription>
                        Devices that have been authorized to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {devices.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Monitor className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No trusted devices yet</p>
                            <p className="text-xs mt-1">Devices will appear here after successful login</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {devices.map((device) => (
                                <div
                                    key={device.id}
                                    className="flex items-start gap-3 p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    {/* Device Icon */}
                                    <div className="mt-0.5">
                                        {getDeviceIcon(device.deviceType)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {device.deviceName}
                                                    {device.trusted && (
                                                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Trusted
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    {device.browser} on {device.os}
                                                </p>
                                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                    {device.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {device.location}
                                                        </span>
                                                    )}
                                                    <span className="text-gray-400">{device.ipAddress}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Last used: {formatDate(device.lastUsed)}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeviceToRemove(device)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer Info */}
                    {devices.length > 0 && (
                        <div className="text-xs text-gray-500 pt-2">
                            <p>Total trusted devices: {devices.length}</p>
                            <p className="mt-1">
                                Removing a device will require re-authentication on next login from that device
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Remove Device Confirmation Dialog */}
            <AlertDialog open={!!deviceToRemove} onOpenChange={() => setDeviceToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Trusted Device?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deviceToRemove && (
                                <>
                                    <p className="mb-2">
                                        You are about to remove <strong>{deviceToRemove.deviceName}</strong> from your trusted devices.
                                    </p>
                                    <p>
                                        This device will need to go through the full authentication process (including 2FA if enabled) on the next login.
                                    </p>
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveDevice}
                            disabled={isRemoving}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isRemoving ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Removing...
                                </>
                            ) : (
                                'Remove Device'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
