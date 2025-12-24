'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
    getCacheStats,
    checkHealth,
    clearUsers,
    clearProducts,
    clearOrders,
    clearAll,
    clearByPattern,
    selectCacheStats,
    selectIsHealthy,
    selectIsLoadingStats,
    selectIsLoadingAction,
    selectCacheError,
    selectLastAction,
    clearLastAction
} from '@/store/cacheSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Database,
    Trash2,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Users,
    Package,
    ShoppingCart,
    Server,
    Activity
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CacheManagement() {
    const dispatch = useDispatch<AppDispatch>();
    const stats = useSelector(selectCacheStats);
    const isHealthy = useSelector(selectIsHealthy);
    const isLoadingStats = useSelector(selectIsLoadingStats);
    const isLoadingAction = useSelector(selectIsLoadingAction);
    const error = useSelector(selectCacheError);
    const lastAction = useSelector(selectLastAction);

    const [customPattern, setCustomPattern] = useState('');
    const [showClearAllDialog, setShowClearAllDialog] = useState(false);

    useEffect(() => {
        dispatch(getCacheStats());
        dispatch(checkHealth());

        // Refresh stats every 30 seconds
        const interval = setInterval(() => {
            dispatch(getCacheStats());
            dispatch(checkHealth());
        }, 30000);

        return () => clearInterval(interval);
    }, [dispatch]);

    useEffect(() => {
        if (lastAction) {
            // Refresh stats after action
            dispatch(getCacheStats());
            // Clear last action after 5 seconds
            const timeout = setTimeout(() => {
                dispatch(clearLastAction());
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [lastAction, dispatch]);

    const handleRefresh = () => {
        dispatch(getCacheStats());
        dispatch(checkHealth());
    };

    const handleClearUsers = () => {
        dispatch(clearUsers());
    };

    const handleClearProducts = () => {
        dispatch(clearProducts());
    };

    const handleClearOrders = () => {
        dispatch(clearOrders());
    };

    const handleClearAll = () => {
        dispatch(clearAll());
        setShowClearAllDialog(false);
    };

    const handleClearByPattern = () => {
        if (customPattern.trim()) {
            dispatch(clearByPattern(customPattern.trim()));
            setCustomPattern('');
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Cache Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor and manage your application cache
                    </p>
                </div>
                <Button onClick={handleRefresh} disabled={isLoadingStats} variant="outline">
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Success Alert */}
            {lastAction && (
                <Alert className="border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        Successfully cleared <strong>{lastAction.deleted}</strong> {lastAction.type} cache keys
                    </AlertDescription>
                </Alert>
            )}

            {/* Health Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Cache Health Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Badge variant={isHealthy ? "default" : "destructive"} className="text-sm py-1 px-3">
                            {isHealthy ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Healthy
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Unhealthy
                                </>
                            )}
                        </Badge>
                        {stats && (
                            <div className="flex gap-6 text-sm text-muted-foreground">
                                <div>
                                    <span className="font-semibold">{stats.totalKeys}</span> Total Keys
                                </div>
                                <div>
                                    <span className="font-semibold">{stats.memoryUsage}</span> Memory Usage
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Cache Statistics */}
            {stats && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Cache Statistics by Pattern
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.keysByPattern.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-mono text-sm text-muted-foreground">{item.pattern}</p>
                                            <p className="text-2xl font-bold mt-1">{item.count}</p>
                                        </div>
                                        <Server className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Clear Actions</CardTitle>
                    <CardDescription>
                        Clear cache for specific modules. Use with caution!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button
                            onClick={handleClearUsers}
                            disabled={isLoadingAction}
                            variant="outline"
                            className="h-auto py-4 flex-col"
                        >
                            <Users className="h-6 w-6 mb-2" />
                            <span>Clear Users Cache</span>
                        </Button>

                        <Button
                            onClick={handleClearProducts}
                            disabled={isLoadingAction}
                            variant="outline"
                            className="h-auto py-4 flex-col"
                        >
                            <Package className="h-6 w-6 mb-2" />
                            <span>Clear Products Cache</span>
                        </Button>

                        <Button
                            onClick={handleClearOrders}
                            disabled={isLoadingAction}
                            variant="outline"
                            className="h-auto py-4 flex-col"
                        >
                            <ShoppingCart className="h-6 w-6 mb-2" />
                            <span>Clear Orders Cache</span>
                        </Button>

                        <Button
                            onClick={() => setShowClearAllDialog(true)}
                            disabled={isLoadingAction}
                            variant="destructive"
                            className="h-auto py-4 flex-col"
                        >
                            <Trash2 className="h-6 w-6 mb-2" />
                            <span>Clear All Cache</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Advanced: Clear by Pattern */}
            <Card>
                <CardHeader>
                    <CardTitle>Advanced: Clear by Pattern</CardTitle>
                    <CardDescription>
                        {` Clear cache using a custom Redis pattern (e.g., "users:list:*", "products:*")`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Label htmlFor="pattern">Cache Pattern</Label>
                            <Input
                                id="pattern"
                                placeholder="e.g., users:list:*"
                                value={customPattern}
                                onChange={(e) => setCustomPattern(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleClearByPattern();
                                    }
                                }}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={handleClearByPattern}
                                disabled={isLoadingAction || !customPattern.trim()}
                            >
                                Clear Pattern
                            </Button>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Pattern must start with: users:, products:, or orders:
                    </p>
                </CardContent>
            </Card>

            {/* Clear All Confirmation Dialog */}
            <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will clear <strong>ALL application caches</strong> (users, products, and orders).
                            This may temporarily impact performance while caches are rebuilt.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90">
                            Yes, Clear All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
