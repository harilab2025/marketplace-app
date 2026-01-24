"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, MessageCircle, Shield, AlertCircle } from "lucide-react";

type TwoFactorMethod = 'EMAIL' | 'WHATSAPP';

interface TwoFactorMethodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectMethod: (method: TwoFactorMethod) => Promise<void>;
    isLoading?: boolean;
    error?: string | null;
}

export function TwoFactorMethodDialog({
    open,
    onOpenChange,
    onSelectMethod,
    isLoading = false,
    error = null,
}: TwoFactorMethodDialogProps) {
    const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod | null>(null);

    const handleSelectMethod = async (method: TwoFactorMethod) => {
        setSelectedMethod(method);
        await onSelectMethod(method);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-full">
                            <Shield className="h-5 w-5 text-indigo-600" />
                        </div>
                        <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
                    </div>
                    <DialogDescription>
                        For your security, please set up two-factor authentication to continue.
                        Choose how you want to receive verification codes:
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    {/* Email Option */}
                    <button
                        onClick={() => handleSelectMethod('EMAIL')}
                        disabled={isLoading}
                        className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-all hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                            selectedMethod === 'EMAIL' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                        }`}
                    >
                        <div className={`p-3 rounded-full ${
                            selectedMethod === 'EMAIL' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                            <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900">Email</h3>
                            <p className="text-sm text-gray-500">
                                Receive verification code via email
                            </p>
                        </div>
                        {isLoading && selectedMethod === 'EMAIL' && (
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                        )}
                    </button>

                    {/* WhatsApp Option */}
                    <button
                        onClick={() => handleSelectMethod('WHATSAPP')}
                        disabled={isLoading}
                        className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-all hover:border-green-500 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                            selectedMethod === 'WHATSAPP' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                    >
                        <div className={`p-3 rounded-full ${
                            selectedMethod === 'WHATSAPP' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                            <MessageCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                            <p className="text-sm text-gray-500">
                                Receive verification code via WhatsApp
                            </p>
                        </div>
                        {isLoading && selectedMethod === 'WHATSAPP' && (
                            <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                        )}
                    </button>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Loading Message */}
                    {isLoading && (
                        <div className="flex items-center justify-center gap-2 p-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md">
                            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                            <p>Sending verification code...</p>
                        </div>
                    )}

                    <p className="text-xs text-center text-muted-foreground pt-2">
                        You can change your 2FA method later in security settings
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
