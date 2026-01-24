/**
 * Audit Logs - Detailed Page
 * SUPERADMIN ONLY - Complete audit trail with advanced filtering and export
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    FileText,
    Download,
    Loader2,
    CheckCircle2,
    XCircle,
    Filter,
    ArrowLeft,
    RefreshCw,
    Calendar,
} from "lucide-react";
import { adminSecurityService, AuditLog } from "@/services/admin.security.service";
import { userData } from "@/lib/auth.user";
import {
    Card,
    CardContent,
    CardDescription,
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
    Badge,
} from "@/components/ui/badge";
import Link from "next/link";

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

export default function AuditLogsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filterSuccess, setFilterSuccess] = useState<string>('ALL');
    const [filterAction, setFilterAction] = useState<string>('');
    const [filterUser, setFilterUser] = useState<string>('');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [limit, setLimit] = useState<number>(100);
    const [isExporting, setIsExporting] = useState(false);

    const fetchLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            const user = await userData();
            if (!user || !user.accessToken) {
                toast.error("Admin access required");
                return;
            }

            const filters: Record<string, string | number | boolean> = { limit };
            if (filterSuccess === 'SUCCESS') filters.success = true;
            if (filterSuccess === 'FAILED') filters.success = false;
            if (filterAction) filters.action = filterAction;
            if (filterUser) filters.userId = filterUser;
            if (dateFrom) filters.from = new Date(dateFrom).toISOString();
            if (dateTo) filters.to = new Date(dateTo).toISOString();

            const response = await adminSecurityService.getAuditLogs(user.accessToken, filters);
            setLogs(response.data.logs);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit logs';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [filterSuccess, limit, filterAction, filterUser, dateFrom, dateTo]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const user = await userData();
            if (!user || !user.accessToken) {
                toast.error("Admin access required");
                return;
            }

            const exportFilters: Record<string, string> = {};
            if (dateFrom) exportFilters.from = new Date(dateFrom).toISOString();
            if (dateTo) exportFilters.to = new Date(dateTo).toISOString();

            const blob = await adminSecurityService.exportAuditLogs(user.accessToken, exportFilters);

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

    const handleClearFilters = () => {
        setFilterSuccess('ALL');
        setFilterAction('');
        setFilterUser('');
        setDateFrom('');
        setDateTo('');
        setLimit(100);
    };

    const successCount = logs.filter(log => log.success).length;
    const failureCount = logs.filter(log => !log.success).length;
    const successRate = logs.length > 0 ? ((successCount / logs.length) * 100).toFixed(1) : '0';

    // Get unique actions for quick filter
    const uniqueActions = Array.from(new Set(logs.map(log => log.action))).slice(0, 10);

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
                        <FileText className="h-8 w-8 text-blue-600" />
                        Audit Trail
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Complete audit log of all system activities
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchLogs} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting || logs.length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
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
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{logs.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Successful
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">{successCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Failed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">{failureCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Success Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">{successRate}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            <CardTitle>Filter Logs</CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        <div>
                            <Label>User ID</Label>
                            <Input
                                placeholder="Filter by user ID..."
                                value={filterUser}
                                onChange={(e) => setFilterUser(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Date From</Label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Date To</Label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Limit</Label>
                            <Select value={limit.toString()} onValueChange={(v) => setLimit(Number(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="50">50 logs</SelectItem>
                                    <SelectItem value="100">100 logs</SelectItem>
                                    <SelectItem value="250">250 logs</SelectItem>
                                    <SelectItem value="500">500 logs</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={fetchLogs}
                            className="w-full md:w-auto"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Apply Filters
                        </Button>
                    </div>

                    {/* Quick Action Filters */}
                    {uniqueActions.length > 0 && (
                        <div>
                            <Label className="mb-2 block">Quick Action Filters</Label>
                            <div className="flex flex-wrap gap-2">
                                {uniqueActions.map((action) => (
                                    <Badge
                                        key={action}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-blue-100"
                                        onClick={() => setFilterAction(action)}
                                    >
                                        {action}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Logs List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Audit Logs ({logs.length})
                    </CardTitle>
                    <CardDescription>
                        {dateFrom || dateTo ? (
                            <>
                                Showing logs
                                {dateFrom && ` from ${new Date(dateFrom).toLocaleDateString()}`}
                                {dateTo && ` to ${new Date(dateTo).toLocaleDateString()}`}
                            </>
                        ) : (
                            'Showing most recent logs'
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No audit logs found</p>
                            <p className="text-sm mt-1">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[800px] overflow-y-auto">
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
                                                <span className="text-gray-400">•</span>
                                                <span className="font-mono text-xs bg-gray-50 px-1 py-0.5 rounded">
                                                    ID: {log.userId.substring(0, 8)}...
                                                </span>
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
                        <div className="text-xs text-gray-500 pt-4 mt-4 border-t space-y-1">
                            <p>Showing {logs.length} most recent logs</p>
                            <p>Logs are retained for 90 days for compliance purposes</p>
                            <p>Export logs regularly for long-term archival</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Compliance Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <CardTitle>Compliance & Data Retention</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-semibold mb-2">Audit Log Policy</h4>
                            <ul className="space-y-1 text-gray-600">
                                <li>• All user actions are logged automatically</li>
                                <li>• Logs include IP address, location, and user agent</li>
                                <li>• Failed attempts are flagged for security review</li>
                                <li>• Logs cannot be modified or deleted</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Data Retention</h4>
                            <ul className="space-y-1 text-gray-600">
                                <li>• Audit logs retained for 90 days</li>
                                <li>• Export logs for long-term archival</li>
                                <li>• CSV format for easy integration</li>
                                <li>• Meets GDPR and SOC 2 requirements</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Best Practices</h4>
                            <ul className="space-y-1 text-gray-600">
                                <li>• Review failed actions weekly</li>
                                <li>• Export logs monthly for compliance</li>
                                <li>• Monitor unusual activity patterns</li>
                                <li>• Correlate with security incidents</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Compliance Reports</h4>
                            <ul className="space-y-1 text-gray-600">
                                <li>• Generate quarterly compliance reports</li>
                                <li>• Include audit logs in security reviews</li>
                                <li>• Document incident investigations</li>
                                <li>• Maintain chain of custody</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
