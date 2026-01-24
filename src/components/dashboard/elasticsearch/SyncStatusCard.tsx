"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SyncStatus, UsersSyncStatus } from "@/services/fetch/elasticsearch.fetch";
import { RefreshCw, CheckCircle2, AlertCircle, Database, Search, Package, Users } from "lucide-react";

interface SyncStatusCardProps {
    syncStatus: SyncStatus | null;
    usersSyncStatus: UsersSyncStatus | null;
    isLoading: boolean;
    onReindex: () => void;
    isReindexing: boolean;
}

export function SyncStatusCard({ syncStatus, usersSyncStatus, isLoading, onReindex, isReindexing }: SyncStatusCardProps) {
    const needsReindex = !syncStatus?.inSync || !usersSyncStatus?.inSync;

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

    if (!syncStatus && !usersSyncStatus) {
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
                {needsReindex && (
                    <Button
                        size="sm"
                        onClick={onReindex}
                        disabled={isReindexing}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isReindexing ? 'animate-spin' : ''}`} />
                        {isReindexing ? 'Reindexing...' : 'Reindex All'}
                    </Button>
                )}
            </div>

            {/* Status Banners */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Products Sync Status */}
                <div className={`p-4 rounded-lg border-2 flex items-center gap-3 ${syncStatus?.inSync
                        ? 'text-green-600 bg-green-50 border-green-200'
                        : 'text-red-600 bg-red-50 border-red-200'
                    }`}>
                    {syncStatus?.inSync ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                    ) : (
                        <AlertCircle className="h-5 w-5 shrink-0" />
                    )}
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5" />
                            <p className="font-semibold text-sm">Products</p>
                        </div>
                        <p className="text-xs truncate">{syncStatus?.message || 'No data'}</p>
                    </div>
                </div>

                {/* Users Sync Status */}
                <div className={`p-4 rounded-lg border-2 flex items-center gap-3 ${usersSyncStatus?.inSync
                        ? 'text-green-600 bg-green-50 border-green-200'
                        : 'text-red-600 bg-red-50 border-red-200'
                    }`}>
                    {usersSyncStatus?.inSync ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                    ) : (
                        <AlertCircle className="h-5 w-5 shrink-0" />
                    )}
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            <p className="font-semibold text-sm">Users</p>
                        </div>
                        <p className="text-xs truncate">{usersSyncStatus?.message || 'No data'}</p>
                    </div>
                </div>
            </div>

            {/* Counts Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Database Counts */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <Database className="h-4 w-4 text-blue-600" />
                        <p className="text-xs text-blue-600 font-semibold">Database</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col">
                            <p className="text-xl font-bold text-blue-600">
                                {syncStatus?.database.count.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-600">products</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xl font-bold text-blue-600">
                                {usersSyncStatus?.database.count.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-600">users</p>
                        </div>
                    </div>
                </div>

                {/* Elasticsearch Counts */}
                <div className={`p-4 rounded-lg ${(syncStatus?.inSync && usersSyncStatus?.inSync) ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <Search className={`h-4 w-4 ${(syncStatus?.inSync && usersSyncStatus?.inSync) ? 'text-green-600' : 'text-red-600'}`} />
                        <p className={`text-xs font-semibold ${(syncStatus?.inSync && usersSyncStatus?.inSync) ? 'text-green-600' : 'text-red-600'}`}>
                            Elasticsearch
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col">
                            <p className={`text-xl font-bold ${syncStatus?.inSync ? 'text-green-600' : 'text-red-600'}`}>
                                {syncStatus?.elasticsearch.count.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-600">
                                {syncStatus?.elasticsearch.exists ? 'products' : 'no index'}
                            </p>
                        </div>
                        <div className="flex flex-col">
                            <p className={`text-xl font-bold ${usersSyncStatus?.inSync ? 'text-green-600' : 'text-red-600'}`}>
                                {usersSyncStatus?.elasticsearch.count.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-600">
                                {usersSyncStatus?.elasticsearch.exists ? 'users' : 'no index'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Difference Warnings */}
            {((!syncStatus?.inSync && syncStatus?.difference !== 0) || (!usersSyncStatus?.inSync && usersSyncStatus?.difference !== 0)) && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 space-y-1">
                    {syncStatus && !syncStatus.inSync && syncStatus.difference !== 0 && (
                        <p className="text-sm text-yellow-800">
                            <span className="font-semibold">Products:</span>{' '}
                            {Math.abs(syncStatus.difference).toLocaleString()} documents missing
                        </p>
                    )}
                    {usersSyncStatus && !usersSyncStatus.inSync && usersSyncStatus.difference !== 0 && (
                        <p className="text-sm text-yellow-800">
                            <span className="font-semibold">Users:</span>{' '}
                            {Math.abs(usersSyncStatus.difference).toLocaleString()} documents missing
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
}
