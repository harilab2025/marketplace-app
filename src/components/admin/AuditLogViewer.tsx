"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { toast } from "sonner";
import {
    FileText,
    Download,
    Loader2,
    CheckCircle2,
    XCircle,
    Filter,
} from "lucide-react";
import { adminSecurityService, AuditLog } from "@/services/admin.security.service";
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

// Format timestamp
const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

export function AuditLogViewer() {
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filterSuccess, setFilterSuccess] = useState<string>('ALL');
    const [filterAction, setFilterAction] = useState<string>('');
    const [isExporting, setIsExporting] = useState(false);

    const fetchLogs = useCallback(async () => {
        try {
            setIsLoading(true);

            const filters: Record<string, string | number | boolean> = { limit: 50 };
            if (filterSuccess === 'SUCCESS') filters.success = true;
            if (filterSuccess === 'FAILED') filters.success = false;
            if (filterAction) filters.action = filterAction;

            const response = await adminSecurityService.getAuditLogs(filters);
            setLogs(response.data.logs);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit logs';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [filterSuccess, filterAction]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleExport = async () => {
        try {
            setIsExporting(true);

            const blob = await adminSecurityService.exportAuditLogs();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Audit logs exported successfully");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to export logs';
            toast.error(errorMessage);
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Audit Trail</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const successCount = logs.filter(log => log.success).length;
    const failureCount = logs.filter(log => !log.success).length;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <CardTitle>Audit Trail</CardTitle>
                    </div>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting || logs.length === 0}
                        size="sm"
                        variant="outline"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </>
                        )}
                    </Button>
                </div>
                <CardDescription>
                    Complete audit trail of all system activities
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label>Status</Label>
                        <Select value={filterSuccess} onValueChange={setFilterSuccess}>
                            <SelectTrigger>
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All</SelectItem>
                                <SelectItem value="SUCCESS">Success Only</SelectItem>
                                <SelectItem value="FAILED">Failed Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Action</Label>
                        <Input
                            placeholder="Filter by action..."
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button
                            onClick={fetchLogs}
                            variant="outline"
                            className="w-full"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Apply Filters
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>{successCount} successful</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>{failureCount} failed</span>
                    </div>
                </div>

                {/* Logs List */}
                {logs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No audit logs found</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="p-3 rounded border bg-white hover:bg-gray-50 transition-colors text-sm"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {log.success ? (
                                                <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                                            ) : (
                                                <XCircle className="h-3 w-3 text-red-600 shrink-0" />
                                            )}
                                            <span className="font-medium">{log.action}</span>
                                            <span className="text-gray-400">on</span>
                                            <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                                {log.resource}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 ml-5">
                                            <span className="font-medium">{log.userName}</span>
                                            <span className="text-gray-400">({log.userEmail})</span>
                                            <span className="text-gray-400">•</span>
                                            <span className="font-mono">{log.ipAddress}</span>
                                            {log.location && (
                                                <>
                                                    <span className="text-gray-400">•</span>
                                                    <span>{log.location}</span>
                                                </>
                                            )}
                                        </div>
                                        {!log.success && log.errorMessage && (
                                            <div className="ml-5 mt-1 text-xs text-red-600">
                                                Error: {log.errorMessage}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {formatDate(log.timestamp)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                {logs.length > 0 && (
                    <div className="text-xs text-gray-500 pt-2 border-t">
                        <p>Showing {logs.length} most recent logs</p>
                        <p className="mt-1">Logs are retained for 90 days</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
