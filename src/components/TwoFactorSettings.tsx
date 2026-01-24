"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Loader2, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEncryption } from "@/contexts/EncryptionContext";
import { authService, Setup2FARequest, Verify2FASetupRequest, Disable2FARequest } from "@/services/auth.service";
import { userData } from "@/lib/auth.user";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function TwoFactorSettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState<'EMAIL' | 'WHATSAPP' | null>(null);
    const [securityLevel, setSecurityLevel] = useState('BASIC');
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Setup state
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
    const [setupOtp, setSetupOtp] = useState('');

    // Disable state
    const [isDisableMode, setIsDisableMode] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');

    const { hybridEncryptJSON } = useEncryption();

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const user = await userData();
            if (!user || !user.accessToken) {
                toast.error("Please login to access this page");
                return;
            }

            setAccessToken(user.accessToken);

            const response = await authService.get2FAStatus(user.accessToken);
            setTwoFactorEnabled(response.data.twoFactorEnabled);
            setTwoFactorMethod(response.data.twoFactorMethod);
            setSecurityLevel(response.data.securityLevel);
            setRecoveryCodesCount(response.data.recoveryCodesCount);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch 2FA status';
            toast.error(errorMessage);
        }
    };

    const handleInitiateSetup = async () => {
        try {
            if (!accessToken) {
                toast.error("Access token not found");
                return;
            }

            setIsLoading(true);

            const setupData: Setup2FARequest = {
                method: selectedMethod,
            };

            const encryptedRequest = await hybridEncryptJSON(setupData);
            const response = await authService.initiate2FASetup(encryptedRequest, accessToken);

            toast.success(response.message);
            setIsSetupMode(true);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '2FA setup failed';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifySetup = async () => {
        try {
            if (!accessToken) {
                toast.error("Access token not found");
                return;
            }

            if (setupOtp.length !== 6) {
                toast.error("Please enter a valid 6-digit code");
                return;
            }

            setIsLoading(true);

            const verifyData: Verify2FASetupRequest = {
                code: setupOtp,
            };

            const encryptedRequest = await hybridEncryptJSON(verifyData);
            const response = await authService.verify2FASetup(encryptedRequest, accessToken);

            toast.success(response.message);
            setIsSetupMode(false);
            setSetupOtp('');
            await fetchStatus();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Verification failed';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        try {
            if (!accessToken) {
                toast.error("Access token not found");
                return;
            }

            if (!disablePassword) {
                toast.error("Please enter your password");
                return;
            }

            setIsLoading(true);

            const disableData: Disable2FARequest = {
                password: disablePassword,
            };

            const encryptedRequest = await hybridEncryptJSON(disableData);
            const response = await authService.disable2FA(encryptedRequest, accessToken);

            toast.success(response.message);
            setIsDisableMode(false);
            setDisablePassword('');
            await fetchStatus();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to disable 2FA';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <CardTitle>Two-Factor Authentication</CardTitle>
                </div>
                <CardDescription>
                    Add an extra layer of security to your account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="font-medium">Status</p>
                        <p className="text-sm text-gray-600">
                            {twoFactorEnabled ? `Enabled via ${twoFactorMethod}` : 'Disabled'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {twoFactorEnabled ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                    </div>
                </div>

                {/* Security Level */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="font-medium">Security Level</p>
                        <p className="text-sm text-gray-600">{securityLevel}</p>
                    </div>
                </div>

                {/* Enable 2FA */}
                {!twoFactorEnabled && !isSetupMode && (
                    <div className="space-y-4">
                        <Label>Choose 2FA Method</Label>
                        <Select
                            value={selectedMethod}
                            onValueChange={(value) => setSelectedMethod(value as 'EMAIL' | 'WHATSAPP')}
                            disabled={isLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EMAIL">Email</SelectItem>
                                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={handleInitiateSetup} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Enable 2FA'}
                        </Button>
                    </div>
                )}

                {/* Verify Setup */}
                {isSetupMode && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p>Enter the code sent to your {selectedMethod.toLowerCase()}</p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <InputOTP
                                maxLength={6}
                                value={setupOtp}
                                onChange={(value) => setSetupOtp(value)}
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

                            <div className="flex gap-2 w-full">
                                <Button variant="outline" onClick={() => setIsSetupMode(false)} disabled={isLoading} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleVerifySetup} disabled={isLoading || setupOtp.length !== 6} className="flex-1">
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Verify'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Disable 2FA */}
                {twoFactorEnabled && !isDisableMode && (
                    <Button variant="destructive" onClick={() => setIsDisableMode(true)} className="w-full">
                        Disable 2FA
                    </Button>
                )}

                {isDisableMode && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p>Enter your password to disable 2FA</p>
                        </div>

                        <Input
                            type="password"
                            placeholder="Your password"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                            disabled={isLoading}
                        />

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsDisableMode(false)} disabled={isLoading} className="flex-1">
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDisable2FA} disabled={isLoading} className="flex-1">
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm Disable'}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
