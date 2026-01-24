"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { useEncryption } from "@/contexts/EncryptionContext";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

interface ResetPasswordFormInputs {
    newPassword: string;
    confirmPassword: string;
    otp: string;
    twoFactorCode?: string;
}

interface ResetPasswordFormProps {
    resetToken: string;
    requires2FA: boolean;
}

export default function ResetPasswordForm({ resetToken, requires2FA }: ResetPasswordFormProps) {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordFormInputs>();
    const [isLoading, setIsLoading] = useState(false);
    const [viewPassword, setViewPassword] = useState('password');
    const [viewConfirmPassword, setViewConfirmPassword] = useState('password');
    const router = useRouter();

    // Encryption context
    const { hybridEncryptJSON, isLoading: encryptionLoading, error: encryptionError } = useEncryption();

    // Watch password for validation
    const newPassword = watch('newPassword');

    const onSubmit = async (dataForm: ResetPasswordFormInputs) => {
        try {
            setIsLoading(true);

            // Check encryption key
            if (encryptionLoading) {
                toast.error("Encryption key is loading. Please wait...");
                setIsLoading(false);
                return;
            }

            if (encryptionError) {
                toast.error("Failed to load encryption key. Please refresh the page.");
                setIsLoading(false);
                return;
            }

            // Validate passwords match
            if (dataForm.newPassword !== dataForm.confirmPassword) {
                toast.error("Passwords do not match");
                setIsLoading(false);
                return;
            }

            // Prepare reset data
            const resetData = {
                resetToken: resetToken,
                newPassword: dataForm.newPassword,
                otp: dataForm.otp,
                ...(requires2FA && dataForm.twoFactorCode ? { twoFactorCode: dataForm.twoFactorCode } : {}),
            };

            // Encrypt request with RSA hybrid
            const encryptedRequest = await hybridEncryptJSON(resetData);

            // Call reset password API
            await authService.resetPassword(encryptedRequest);

            toast.success("Password reset successful! You can now login with your new password.");

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Password reset failed. Please try again.';
            toast.error(errorMessage);
            setIsLoading(false);
        }
    };

    if (encryptionLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 w-full max-w-md mx-auto">
                <Loader2 className="animate-spin" size={48} />
                <p className="text-gray-600">Loading encryption...</p>
            </div>
        );
    }

    if (encryptionError) {
        return (
            <div className="text-center w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-red-600">Encryption Error</h2>
                <p className="text-gray-600 mb-4">{encryptionError}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-white bg-sky-400 rounded-xl hover:bg-sky-500 px-4 py-2 text-sm cursor-pointer"
                >
                    Refresh Page
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
                <p className="text-gray-600 text-sm">
                    {requires2FA
                        ? "Enter the OTP from your email and 2FA code to reset your password"
                        : "Enter the OTP from your email and your new password"}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {/* OTP Code */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="otp">PASSWORD RESET OTP</Label>
                    <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        {...register("otp", {
                            required: "OTP is required",
                            pattern: {
                                value: /^[0-9]{6}$/,
                                message: "OTP must be 6 digits"
                            }
                        })}
                        className={errors.otp ? "border-red-500" : ""}
                    />
                    {errors.otp && (
                        <p className="text-red-500 text-xs">{errors.otp.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Enter the 6-digit OTP sent to your email
                    </p>
                </div>

                {/* 2FA Code (if required) */}
                {requires2FA && (
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="twoFactorCode">2FA VERIFICATION CODE</Label>
                        <Input
                            id="twoFactorCode"
                            type="text"
                            placeholder="654321"
                            maxLength={6}
                            {...register("twoFactorCode", {
                                required: requires2FA ? "2FA code is required" : false,
                                pattern: {
                                    value: /^[0-9]{6}$/,
                                    message: "2FA code must be 6 digits"
                                }
                            })}
                            className={errors.twoFactorCode ? "border-red-500" : ""}
                        />
                        {errors.twoFactorCode && (
                            <p className="text-red-500 text-xs">{errors.twoFactorCode.message}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            Enter the 6-digit 2FA code sent to your email/WhatsApp
                        </p>
                    </div>
                )}

                {/* New Password */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="newPassword">NEW PASSWORD</Label>
                    <div className="flex relative items-center">
                        <Input
                            id="newPassword"
                            type={viewPassword}
                            placeholder="Enter new password"
                            {...register("newPassword", {
                                required: "Password is required",
                                minLength: {
                                    value: 10,
                                    message: "Password must be at least 10 characters"
                                },
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                                    message: "Password must contain uppercase, lowercase, number, and special character"
                                }
                            })}
                            className={errors.newPassword ? "border-red-500" : ""}
                        />
                        <button
                            type="button"
                            onClick={() => setViewPassword(viewPassword === 'text' ? 'password' : 'text')}
                            className="absolute right-3"
                        >
                            {viewPassword === 'text' ? (
                                <VscEye size={20} className="text-zinc-400 hover:text-zinc-600" />
                            ) : (
                                <VscEyeClosed size={20} className="text-zinc-400 hover:text-zinc-600" />
                            )}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="text-red-500 text-xs">{errors.newPassword.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Minimum 10 characters with uppercase, lowercase, number, and special character
                    </p>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="confirmPassword">CONFIRM PASSWORD</Label>
                    <div className="flex relative items-center">
                        <Input
                            id="confirmPassword"
                            type={viewConfirmPassword}
                            placeholder="Confirm new password"
                            {...register("confirmPassword", {
                                required: "Please confirm your password",
                                validate: (value) =>
                                    value === newPassword || "Passwords do not match"
                            })}
                            className={errors.confirmPassword ? "border-red-500" : ""}
                        />
                        <button
                            type="button"
                            onClick={() => setViewConfirmPassword(viewConfirmPassword === 'text' ? 'password' : 'text')}
                            className="absolute right-3"
                        >
                            {viewConfirmPassword === 'text' ? (
                                <VscEye size={20} className="text-zinc-400 hover:text-zinc-600" />
                            ) : (
                                <VscEyeClosed size={20} className="text-zinc-400 hover:text-zinc-600" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin mr-2" size={16} />
                            Resetting Password...
                        </>
                    ) : (
                        'Reset Password'
                    )}
                </Button>

                <div className="text-center text-xs text-gray-600 mt-2">
                    Remember your password?{' '}
                    <a href="/login" className="text-blue-600 hover:underline font-medium">
                        Back to Login
                    </a>
                </div>
            </form>

            <div className="text-center text-xs text-gray-500 mt-4">
                <p>OTP codes expire in 5 minutes</p>
                {requires2FA && <p>2FA code also expires in 5 minutes</p>}
            </div>
        </div>
    );
}
