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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

interface OTPVerificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVerify: (code: string, useRecoveryCode: boolean) => Promise<void>;
    method: 'EMAIL' | 'WHATSAPP';
    isLoading?: boolean;
    error?: string | null;
}

export function OTPVerificationDialog({
    open,
    onOpenChange,
    onVerify,
    method,
    isLoading = false,
    error = null,
}: OTPVerificationDialogProps) {
    const [otp, setOtp] = useState('');
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);
    const [recoveryCode, setRecoveryCode] = useState('');

    const handleSubmit = async () => {
        const code = useRecoveryCode ? recoveryCode : otp;
        if (!code || (useRecoveryCode ? code.length < 8 : code.length !== 6)) {
            return;
        }
        await onVerify(code, useRecoveryCode);
    };

    const isOtpComplete = useRecoveryCode
        ? recoveryCode.length >= 8
        : otp.length === 6;

    const handleModeSwitch = () => {
        setUseRecoveryCode(!useRecoveryCode);
        setOtp('');
        setRecoveryCode('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                        {useRecoveryCode
                            ? "Enter your 8-character recovery code"
                            : `Enter the 6-digit code sent to your ${method === 'EMAIL' ? 'email' : 'WhatsApp'}`
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!useRecoveryCode ? (
                        <div className="flex flex-col items-center gap-2">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={(value) => setOtp(value)}
                                disabled={isLoading}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="recovery-code">Recovery Code</Label>
                            <Input
                                id="recovery-code"
                                type="text"
                                placeholder="ABC12XYZ"
                                value={recoveryCode}
                                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                                maxLength={8}
                                className="text-center text-lg font-semibold tracking-wider"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    )}

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
                            <p>Please wait and don&apos;t close this page</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={!isOtpComplete || isLoading}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify'
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleModeSwitch}
                            disabled={isLoading}
                            className="text-sm"
                        >
                            {useRecoveryCode
                                ? "Use verification code instead"
                                : "Use recovery code instead"
                            }
                        </Button>
                    </div>

                    {!isLoading && (
                        <p className="text-xs text-center text-muted-foreground">
                            Didn&apos;t receive the code? Check your spam folder or wait a moment.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
