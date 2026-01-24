"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Loader2, Download, Copy, Key, AlertTriangle, RefreshCw } from "lucide-react";
import { authService } from "@/services/auth.service";
import { userData } from "@/lib/auth.user";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function RecoveryCodesManagement() {
    const [isLoading, setIsLoading] = useState(false);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [showCodes, setShowCodes] = useState(false);
    const [recoveryCodesCount, setRecoveryCodesCount] = useState<number>(0);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
    const [codesSaved, setCodesSaved] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const user = await userData();
            if (!user || !user.accessToken) {
                return;
            }

            const response = await authService.get2FAStatus(user.accessToken);
            setTwoFactorEnabled(response.data.twoFactorEnabled);
            setRecoveryCodesCount(response.data.recoveryCodesCount);
        } catch (error) {
            console.error("Failed to fetch 2FA status:", error);
        }
    };

    const handleGenerateCodes = async () => {
        try {
            const user = await userData();
            if (!user || !user.accessToken) {
                toast.error("Please login to access this feature");
                return;
            }

            if (!twoFactorEnabled) {
                toast.error("Please enable 2FA first before generating recovery codes");
                return;
            }

            setIsLoading(true);

            const response = await authService.generateRecoveryCodes(user.accessToken);
            setRecoveryCodes(response.data.codes);
            setShowCodes(true);
            setCodesSaved(false);
            toast.success("Recovery codes generated successfully!");

            // Refresh status to update count
            await fetchStatus();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate recovery codes';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateClick = () => {
        if (recoveryCodesCount > 0) {
            // Show confirmation dialog if codes already exist
            setShowRegenerateDialog(true);
        } else {
            // No existing codes, generate directly
            handleGenerateCodes();
        }
    };

    const handleConfirmRegenerate = () => {
        setShowRegenerateDialog(false);
        handleGenerateCodes();
    };

    const handleCopyCodes = () => {
        const codesText = `Recovery Codes - Generated on ${new Date().toLocaleString()}\n\n` +
            recoveryCodes.map((code, i) => `${i + 1}. ${code}`).join('\n') +
            '\n\nIMPORTANT: Keep these codes in a safe place. Each code can only be used once.';

        navigator.clipboard.writeText(codesText);
        toast.success("Recovery codes copied to clipboard!");
    };

    const handleDownloadCodes = () => {
        const codesText = `Recovery Codes - Generated on ${new Date().toLocaleString()}\n\n` +
            recoveryCodes.map((code, i) => `${i + 1}. ${code}`).join('\n') +
            '\n\nIMPORTANT: Keep these codes in a safe place. Each code can only be used once.';

        const blob = new Blob([codesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recovery-codes-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Recovery codes downloaded!");
    };

    const handlePrintCodes = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const codesHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Recovery Codes</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        h1 { color: #333; }
                        .date { color: #666; font-size: 14px; margin-bottom: 20px; }
                        .codes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
                        .code { font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold;
                               padding: 10px; border: 2px solid #ddd; border-radius: 4px; }
                        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px;
                                  border-radius: 4px; margin-top: 20px; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>🔐 Account Recovery Codes</h1>
                    <div class="date">Generated on: ${new Date().toLocaleString()}</div>
                    <div class="codes">
                        ${recoveryCodes.map((code, i) => `<div class="code">${i + 1}. ${code}</div>`).join('')}
                    </div>
                    <div class="warning">
                        <strong>⚠️ IMPORTANT:</strong>
                        <ul>
                            <li>Keep these codes in a safe, secure place</li>
                            <li>Each code can only be used once</li>
                            <li>Do not share these codes with anyone</li>
                            <li>If you lose access to your 2FA method, use these codes to recover your account</li>
                        </ul>
                    </div>
                    <button class="no-print" onclick="window.print()">Print</button>
                </body>
                </html>
            `;
            printWindow.document.write(codesHTML);
            printWindow.document.close();
        }
        toast.success("Print dialog opened!");
    };

    const handleConfirmSaved = () => {
        setCodesSaved(true);
        setShowCodes(false);
        toast.success("Great! Your recovery codes are safely stored.");
    };

    if (!twoFactorEnabled) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-gray-400" />
                        <CardTitle>Recovery Codes</CardTitle>
                    </div>
                    <CardDescription>
                        Generate backup codes to access your account if you lose access to your 2FA method
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>2FA Required</AlertTitle>
                        <AlertDescription>
                            You must enable Two-Factor Authentication first before generating recovery codes.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-green-600" />
                        <CardTitle>Recovery Codes</CardTitle>
                    </div>
                    <CardDescription>
                        Generate backup codes to access your account if you lose access to your 2FA method
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Recovery Codes Count */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium">Available Recovery Codes</p>
                            <p className="text-sm text-gray-600">
                                {recoveryCodesCount > 0
                                    ? `${recoveryCodesCount} out of 8 codes remaining`
                                    : 'No recovery codes generated yet'}
                            </p>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            {recoveryCodesCount}/8
                        </div>
                    </div>

                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                            Recovery codes can only be used once. Save them in a secure place.
                            Each code is 8 characters long.
                        </AlertDescription>
                    </Alert>

                    {!showCodes ? (
                        <div className="space-y-2">
                            <Button
                                onClick={handleRegenerateClick}
                                disabled={isLoading}
                                className="w-full"
                                variant={recoveryCodesCount > 0 ? "outline" : "default"}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin mr-2" />
                                ) : (
                                    <>
                                        {recoveryCodesCount > 0 ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Regenerate Recovery Codes
                                            </>
                                        ) : (
                                            'Generate New Recovery Codes'
                                        )}
                                    </>
                                )}
                            </Button>
                            {recoveryCodesCount > 0 && (
                                <p className="text-xs text-center text-gray-500">
                                    Regenerating will invalidate your existing codes
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                {recoveryCodes.map((code, index) => (
                                    <div key={index} className="font-mono text-sm font-semibold text-center py-2 px-3 bg-white rounded border">
                                        {code}
                                    </div>
                                ))}
                            </div>

                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Warning</AlertTitle>
                                <AlertDescription>
                                    These codes will only be shown once! Make sure to save them now.
                                </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-3 gap-2">
                                <Button onClick={handleCopyCodes} variant="outline" size="sm">
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy
                                </Button>
                                <Button onClick={handleDownloadCodes} variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                                <Button onClick={handlePrintCodes} variant="outline" size="sm">
                                    Print
                                </Button>
                            </div>

                            <Button
                                onClick={handleConfirmSaved}
                                className="w-full"
                                disabled={codesSaved}
                            >
                                {codesSaved ? '✓ Codes Saved' : "I've Saved My Codes"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Regenerate Confirmation Dialog */}
            <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate Recovery Codes?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                You currently have <strong>{recoveryCodesCount} unused recovery codes</strong>.
                            </p>
                            <p>
                                Generating new codes will <strong className="text-red-600">permanently invalidate all existing codes</strong>.
                            </p>
                            <p className="font-semibold text-gray-900">
                                Are you sure you want to continue?
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmRegenerate} className="bg-red-600 hover:bg-red-700">
                            Yes, Regenerate Codes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
