"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";
import {
    getClusterHealth,
    getProductsIndexStats,
    checkSyncStatus,
    type ClusterHealth,
    type ProductsIndexStats,
    type SyncStatus,
} from "@/services/fetch/elasticsearch.fetch";
import { ClusterHealthCard } from "@/components/dashboard/elasticsearch/ClusterHealthCard";
import { SyncStatusCard } from "@/components/dashboard/elasticsearch/SyncStatusCard";
import { IndexStatsCard } from "@/components/dashboard/elasticsearch/IndexStatsCard";
import { ManagementActions } from "@/components/dashboard/elasticsearch/ManagementActions";
import { reindexProducts } from "@/services/fetch/elasticsearch.fetch";
import { userData } from "@/lib/auth.user";
import { useSession } from "next-auth/react";

export default function ElasticsearchMonitoringPage() {
    const router = useRouter();

    // State
    const [clusterHealth, setClusterHealth] = useState<ClusterHealth | null>(null);
    const [indexStats, setIndexStats] = useState<ProductsIndexStats | null>(null);
    const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isReindexing, setIsReindexing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const { status } = useSession();
    // Check if user is SUPERADMIN
    const isSuperAdmin = useCallback(async () => {
        const user = await userData();
        return user?.role === 'SUPERADMIN';
    }, []);

    // Redirect if not SUPERADMIN
    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (!isSuperAdmin) {
            toast.error('Access Denied: SUPERADMIN role required');
            router.push('/dashboard');
        }
    }, [status, isSuperAdmin, router]);

    // Fetch all monitoring data
    const fetchMonitoringData = useCallback(async () => {
        if (!isSuperAdmin) return;

        const startTime = Date.now();
        setIsRefreshing(true);

        try {
            const [healthRes, statsRes, syncRes] = await Promise.allSettled([
                getClusterHealth(),
                getProductsIndexStats(),
                checkSyncStatus(),
            ]);

            // Cluster Health
            if (healthRes.status === 'fulfilled') {
                setClusterHealth(healthRes.value.data);
            } else {
                console.error('Failed to fetch cluster health:', healthRes.reason);
                toast.error('Failed to fetch cluster health');
            }

            // Index Stats
            if (statsRes.status === 'fulfilled') {
                setIndexStats(statsRes.value.data);
            } else {
                console.error('Failed to fetch index stats:', statsRes.reason);
                toast.error('Failed to fetch index stats');
            }

            // Sync Status
            if (syncRes.status === 'fulfilled') {
                setSyncStatus(syncRes.value.data);
            } else {
                console.error('Failed to fetch sync status:', syncRes.reason);
                toast.error('Failed to fetch sync status');
            }

            setLastRefresh(new Date());
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ Monitoring data refreshed in ${duration}s`);

        } catch (error) {
            console.error('Failed to fetch monitoring data:', error);
            toast.error('Failed to load monitoring data');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [isSuperAdmin]);

    // Initial load
    useEffect(() => {
        if (status === 'authenticated') {
            fetchMonitoringData();
        }
    }, [fetchMonitoringData, status]);

    // Handle quick reindex from Sync Status card
    const handleQuickReindex = async () => {
        setIsReindexing(true);
        try {
            const result = await reindexProducts(false);
            const data = result.data;
            toast.success(
                `Reindexed ${data.indexed} products in ${data.duration}${data.errors > 0 ? ` (${data.errors} errors)` : ''
                }`
            );
            // Refresh monitoring data
            await fetchMonitoringData();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to reindex';
            toast.error(message);
        } finally {
            setIsReindexing(false);
        }
    };

    // Handle manual refresh
    const handleRefresh = () => {
        fetchMonitoringData();
    };

    // Handle action complete (from management actions)
    const handleActionComplete = () => {
        fetchMonitoringData();
    };

    // Show loading state
    if (status === 'loading' || (isLoading && !clusterHealth && !indexStats && !syncStatus)) {
        return (
            <div className="w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="h-6 w-6 text-blue-600" />
                        Elasticsearch Monitoring
                    </h1>
                    <p className="text-gray-600 mt-1">Loading monitoring data...</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    // Don't render if not SUPERADMIN
    if (!isSuperAdmin) {
        return null;
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="h-6 w-6 text-blue-600" />
                            Elasticsearch Monitoring
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Monitor cluster health, index statistics, and manage synchronization
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {lastRefresh && (
                            <span className="text-xs text-gray-500">
                                Last refresh: {lastRefresh.toLocaleTimeString()}
                            </span>
                        )}
                        <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>
                </div>
                <div className="mt-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center gap-2">
                    <Shield className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                        <span className="font-semibold">SUPERADMIN Only:</span> This page requires SUPERADMIN role
                    </p>
                </div>
            </div>

            {/* Monitoring Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Cluster Health */}
                <ClusterHealthCard
                    health={clusterHealth}
                    isLoading={isLoading && !clusterHealth}
                />

                {/* Sync Status */}
                <SyncStatusCard
                    syncStatus={syncStatus}
                    isLoading={isLoading && !syncStatus}
                    onReindex={handleQuickReindex}
                    isReindexing={isReindexing}
                />

                {/* Index Statistics */}
                <div className="lg:col-span-2">
                    <IndexStatsCard
                        stats={indexStats}
                        isLoading={isLoading && !indexStats}
                    />
                </div>

                {/* Management Actions */}
                <div className="lg:col-span-2">
                    <ManagementActions onActionComplete={handleActionComplete} />
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Quick Guide:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <span className="font-semibold">Green Status:</span> All shards allocated (optimal)</li>
                    <li>• <span className="font-semibold">Yellow Status:</span> Primary shards allocated, some replicas not allocated (warning)</li>
                    <li>• <span className="font-semibold">Red Status:</span> Some primary shards not allocated (critical)</li>
                    <li>• <span className="font-semibold">Out of Sync:</span> {`Database and Elasticsearch document counts don't match`}</li>
                    <li>• <span className="font-semibold">Recommended Action:</span> {`Use "Reset & Reindex" for full refresh`}</li>
                </ul>
            </div>
        </div>
    );
}
