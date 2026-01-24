/**
 * Security Incidents - Detailed Page
 * SUPERADMIN ONLY - Complete incident management with advanced filtering
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Shield,
    Loader2,
    ArrowLeft,
    Download,
    RefreshCw,
    Filter,
} from "lucide-react";
import { adminSecurityService, SecurityIncident } from "@/services/admin.security.service";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Badge,
} from "@/components/ui/badge";
import Link from "next/link";

// Severity badge
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

export default function IncidentsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
    const [filterType, setFilterType] = useState<string>('');
    const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
    const [showMitigateDialog, setShowMitigateDialog] = useState(false);
    const [showResolveDialog, setShowResolveDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
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

    const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
    const highCount = incidents.filter(i => i.severity === 'HIGH').length;
    const openCount = incidents.filter(i => i.status === 'OPEN').length;
    const inProgressCount = incidents.filter(i => i.status === 'IN_PROGRESS').length;

    // Filter by type locally
    const filteredIncidents = filterType
        ? incidents.filter(i => i.type.toLowerCase().includes(filterType.toLowerCase()))
        : incidents;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard/admin/security">
                        <Button variant="ghost" size="sm" className="mb-2">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Security Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Shield className="h-8 w-8 text-red-600" />
                        Security Incidents
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Monitor and manage all security threats and incidents
                    </p>
                </div>
                <Button onClick={fetchIncidents} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Critical
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            High Priority
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-orange-600">{highCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Open
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">{openCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            In Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        <CardTitle>Filter Incidents</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <div>
                            <Label>Type</Label>
                            <Input
                                placeholder="Filter by type..."
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Incidents List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            All Incidents ({filteredIncidents.length})
                        </CardTitle>
                        {filteredIncidents.length > 0 && (
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : filteredIncidents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No incidents found</p>
                            <p className="text-sm mt-1">
                                {filterStatus !== 'ALL' || filterSeverity !== 'ALL' || filterType
                                    ? 'Try adjusting your filters'
                                    : 'Your system is secure'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredIncidents.map((incident) => (
                                <div
                                    key={incident.id}
                                    className={`
                                        p-4 rounded-lg border transition-colors cursor-pointer
                                        ${incident.severity === 'CRITICAL' || incident.severity === 'HIGH'
                                            ? 'bg-red-50 border-red-200 hover:bg-red-100'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                        }
                                    `}
                                    onClick={() => {
                                        setSelectedIncident(incident);
                                        setShowDetailDialog(true);
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getSeverityBadge(incident.severity)}
                                                {getStatusBadge(incident.status)}
                                                <span className="text-xs text-gray-500">{incident.type}</span>
                                            </div>
                                            <h4 className="font-semibold text-sm mb-1">{incident.title}</h4>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{incident.description}</p>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                <span>Detected {formatDate(incident.detectedAt)}</span>
                                                {incident.ipAddress && (
                                                    <span>IP: {incident.ipAddress}</span>
                                                )}
                                                {incident.affectedUsers.length > 0 && (
                                                    <span className="font-medium text-red-600">
                                                        {incident.affectedUsers.length} user(s) affected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            {(incident.status === 'OPEN' || incident.status === 'IN_PROGRESS') && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedIncident(incident);
                                                            setShowMitigateDialog(true);
                                                        }}
                                                    >
                                                        Mitigate
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
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
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Incident Details</DialogTitle>
                    </DialogHeader>
                    {selectedIncident && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                {getSeverityBadge(selectedIncident.severity)}
                                {getStatusBadge(selectedIncident.status)}
                                <span className="text-sm text-gray-500">{selectedIncident.type}</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{selectedIncident.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{selectedIncident.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-gray-700">Detected At</p>
                                    <p className="text-gray-600">{formatDate(selectedIncident.detectedAt)}</p>
                                </div>
                                {selectedIncident.ipAddress && (
                                    <div>
                                        <p className="font-medium text-gray-700">IP Address</p>
                                        <p className="font-mono text-gray-600">{selectedIncident.ipAddress}</p>
                                    </div>
                                )}
                                {selectedIncident.location && (
                                    <div>
                                        <p className="font-medium text-gray-700">Location</p>
                                        <p className="text-gray-600">{selectedIncident.location}</p>
                                    </div>
                                )}
                                {selectedIncident.affectedUsers.length > 0 && (
                                    <div>
                                        <p className="font-medium text-gray-700">Affected Users</p>
                                        <p className="text-gray-600">{selectedIncident.affectedUsers.length} user(s)</p>
                                    </div>
                                )}
                                {selectedIncident.resolvedAt && (
                                    <div>
                                        <p className="font-medium text-gray-700">Resolved At</p>
                                        <p className="text-gray-600">{formatDate(selectedIncident.resolvedAt)}</p>
                                    </div>
                                )}
                                {selectedIncident.mitigation && (
                                    <div className="col-span-2">
                                        <p className="font-medium text-gray-700">Mitigation</p>
                                        <p className="text-gray-600 text-sm mt-1">{selectedIncident.mitigation}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
        </div>
    );
}
