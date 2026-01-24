"use client";

import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import Link from "next/link";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useEncryption } from "@/contexts/EncryptionContext";
import { authService, ForgotPasswordRequest, ResetPasswordRequest } from "@/services/auth.service";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";


interface ForgotPasswordFormInputs {
    email: string;
}

interface ResetPasswordFormInputs {
    newPassword: string;
    confirmPassword: string;
    otp: string;
    twoFactorCode?: string;
}

export default function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'request' | 'reset'>('request');
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [requires2FA, setRequires2FA] = useState(false);
    const [email, setEmail] = useState('');
    const router = useRouter();
    const { hybridEncryptJSON, isLoading: encryptionLoading, error: encryptionError } = useEncryption();

    const handleRequestReset = async (formData: ForgotPasswordFormInputs) => {
        try {
            setIsLoading(true);

            // Check encryption key
            if (encryptionLoading || encryptionError) {
                toast.error("Encryption not ready. Please refresh the page.");
                setIsLoading(false);
                return;
            }

            const requestData: ForgotPasswordRequest = {
                email: formData.email,
            };

            // Encrypt request with RSA hybrid
            const encryptedRequest = await hybridEncryptJSON(requestData);

            // Call forgot password API
            const response = await authService.forgotPassword(encryptedRequest);

            // Success - move to reset step
            setResetToken(response.data.resetToken);
            setRequires2FA(response.data.requires2FA);
            setEmail(formData.email);
            setStep('reset');
            toast.success("Password reset code sent to your email!");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to send reset code';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (formData: ResetPasswordFormInputs) => {
        try {
            setIsLoading(true);

            if (!resetToken) {
                throw new Error('Reset token not found');
            }

            // Validate passwords match
            if (formData.newPassword !== formData.confirmPassword) {
                toast.error("Passwords do not match");
                setIsLoading(false);
                return;
            }

            const resetData: ResetPasswordRequest = {
                resetToken,
                newPassword: formData.newPassword,
                otp: formData.otp,
                twoFactorCode: formData.twoFactorCode,
            };

            // Encrypt request with RSA hybrid
            const encryptedRequest = await hybridEncryptJSON(resetData);

            // Call reset password API
            await authService.resetPassword(encryptedRequest);

            toast.success("Password reset successful! Please login with your new password.");
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (encryptionLoading) {
        return (
            <div className="flex w-full max-w-md mx-auto items-center justify-center">
                <Loader2 className="animate-spin mr-2" /> Loading encryption...
            </div>
        );
    }

    if (encryptionError) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Encryption Error</h2>
                <p className="text-gray-600">{encryptionError}</p>
                <button onClick={() => window.location.reload()} className="text-white bg-sky-400 rounded-xl hover:bg-sky-500 mt-4 px-3 py-1 text-sm cursor-pointer">Refresh</button>
            </div>
        );
    }

    if (step === 'request') {
        return <RequestResetForm onSubmit={handleRequestReset} isLoading={isLoading} />;
    }

    return (
        <ResetPasswordFormComponent
            onSubmit={handleResetPassword}
            isLoading={isLoading}
            requires2FA={requires2FA}
            email={email}
        />
    );
}

// Request Reset Form Component
function RequestResetForm({
    onSubmit,
    isLoading
}: {
    onSubmit: (data: ForgotPasswordFormInputs) => void;
    isLoading: boolean;
}) {
    const { register, handleSubmit } = useForm<ForgotPasswordFormInputs>();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-md mx-auto">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Forgot Password?</h2>
                <p className="text-gray-600 text-sm mt-2">
                    {`Enter your email address and we'll send you a code to reset your password.`}
                </p>
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="email">EMAIL ADDRESS</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email", { required: true })}
                    required
                    autoComplete="email"
                    disabled={isLoading}
                />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Send Reset Code'}
            </Button>

            <p className="text-center text-xs text-gray-600">
                Remember your password?{' '}
                <Link href="/" className="text-blue-600 hover:underline">Sign in</Link>
            </p>
        </form>
    );
}

// Reset Password Form Component
function ResetPasswordFormComponent({
    onSubmit,
    isLoading,
    requires2FA,
    email
}: {
    onSubmit: (data: ResetPasswordFormInputs) => void;
    isLoading: boolean;
    requires2FA: boolean;
    email: string;
}) {
    const { register, handleSubmit } = useForm<ResetPasswordFormInputs>();
    const [viewPassword, setViewPassword] = useState('password');
    const [viewConfirmPassword, setViewConfirmPassword] = useState('password');
    const [otp, setOtp] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');

    const handleFormSubmit = (data: Omit<ResetPasswordFormInputs, 'otp' | 'twoFactorCode'>) => {
        onSubmit({
            ...data,
            otp,
            twoFactorCode: requires2FA ? twoFactorCode : undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 w-full max-w-md mx-auto">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Reset Password</h2>
                <p className="text-gray-600 text-sm mt-2">
                    Enter the code sent to <strong>{email}</strong>
                </p>
            </div>

            {/* OTP Input */}
            <div className="flex flex-col gap-2">
                <Label>PASSWORD RESET CODE</Label>
                <div className="flex justify-center">
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
            </div>

            {/* 2FA Code Input (if required) */}
            {requires2FA && (
                <div className="flex flex-col gap-2">
                    <Label>TWO-FACTOR CODE</Label>
                    <div className="flex items-center gap-2 p-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md mb-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>Check your email/WhatsApp for the 2FA code</p>
                    </div>
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={6}
                            value={twoFactorCode}
                            onChange={(value) => setTwoFactorCode(value)}
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
                </div>
            )}

            {/* New Password */}
            <div className="flex flex-col gap-1">
                <Label htmlFor="newPassword">NEW PASSWORD</Label>
                <div className="flex relative items-center">
                    <Input
                        id="newPassword"
                        type={viewPassword}
                        placeholder="Minimum 10 characters"
                        {...register("newPassword", { required: true, minLength: 10 })}
                        required
                        autoComplete="new-password"
                        disabled={isLoading}
                    />
                    {viewPassword === 'text' ?
                        <VscEye onClick={() => setViewPassword('password')} size={20} className="cursor-pointer absolute right-3 text-zinc-300 transition-colors hover:text-zinc-500" /> :
                        <VscEyeClosed onClick={() => setViewPassword('text')} size={20} className="cursor-pointer absolute right-3 text-zinc-300 transition-colors hover:text-zinc-500" />
                    }
                </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
                <Label htmlFor="confirmPassword">CONFIRM NEW PASSWORD</Label>
                <div className="flex relative items-center">
                    <Input
                        id="confirmPassword"
                        type={viewConfirmPassword}
                        placeholder="Re-enter password"
                        {...register("confirmPassword", { required: true })}
                        required
                        autoComplete="new-password"
                        disabled={isLoading}
                    />
                    {viewConfirmPassword === 'text' ?
                        <VscEye onClick={() => setViewConfirmPassword('password')} size={20} className="cursor-pointer absolute right-3 text-zinc-300 transition-colors hover:text-zinc-500" /> :
                        <VscEyeClosed onClick={() => setViewConfirmPassword('text')} size={20} className="cursor-pointer absolute right-3 text-zinc-300 transition-colors hover:text-zinc-500" />
                    }
                </div>
            </div>

            <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoading || otp.length !== 6 || (requires2FA && twoFactorCode.length !== 6)}
            >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
            </Button>

            <p className="text-center text-xs text-gray-600">
                Remember your password?{' '}
                <Link href="/" className="text-blue-600 hover:underline">Sign in</Link>
            </p>
        </form>
    );
}
