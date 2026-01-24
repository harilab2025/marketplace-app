"use client";

import { Card } from "@/components/ui/card";
import { ProductsIndexStats, UsersIndexStats } from "@/services/fetch/elasticsearch.fetch";
import { BarChart3, FileText, HardDrive, TrendingUp, Search, Package, Users } from "lucide-react";

interface IndexStatsCardProps {
    stats: ProductsIndexStats | null;
    usersStats?: UsersIndexStats | null;
    isLoading: boolean;
}

function SingleIndexStats({
    stats,
    label,
    icon: Icon,
    colorClass
}: {
    stats: ProductsIndexStats | UsersIndexStats;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${colorClass}`} />
                <span className={`text-sm font-semibold ${colorClass}`}>{label}</span>
                {!stats.exists && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded ml-auto">
                        No Index
                    </span>
                )}
            </div>

            {stats.exists ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Documents */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-1.5 mb-1">
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                            <p className="text-xs text-blue-600 font-semibold">Docs</p>
                        </div>
                        <p className="text-xl font-bold text-blue-600">
                            {stats.documents.toLocaleString()}
                        </p>
                        {stats.deleted > 0 && (
                            <p className="text-xs text-red-500">{stats.deleted} deleted</p>
                        )}
                    </div>

                    {/* Size */}
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-1.5 mb-1">
                            <HardDrive className="h-3.5 w-3.5 text-purple-600" />
                            <p className="text-xs text-purple-600 font-semibold">Size</p>
                        </div>
                        <p className="text-xl font-bold text-purple-600">
                            {stats.sizeInMB} MB
                        </p>
                    </div>

                    {/* Indexing */}
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                            <p className="text-xs text-green-600 font-semibold">Indexing</p>
                        </div>
                        <p className="text-xl font-bold text-green-600">
                            {stats.indexingTotal.toLocaleString()}
                        </p>
                    </div>

                    {/* Searches */}
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Search className="h-3.5 w-3.5 text-orange-600" />
                            <p className="text-xs text-orange-600 font-semibold">Searches</p>
                        </div>
                        <p className="text-xl font-bold text-orange-600">
                            {stats.searchTotal.toLocaleString()}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">Index does not exist. Use Reset & Reindex to create.</p>
                </div>
            )}
        </div>
    );
}

export function IndexStatsCard({ stats, usersStats, isLoading }: IndexStatsCardProps) {
    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Index Statistics</h3>
                </div>
                <div className="animate-pulse space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </Card>
        );
    }

    const hasNoData = (!stats || !stats.exists) && (!usersStats || !usersStats.exists);

    if (hasNoData && !stats && !usersStats) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Index Statistics</h3>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                    <p className="text-yellow-800 font-semibold">No index data available</p>
                    <p className="text-sm text-yellow-700 mt-1">Create indices using Reset & Reindex</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Index Statistics</h3>
            </div>

            <div className="space-y-6">
                {/* Products Index Stats */}
                {stats && (
                    <SingleIndexStats
                        stats={stats}
                        label="Products Index"
                        icon={Package}
                        colorClass="text-blue-600"
                    />
                )}

                {/* Divider */}
                {stats && usersStats && (
                    <hr className="border-gray-200" />
                )}

                {/* Users Index Stats */}
                {usersStats && (
                    <SingleIndexStats
                        stats={usersStats}
                        label="Users Index"
                        icon={Users}
                        colorClass="text-indigo-600"
                    />
                )}
            </div>

            {/* Combined Performance Metrics */}
            {((stats?.exists && stats.indexingTotal > 0 && stats.searchTotal > 0) ||
              (usersStats?.exists && usersStats.indexingTotal > 0 && usersStats.searchTotal > 0)) && (
                <div className="mt-6 bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold mb-2">Performance Ratios:</p>
                    <div className="flex gap-4 flex-wrap">
                        {stats?.exists && stats.indexingTotal > 0 && stats.searchTotal > 0 && (
                            <span className="text-xs text-gray-600">
                                <span className="font-medium">Products:</span>{' '}
                                {(stats.searchTotal / stats.indexingTotal).toFixed(2)}x
                                <span className="text-gray-400 ml-1">
                                    ({stats.searchTotal > stats.indexingTotal ? 'read' : 'write'}-heavy)
                                </span>
                            </span>
                        )}
                        {usersStats?.exists && usersStats.indexingTotal > 0 && usersStats.searchTotal > 0 && (
                            <span className="text-xs text-gray-600">
                                <span className="font-medium">Users:</span>{' '}
                                {(usersStats.searchTotal / usersStats.indexingTotal).toFixed(2)}x
                                <span className="text-gray-400 ml-1">
                                    ({usersStats.searchTotal > usersStats.indexingTotal ? 'read' : 'write'}-heavy)
                                </span>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}
