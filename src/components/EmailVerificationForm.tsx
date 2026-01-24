"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEncryption } from "@/contexts/EncryptionContext";
import { authService, VerifyEmailResponse } from "@/services/auth.service";
import { useRouter } from "next/navigation";

interface EmailVerificationFormInputs {
    code: string;
}

interface EmailVerificationFormProps {
    publicId: string;
    email: string;
}

export default function EmailVerificationForm({ publicId, email }: EmailVerificationFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<EmailVerificationFormInputs>();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Encryption context
    const { hybridEncryptJSON, decryptResponse, isLoading: encryptionLoading, error: encryptionError } = useEncryption();

    const onSubmit = async (dataForm: EmailVerificationFormInputs) => {
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

            // Prepare verification data
            const verifyData = {
                publicId: publicId,
                code: dataForm.code,
            };

            // Encrypt request with RSA hybrid
            const encryptedRequest = await hybridEncryptJSON(verifyData);

            // Call verify email API
            const response = await authService.verifyEmail(encryptedRequest);

            // Decrypt response data if needed (backend might return encrypted or plain)
            const decryptedData = typeof response.data === 'string'
                ? await decryptResponse<VerifyEmailResponse['data']>(response.data)
                : response.data;

            console.log('Email verification response:', decryptedData);

            toast.success("Email verified successfully! You can now login.");

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Email verification failed. Please try again.';
            toast.error(errorMessage);
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            setIsLoading(true);

            // Check encryption key
            if (encryptionLoading || encryptionError) {
                toast.error("Encryption not available. Please refresh the page.");
                setIsLoading(false);
                return;
            }

            // Prepare resend data
            const resendData = {
                publicId: publicId,
            };

            // Encrypt request with RSA hybrid
            const encryptedRequest = await hybridEncryptJSON(resendData);

            // Call resend verification email API
            const response = await authService.resendVerificationEmail(encryptedRequest);

            toast.success(response.message || "Verification code has been resent to your email.");
            setIsLoading(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to resend code.';
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
                <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
                <p className="text-gray-600 text-sm">
                    We sent a 6-digit verification code to <strong>{email}</strong>
                </p>
                <p className="text-gray-500 text-xs mt-1">
                    Please check your inbox and enter the code below.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="code">VERIFICATION CODE</Label>
                    <Input
                        id="code"
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        {...register("code", {
                            required: "Verification code is required",
                            pattern: {
                                value: /^[0-9]{6}$/,
                                message: "Code must be 6 digits"
                            }
                        })}
                        className={errors.code ? "border-red-500" : ""}
                        autoFocus
                    />
                    {errors.code && (
                        <p className="text-red-500 text-xs">{errors.code.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Enter the 6-digit code from your email
                    </p>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin mr-2" size={16} />
                            Verifying...
                        </>
                    ) : (
                        'Verify Email'
                    )}
                </Button>

                <div className="text-center text-xs text-gray-600 mt-2">
                    Did not receive the code?{' '}
                    <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isLoading}
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Resend Code
                    </button>
                </div>
            </form>

            <div className="text-center text-xs text-gray-500 mt-4">
                <p>Code expires in 5 minutes</p>
            </div>
        </div>
    );
}
