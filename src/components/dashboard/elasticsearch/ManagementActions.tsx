"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, RotateCcw, RefreshCw, Trash2, AlertTriangle, Users, Package } from "lucide-react";
import { toast } from "sonner";
import {
    resetProductsIndex,
    reindexProducts,
    resetAndReindexProducts,
    deleteProductsIndex,
    resetUsersIndex,
    reindexUsers,
    resetAndReindexUsers,
    deleteUsersIndex,
} from "@/services/fetch/elasticsearch.fetch";

type IndexType = 'products' | 'users';

interface ManagementActionsProps {
    onActionComplete: () => void;
}

export function ManagementActions({ onActionComplete }: ManagementActionsProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<IndexType>('products');
    const [showConfirmDialog, setShowConfirmDialog] = useState<{
        show: boolean;
        action: string;
        title: string;
        description: string;
        destructive: boolean;
        onConfirm: () => void;
    } | null>(null);

    const getIndexLabel = () => activeTab === 'products' ? 'Products' : 'Users';

    const handleReset = async () => {
        const loadingKey = `reset-${activeTab}`;
        setIsLoading(loadingKey);
        try {
            const resetFn = activeTab === 'products' ? resetProductsIndex : resetUsersIndex;

            // Dry run first
            const dryRunResult = await resetFn(true);
            toast.info(`Dry Run: ${dryRunResult.message}`);

            // Confirm
            const confirmed = await new Promise((resolve) => {
                setShowConfirmDialog({
                    show: true,
                    action: 'reset',
                    title: `Reset ${getIndexLabel()} Index?`,
                    description: 'This will DELETE and RECREATE the index (empty). All data will be lost. You will need to reindex afterward.',
                    destructive: true,
                    onConfirm: () => {
                        setShowConfirmDialog(null);
                        resolve(true);
                    },
                });
            });

            if (!confirmed) {
                setIsLoading(null);
                return;
            }

            // Execute
            const result = await resetFn(false);
            toast.success(result.message);
            onActionComplete();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to reset index';
            toast.error(message);
        } finally {
            setIsLoading(null);
        }
    };

    const handleReindex = async () => {
        const loadingKey = `reindex-${activeTab}`;
        setIsLoading(loadingKey);
        try {
            const reindexFn = activeTab === 'products' ? reindexProducts : reindexUsers;

            // Dry run first
            const dryRunResult = await reindexFn(true);
            toast.info(`Dry Run: ${dryRunResult.message}`);

            // Execute
            const result = await reindexFn(false);
            const data = result.data;
            toast.success(
                `Reindexed ${data.indexed} ${activeTab} in ${data.duration}${
                    data.errors > 0 ? ` (${data.errors} errors)` : ''
                }`
            );
            onActionComplete();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to reindex';
            toast.error(message);
        } finally {
            setIsLoading(null);
        }
    };

    const handleResetAndReindex = async () => {
        const loadingKey = `reset-reindex-${activeTab}`;
        setIsLoading(loadingKey);
        try {
            const resetAndReindexFn = activeTab === 'products' ? resetAndReindexProducts : resetAndReindexUsers;

            // Dry run first
            const dryRunResult = await resetAndReindexFn(true);
            toast.info(`Dry Run: ${dryRunResult.message}`);

            // Confirm
            const confirmed = await new Promise((resolve) => {
                setShowConfirmDialog({
                    show: true,
                    action: 'reset-reindex',
                    title: `Reset & Reindex ${getIndexLabel()}?`,
                    description: `This will DELETE the index, RECREATE it, and REINDEX all ${activeTab} from database. This is the recommended way for full refresh.`,
                    destructive: true,
                    onConfirm: () => {
                        setShowConfirmDialog(null);
                        resolve(true);
                    },
                });
            });

            if (!confirmed) {
                setIsLoading(null);
                return;
            }

            // Execute
            const result = await resetAndReindexFn(false);
            const data = result.data;
            toast.success(
                `Reset & Reindexed ${data.indexed} ${activeTab} in ${data.duration}${
                    data.errors > 0 ? ` (${data.errors} errors)` : ''
                }`
            );
            onActionComplete();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to reset and reindex';
            toast.error(message);
        } finally {
            setIsLoading(null);
        }
    };

    const handleDeleteIndex = async () => {
        const loadingKey = `delete-${activeTab}`;
        setIsLoading(loadingKey);
        try {
            const deleteFn = activeTab === 'products' ? deleteProductsIndex : deleteUsersIndex;

            // Confirm
            const confirmed = await new Promise((resolve) => {
                setShowConfirmDialog({
                    show: true,
                    action: 'delete',
                    title: `Delete ${getIndexLabel()} Index?`,
                    description: 'DANGER: This will PERMANENTLY DELETE the index without reindexing. Use Reset & Reindex instead unless you know what you are doing.',
                    destructive: true,
                    onConfirm: () => {
                        setShowConfirmDialog(null);
                        resolve(true);
                    },
                });
            });

            if (!confirmed) {
                setIsLoading(null);
                return;
            }

            // Execute
            const result = await deleteFn();
            toast.success(result.message);
            onActionComplete();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete index';
            toast.error(message);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <>
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Management Actions</h3>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === 'products'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Package className="h-4 w-4" />
                            Products
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === 'users'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Users className="h-4 w-4" />
                            Users
                        </button>
                    </div>
                </div>

                {/* Active Index Indicator */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">Active Index:</span>{' '}
                        {activeTab === 'products' ? 'Products Index' : 'Users Index'}
                    </p>
                </div>

                <div className="space-y-3">
                    {/* Reset & Reindex (Recommended) */}
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <RotateCcw className="h-4 w-4 text-green-600" />
                                    <h4 className="font-semibold text-green-900">Reset & Reindex</h4>
                                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">RECOMMENDED</span>
                                </div>
                                <p className="text-sm text-green-700">
                                    Full refresh: Delete, recreate, and reindex all products
                                </p>
                            </div>
                            <Button
                                onClick={handleResetAndReindex}
                                disabled={isLoading !== null}
                                variant="default"
                                size="sm"
                                className="ml-3 bg-green-600 hover:bg-green-700"
                            >
                                {isLoading === `reset-reindex-${activeTab}` ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Execute
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Reindex Only */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <RefreshCw className="h-4 w-4 text-blue-600" />
                                    <h4 className="font-semibold text-blue-900">Reindex Products</h4>
                                </div>
                                <p className="text-sm text-blue-700">
                                    Re-index all products without deleting the index
                                </p>
                            </div>
                            <Button
                                onClick={handleReindex}
                                disabled={isLoading !== null}
                                variant="outline"
                                size="sm"
                                className="ml-3"
                            >
                                {isLoading === `reindex-${activeTab}` ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Reindexing...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Reindex
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Reset Index */}
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <h4 className="font-semibold text-yellow-900">Reset Index</h4>
                                </div>
                                <p className="text-sm text-yellow-700">
                                    Delete and recreate index (empty). Requires manual reindex after.
                                </p>
                            </div>
                            <Button
                                onClick={handleReset}
                                disabled={isLoading !== null}
                                variant="outline"
                                size="sm"
                                className="ml-3 border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                            >
                                {isLoading === `reset-${activeTab}` ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Reset
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Delete Index (Danger Zone) */}
                    <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                    <h4 className="font-semibold text-red-900">Delete Index</h4>
                                    <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">DANGER</span>
                                </div>
                                <p className="text-sm text-red-700">
                                    Permanently delete index without reindexing. Not recommended.
                                </p>
                            </div>
                            <Button
                                onClick={handleDeleteIndex}
                                disabled={isLoading !== null}
                                variant="destructive"
                                size="sm"
                                className="ml-3"
                            >
                                {isLoading === `delete-${activeTab}` ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                        💡 <span className="font-semibold">Tip:</span> All operations run a dry-run preview first.
                        Use &quot;Reset & Reindex&quot; for best results.
                    </p>
                </div>
            </Card>

            {/* Confirmation Dialog */}
            {showConfirmDialog?.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                            <h3 className="text-lg font-bold">{showConfirmDialog.title}</h3>
                        </div>
                        <p className="text-gray-700 mb-6">{showConfirmDialog.description}</p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmDialog(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={showConfirmDialog.destructive ? "destructive" : "default"}
                                onClick={showConfirmDialog.onConfirm}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
