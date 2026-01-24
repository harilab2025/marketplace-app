"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { toast } from "sonner";
import {
    Shield,
    Clock,
    Loader2,
    MapPin,
} from "lucide-react";
import { adminSecurityService, SecurityIncident } from "@/services/admin.security.service";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import {
    Badge,
} from "../ui/badge";

// Severity badge color
const getSeverityBadge = (severity: SecurityIncident['severity']) => {
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

// Status badge
const getStatusBadge = (status: SecurityIncident['status']) => {
    switch (status) {
        case 'OPEN':
            return <Badge variant="destructive">Open</Badge>;
        case 'IN_PROGRESS':
            return <Badge className="bg-blue-600 text-white">In Progress</Badge>;
        case 'MITIGATED':
            return <Badge className="bg-yellow-600 text-white">Mitigated</Badge>;
        case 'RESOLVED':
            return <Badge className="bg-green-600 text-white">Resolved</Badge>;
        case 'FALSE_POSITIVE':
            return <Badge variant="secondary">False Positive</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

// Format timestamp
const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export function IncidentsList() {
    const [isLoading, setIsLoading] = useState(true);
    const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
    const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
    const [showMitigateDialog, setShowMitigateDialog] = useState(false);
    const [showResolveDialog, setShowResolveDialog] = useState(false);
    const [mitigation, setMitigation] = useState('');
    const [resolution, setResolution] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchIncidents = useCallback(async () => {
        try {
            setIsLoading(true);

            const filters: Record<string, string> = {};
            if (filterStatus !== 'ALL') filters.status = filterStatus;
            if (filterSeverity !== 'ALL') filters.severity = filterSeverity;

            const response = await adminSecurityService.getIncidents(filters);
            setIncidents(response.data.incidents);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch incidents';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, filterSeverity]);

    useEffect(() => {
        fetchIncidents();
    }, [fetchIncidents]);

    const handleMitigate = async () => {
        if (!selectedIncident || !mitigation.trim()) {
            toast.error("Please provide mitigation details");
            return;
        }

        try {
            setIsProcessing(true);
            await adminSecurityService.mitigateIncident(
                selectedIncident.id,
                mitigation
            );

            toast.success("Incident mitigated successfully");
            setShowMitigateDialog(false);
            setMitigation('');
            setSelectedIncident(null);
            await fetchIncidents();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to mitigate incident';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedIncident || !resolution.trim()) {
            toast.error("Please provide resolution details");
            return;
        }

        try {
            setIsProcessing(true);

            await adminSecurityService.resolveIncident(
                selectedIncident.id,
                resolution
            );

            toast.success("Incident resolved successfully");
            setShowResolveDialog(false);
            setResolution('');
            setSelectedIncident(null);
            await fetchIncidents();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to resolve incident';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Security Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
    const openCount = incidents.filter(i => i.status === 'OPEN').length;

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-red-600" />
                            <CardTitle>Security Incidents</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            {criticalCount > 0 && (
                                <Badge variant="destructive" className="bg-red-600">
                                    {criticalCount} Critical
                                </Badge>
                            )}
                            {openCount > 0 && (
                                <Badge variant="destructive">
                                    {openCount} Open
                                </Badge>
                            )}
                        </div>
                    </div>
                    <CardDescription>
                        Monitor and manage security threats and incidents
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Status</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="OPEN">Open</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="MITIGATED">Mitigated</SelectItem>
                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                    <SelectItem value="FALSE_POSITIVE">False Positive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Severity</Label>
                            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All severities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Severities</SelectItem>
                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Incidents List */}
                    {incidents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No incidents found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {incidents.map((incident) => (
                                <div
                                    key={incident.id}
                                    className={`
                                        p-4 rounded-lg border transition-colors
                                        ${incident.severity === 'CRITICAL' || incident.severity === 'HIGH'
                                            ? 'bg-red-50 border-red-200 hover:bg-red-100'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getSeverityBadge(incident.severity)}
                                                {getStatusBadge(incident.status)}
                                                <span className="text-xs text-gray-500">{incident.type}</span>
                                            </div>
                                            <h4 className="font-semibold text-sm mb-1">{incident.title}</h4>
                                            <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(incident.detectedAt)}
                                                </span>
                                                {incident.ipAddress && (
                                                    <span>{incident.ipAddress}</span>
                                                )}
                                                {incident.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {incident.location}
                                                    </span>
                                                )}
                                                {incident.affectedUsers.length > 0 && (
                                                    <span>{incident.affectedUsers.length} user(s) affected</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {(incident.status === 'OPEN' || incident.status === 'IN_PROGRESS') && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedIncident(incident);
                                                            setShowMitigateDialog(true);
                                                        }}
                                                    >
                                                        Mitigate
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedIncident(incident);
                                                            setShowResolveDialog(true);
                                                        }}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        Resolve
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats */}
                    {incidents.length > 0 && (
                        <div className="text-xs text-gray-500 pt-2 border-t">
                            <p>Total incidents: {incidents.length}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Mitigate Dialog */}
            <Dialog open={showMitigateDialog} onOpenChange={setShowMitigateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mitigate Incident</DialogTitle>
                        <DialogDescription>
                            Document the mitigation steps taken for this incident
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Mitigation Details</Label>
                            <textarea
                                rows={4}
                                placeholder="Describe the mitigation steps..."
                                value={mitigation}
                                onChange={(e) => setMitigation(e.target.value)}
                                disabled={isProcessing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowMitigateDialog(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleMitigate}
                            disabled={isProcessing || !mitigation.trim()}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Processing...
                                </>
                            ) : (
                                'Mark as Mitigated'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Resolve Dialog */}
            <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resolve Incident</DialogTitle>
                        <DialogDescription>
                            Document the resolution and close this incident
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Resolution Details</Label>
                            <textarea
                                rows={4}
                                placeholder="Describe how the incident was resolved..."
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                disabled={isProcessing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowResolveDialog(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleResolve}
                            disabled={isProcessing || !resolution.trim()}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Processing...
                                </>
                            ) : (
                                'Mark as Resolved'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
