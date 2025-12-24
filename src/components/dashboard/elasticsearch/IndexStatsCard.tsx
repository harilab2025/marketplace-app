"use client";

import { Card } from "@/components/ui/card";
import { ProductsIndexStats } from "@/services/fetch/elasticsearch.fetch";
import { BarChart3, FileText, HardDrive, TrendingUp, Search } from "lucide-react";

interface IndexStatsCardProps {
    stats: ProductsIndexStats | null;
    isLoading: boolean;
}

export function IndexStatsCard({ stats, isLoading }: IndexStatsCardProps) {
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

    if (!stats || !stats.exists) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Index Statistics</h3>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                    <p className="text-yellow-800 font-semibold">Index does not exist</p>
                    <p className="text-sm text-yellow-700 mt-1">Create index using Reset or Reset & Reindex</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Index Statistics</h3>
                <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    products
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Documents */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <p className="text-xs text-blue-600 font-semibold">Documents</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                        {stats.documents.toLocaleString()}
                    </p>
                    {stats.deleted > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                            {stats.deleted} deleted
                        </p>
                    )}
                </div>

                {/* Size */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                        <HardDrive className="h-4 w-4 text-purple-600" />
                        <p className="text-xs text-purple-600 font-semibold">Size</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                        {stats.sizeInMB} MB
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        {(stats.sizeInBytes / 1024).toFixed(2)} KB
                    </p>
                </div>

                {/* Indexing Operations */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <p className="text-xs text-green-600 font-semibold">Indexing</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                        {stats.indexingTotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">total operations</p>
                </div>

                {/* Search Operations */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Search className="h-4 w-4 text-orange-600" />
                        <p className="text-xs text-orange-600 font-semibold">Searches</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                        {stats.searchTotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">total queries</p>
                </div>
            </div>

            {/* Performance Metrics */}
            {stats.indexingTotal > 0 && stats.searchTotal > 0 && (
                <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">
                        <span className="font-semibold">Search/Index Ratio:</span>{' '}
                        {(stats.searchTotal / stats.indexingTotal).toFixed(2)}x
                        {' '}
                        <span className="text-gray-500">
                            ({stats.searchTotal > stats.indexingTotal ? 'read-heavy' : 'write-heavy'})
                        </span>
                    </p>
                </div>
            )}
        </Card>
    );
}
