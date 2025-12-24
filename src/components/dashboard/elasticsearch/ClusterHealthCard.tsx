"use client";

import { Card } from "@/components/ui/card";
import { ClusterHealth, ClusterStatus } from "@/services/fetch/elasticsearch.fetch";
import { Activity, Server, Database, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface ClusterHealthCardProps {
    health: ClusterHealth | null;
    isLoading: boolean;
}

export function ClusterHealthCard({ health, isLoading }: ClusterHealthCardProps) {
    const getStatusColor = (status: ClusterStatus) => {
        switch (status) {
            case 'green':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'yellow':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'red':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: ClusterStatus) => {
        switch (status) {
            case 'green':
                return <CheckCircle2 className="h-6 w-6 text-green-600" />;
            case 'yellow':
                return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
            case 'red':
                return <XCircle className="h-6 w-6 text-red-600" />;
            default:
                return <Activity className="h-6 w-6 text-gray-600" />;
        }
    };

    const getStatusLabel = (status: ClusterStatus) => {
        switch (status) {
            case 'green':
                return 'Healthy - All shards allocated';
            case 'yellow':
                return 'Warning - Some replicas not allocated';
            case 'red':
                return 'Critical - Some primary shards not allocated';
            default:
                return 'Unknown';
        }
    };

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Cluster Health</h3>
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

    if (!health) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Cluster Health</h3>
                </div>
                <p className="text-gray-500 text-center py-8">No health data available</p>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <Activity className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Cluster Health</h3>
            </div>

            {/* Status Banner */}
            <div className={`p-4 rounded-lg border-2 mb-6 flex items-center gap-3 ${getStatusColor(health.status)}`}>
                {getStatusIcon(health.status)}
                <div>
                    <p className="font-semibold uppercase">{health.status}</p>
                    <p className="text-sm">{getStatusLabel(health.status)}</p>
                </div>
            </div>

            {/* Cluster Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Server className="h-4 w-4 text-gray-600" />
                        <p className="text-xs text-gray-600">Nodes</p>
                    </div>
                    <p className="text-xl font-bold">{health.numberOfNodes}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Database className="h-4 w-4 text-gray-600" />
                        <p className="text-xs text-gray-600">Data Nodes</p>
                    </div>
                    <p className="text-xl font-bold">{health.numberOfDataNodes}</p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <p className="text-xs text-blue-600">Active Shards</p>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{health.activeShards}</p>
                </div>

                <div className={`p-3 rounded-lg ${health.unassignedShards > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <Database className={`h-4 w-4 ${health.unassignedShards > 0 ? 'text-red-600' : 'text-green-600'}`} />
                        <p className={`text-xs ${health.unassignedShards > 0 ? 'text-red-600' : 'text-green-600'}`}>Unassigned</p>
                    </div>
                    <p className={`text-xl font-bold ${health.unassignedShards > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {health.unassignedShards}
                    </p>
                </div>
            </div>

            {/* Additional Info */}
            <div className="text-xs text-gray-500 space-y-1">
                <p><span className="font-semibold">Cluster:</span> {health.clusterName}</p>
                <p><span className="font-semibold">Version:</span> {health.version}</p>
                <p><span className="font-semibold">Primary Shards:</span> {health.activePrimaryShards}</p>
                {health.relocatingShards > 0 && (
                    <p className="text-yellow-600"><span className="font-semibold">Relocating:</span> {health.relocatingShards}</p>
                )}
                {health.initializingShards > 0 && (
                    <p className="text-blue-600"><span className="font-semibold">Initializing:</span> {health.initializingShards}</p>
                )}
            </div>
        </Card>
    );
}
