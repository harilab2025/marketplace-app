"use client";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useState, useEffect } from "react";
import Link from "next/link";
import { VscEye } from "react-icons/vsc";
import { VscEyeClosed } from "react-icons/vsc";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, LoaderCircle } from "lucide-react";
import { useEncryption } from "@/contexts/EncryptionContext";
import { authService, LoginRequest } from "@/services/auth.service";
import { OTPVerificationDialog } from "@/components/OTPVerificationDialog";
import { TwoFactorMethodDialog } from "@/components/TwoFactorMethodDialog";
import {
    processLoginResponse,
    process2FAVerificationResponse,
    process2FASelectMethodResponse,
    process2FASetupCompleteResponse
} from "@/actions/auth.secure.action";

declare global {
    interface Window {
        grecaptcha: {
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

interface LoginFormInputs {
    email: string;
    password: string;
    remember: boolean;
}

type LoginFlow = 'idle' | 'requires2FA' | 'requires2FASetup' | 'selectMethod' | 'verifySetupOTP';

export default function LoginForm() {
    const { status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset } = useForm<LoginFormInputs>();
    const [viewtypepass, setViewtypepass] = useState('password');
    const [mounted, setMounted] = useState(false);

    // Encryption context
    const { hybridEncryptJSON, isLoading: encryptionLoading, error: encryptionError } = useEncryption();

    // Login flow state
    const [loginFlow, setLoginFlow] = useState<LoginFlow>('idle');
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [twoFactorMethod, setTwoFactorMethod] = useState<'EMAIL' | 'WHATSAPP' | null>(null);

    // Dialog states
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [showMethodDialog, setShowMethodDialog] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [methodError, setMethodError] = useState<string | null>(null);
    const [dialogLoading, setDialogLoading] = useState(false);

    // Handle client-side mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle redirect for authenticated users
    useEffect(() => {
        if (status === "authenticated" && mounted) {
            window.location.replace('/dashboard');
        }
    }, [status, mounted]);

    // =========================================================================
    // STEP 1: Login Submit
    // =========================================================================
    const onSubmit = async (dataForm: LoginFormInputs) => {
        try {
            setIsLoading(true);
            setOtpError(null);
            setMethodError(null);

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

            if (!window.grecaptcha) {
                toast.error("reCAPTCHA is not loaded. Please try again later.");
                setIsLoading(false);
                return;
            }

            // Get reCAPTCHA token
            const token = await window.grecaptcha.execute(SITE_KEY, { action: 'login' });

            // Prepare login data
            const loginData: LoginRequest = {
                email: dataForm.email,
                password: dataForm.password,
                token: token,
            };

            // Encrypt request with RSA hybrid
            const encryptedRequest = await hybridEncryptJSON(loginData);

            // Call login API
            const response = await authService.login(encryptedRequest);

            // Process encrypted response
            const ResponseLogin = typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data);
            const result = await processLoginResponse(ResponseLogin);

            if (!result.success) {
                throw new Error(result.error || 'Login failed');
            }

            // Flow A: 2FA required (user already has 2FA enabled)
            if (result.requires2FA) {
                setSessionToken(result.sessionToken || null);
                setTwoFactorMethod(result.method || 'EMAIL');
                setLoginFlow('requires2FA');
                setShowOtpDialog(true);
                setIsLoading(false);
                toast.info(`Verification code sent to your ${result.method === 'EMAIL' ? 'email' : 'WhatsApp'}`);
                return;
            }

            // Flow B: 2FA setup required (user needs to setup 2FA)
            if (result.requires2FASetup) {
                setSessionToken(result.sessionToken || null);
                setLoginFlow('requires2FASetup');
                setShowMethodDialog(true);
                setIsLoading(false);
                toast.info('Please set up two-factor authentication to continue');
                return;
            }

            // Flow C: Login success (shouldn't happen with mandatory 2FA, but handle it)
            toast.success("Login successful!");
            setTimeout(() => {
                reset();
                window.location.href = '/dashboard';
            }, 1000);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
            toast.error(errorMessage);
            setIsLoading(false);
        }
    };

    // =========================================================================
    // STEP 2A: Verify 2FA (for users WITH 2FA already enabled)
    // =========================================================================
    const handleVerify2FA = async (code: string, useRecoveryCode: boolean) => {
        try {
            setDialogLoading(true);
            setOtpError(null);

            if (!sessionToken) {
                throw new Error('Session token not found');
            }

            // Prepare 2FA verification data
            const verifyData = {
                sessionToken,
                code,
                useRecoveryCode,
            };

            // Encrypt request
            const encryptedRequest = await hybridEncryptJSON(verifyData);

            // Call verify API
            const response = await authService.verify2FA(encryptedRequest);

            // Process encrypted response
            const encryptedResponse = typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data);

            const result = await process2FAVerificationResponse(encryptedResponse);

            if (!result.success) {
                throw new Error(result.error || '2FA verification failed');
            }

            // Success
            setShowOtpDialog(false);
            toast.success("Login successful!");
            setTimeout(() => {
                reset();
                window.location.href = '/dashboard';
            }, 1000);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '2FA verification failed';
            setOtpError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setDialogLoading(false);
        }
    };

    // =========================================================================
    // STEP 2B: Select 2FA Method (for users WITHOUT 2FA)
    // =========================================================================
    const handleSelectMethod = async (method: 'EMAIL' | 'WHATSAPP') => {
        try {
            setDialogLoading(true);
            setMethodError(null);

            if (!sessionToken) {
                throw new Error('Session token not found');
            }

            // Prepare select method data
            const selectData = {
                sessionToken,
                method,
            };

            // Call select-method API
            const response = await authService.setup2FASelectMethod(selectData);

            // Process data response
            const dataResponse = typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data);

            const result = await process2FASelectMethodResponse(dataResponse);

            if (!result.success) {
                throw new Error(result.error || 'Failed to select 2FA method');
            }

            // Success - move to OTP verification
            setTwoFactorMethod(method);
            setLoginFlow('verifySetupOTP');
            setShowMethodDialog(false);
            setShowOtpDialog(true);
            toast.info(`Verification code sent to your ${method === 'EMAIL' ? 'email' : 'WhatsApp'}`);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to select 2FA method';
            setMethodError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setDialogLoading(false);
        }
    };

    // =========================================================================
    // STEP 3B: Verify OTP and Complete 2FA Setup
    // =========================================================================
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleVerifySetupOTP = async (code: string, _useRecoveryCode: boolean) => {
        try {
            setDialogLoading(true);
            setOtpError(null);

            if (!sessionToken) {
                throw new Error('Session token not found');
            }

            // Prepare complete-login data
            const completeData = {
                sessionToken,
                code,
            };

            // Encrypt request
            const encryptedRequest = await hybridEncryptJSON(completeData);

            // Call complete-login API
            const response = await authService.setup2FACompleteLogin(encryptedRequest);

            // Process data response
            const dataResponse = typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data);

            const result = await process2FASetupCompleteResponse(dataResponse);

            if (!result.success) {
                throw new Error(result.error || 'Failed to complete 2FA setup');
            }

            // Success - 2FA is now enabled and user is logged in
            setShowOtpDialog(false);
            toast.success("2FA enabled successfully! Welcome!");
            setTimeout(() => {
                reset();
                window.location.href = '/dashboard';
            }, 1000);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to complete 2FA setup';
            setOtpError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setDialogLoading(false);
        }
    };

    // Determine which verify handler to use based on flow
    const getOtpVerifyHandler = () => {
        if (loginFlow === 'requires2FA') {
            return handleVerify2FA;
        }
        return handleVerifySetupOTP;
    };

    return (
        <>
            {/* 2FA Method Selection Dialog (for users without 2FA) */}
            <TwoFactorMethodDialog
                open={showMethodDialog}
                onOpenChange={setShowMethodDialog}
                onSelectMethod={handleSelectMethod}
                isLoading={dialogLoading}
                error={methodError}
            />

            {/* OTP Verification Dialog */}
            {twoFactorMethod && (
                <OTPVerificationDialog
                    open={showOtpDialog}
                    onOpenChange={setShowOtpDialog}
                    onVerify={getOtpVerifyHandler()}
                    method={twoFactorMethod}
                    isLoading={dialogLoading}
                    error={otpError}
                />
            )}

            {status === "authenticated" ? (
                <div className="text-center flex flex-col items-center justify-center">
                    <LoaderCircle className="animate-spin mb-4" />
                    <p className="text-gray-600">Redirecting to dashboard...</p>
                </div>
            ) : status === "loading" || !mounted ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            ) : !window?.grecaptcha ? (
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">reCAPTCHA not loaded</h2>
                    <p className="text-gray-600">Please refresh this page</p>
                    <button onClick={() => window.location.reload()} className="text-white bg-sky-400 rounded-xl hover:bg-sky-500 mt-4 px-3 py-1 text-sm cursor-pointer">Refresh</button>
                </div>
            ) : encryptionLoading ? (
                <div className="flex w-full max-w-md mx-auto items-center justify-center">
                    <LoaderCircle className="animate-spin mr-2" /> Loading encryption...
                </div>
            ) : encryptionError ? (
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Encryption Error</h2>
                    <p className="text-gray-600">{encryptionError}</p>
                    <button onClick={() => window.location.reload()} className="text-white bg-sky-400 rounded-xl hover:bg-sky-500 mt-4 px-3 py-1 text-sm cursor-pointer">Refresh</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-md mx-auto">
                    <Button type="button" variant="outline" className="w-full flex items-center gap-2 justify-center">
                        <span className="text-red-500 text-lg">G</span> Sign in with google
                    </Button>
                    <Button type="button" variant="outline" className="w-full flex items-center gap-2 justify-center">
                        <span className="text-blue-600 text-lg">f</span> Sign in with facebook
                    </Button>
                    <div className="text-center text-xs text-muted-foreground my-2">or use email</div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="email">EMAIL ADDRESS</Label>
                        <Input id="email" type="email" placeholder="name@example.com" {...register("email")} required autoComplete="email" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="password">PASSWORD</Label>
                        <div className="flex relative items-center">
                            <Input id="password" type={viewtypepass} placeholder="Password" {...register("password")} required autoComplete="current-password" />
                            {viewtypepass === 'text' ? <VscEye onClick={() => viewtypepass === 'text' ? setViewtypepass('password') : setViewtypepass('text')} size={20} className="cursor-pointer absolute right-3 text-zinc-300 transition-colors hover:text-zinc-500" /> :
                                <VscEyeClosed onClick={() => viewtypepass === 'text' ? setViewtypepass('password') : setViewtypepass('text')} size={20} className="cursor-pointer absolute right-3 text-zinc-300 transition-colors hover:text-zinc-500" />}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox id="remember" {...register("remember")} />
                            <Label htmlFor="remember" className="text-xs">Remember me</Label>
                        </div>
                        <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot Password?</Link>
                    </div>
                    <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                    </Button>
                    <Link href="/signup" className="text-center text-xs text-blue-600 hover:underline mt-2">Create an account</Link>
                </form>
            )}
        </>
    );
}
