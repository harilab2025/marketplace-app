"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SyncStatus } from "@/services/fetch/elasticsearch.fetch";
import { RefreshCw, CheckCircle2, AlertCircle, Database, Search } from "lucide-react";

interface SyncStatusCardProps {
    syncStatus: SyncStatus | null;
    isLoading: boolean;
    onReindex: () => void;
    isReindexing: boolean;
}

export function SyncStatusCard({ syncStatus, isLoading, onReindex, isReindexing }: SyncStatusCardProps) {
    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Sync Status</h3>
                </div>
                <div className="animate-pulse space-y-3">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </Card>
        );
    }

    if (!syncStatus) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Sync Status</h3>
                </div>
                <p className="text-gray-500 text-center py-8">No sync data available</p>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Sync Status</h3>
                </div>
                {!syncStatus.inSync && (
                    <Button
                        size="sm"
                        onClick={onReindex}
                        disabled={isReindexing}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isReindexing ? 'animate-spin' : ''}`} />
                        {isReindexing ? 'Reindexing...' : 'Reindex Now'}
                    </Button>
                )}
            </div>

            {/* Status Banner */}
            <div className={`p-4 rounded-lg border-2 mb-6 flex items-center gap-3 ${
                syncStatus.inSync
                    ? 'text-green-600 bg-green-50 border-green-200'
                    : 'text-red-600 bg-red-50 border-red-200'
            }`}>
                {syncStatus.inSync ? (
                    <CheckCircle2 className="h-6 w-6" />
                ) : (
                    <AlertCircle className="h-6 w-6" />
                )}
                <div>
                    <p className="font-semibold uppercase">{syncStatus.status}</p>
                    <p className="text-sm">{syncStatus.message}</p>
                </div>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        <p className="text-xs text-blue-600 font-semibold">Database</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                        {syncStatus.database.count.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">products</p>
                </div>

                <div className={`p-4 rounded-lg ${
                    syncStatus.inSync ? 'bg-green-50' : 'bg-red-50'
                }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Search className={`h-4 w-4 ${
                            syncStatus.inSync ? 'text-green-600' : 'text-red-600'
                        }`} />
                        <p className={`text-xs font-semibold ${
                            syncStatus.inSync ? 'text-green-600' : 'text-red-600'
                        }`}>Elasticsearch</p>
                    </div>
                    <p className={`text-2xl font-bold ${
                        syncStatus.inSync ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {syncStatus.elasticsearch.count.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        {syncStatus.elasticsearch.exists ? 'documents' : 'index not found'}
                    </p>
                </div>
            </div>

            {/* Difference */}
            {!syncStatus.inSync && syncStatus.difference !== 0 && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                        <span className="font-semibold">Missing in Elasticsearch:</span>{' '}
                        {Math.abs(syncStatus.difference).toLocaleString()} documents
                    </p>
                </div>
            )}
        </Card>
    );
}
