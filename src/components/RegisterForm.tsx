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
import { Loader2 } from "lucide-react";
import { useEncryption } from "@/contexts/EncryptionContext";
import { authService, RegisterRequest } from "@/services/auth.service";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

interface RegisterFormInputs {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    whatsappNumber?: string;
}

export default function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [viewPassword, setViewPassword] = useState('password');
    const [viewConfirmPassword, setViewConfirmPassword] = useState('password');
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>();
    const { hybridEncryptJSON, isLoading: encryptionLoading, error: encryptionError } = useEncryption();


    const onSubmit = async (dataForm: RegisterFormInputs) => {
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

            if (!window.grecaptcha) {
                toast.error("reCAPTCHA is not loaded. Please try again later.");
                setIsLoading(false);
                return;
            }

            // Validate passwords match
            if (dataForm.password !== dataForm.confirmPassword) {
                toast.error("Passwords do not match");
                setIsLoading(false);
                return;
            }

            // Get reCAPTCHA token
            const token = await window.grecaptcha.execute(SITE_KEY, { action: 'register' });

            // Prepare registration data
            const registerData: RegisterRequest = {
                name: dataForm.name,
                email: dataForm.email,
                password: dataForm.password,
                whatsappNumber: dataForm.whatsappNumber,
                recaptchaToken: token,
            };

            // Encrypt request with RSA hybrid
            const encryptedRequest = await hybridEncryptJSON(registerData);

            // Call register API
            const response = await authService.register(encryptedRequest);

            // Success - redirect to email verification page
            if (response.data.user) {
                toast.success("Registration successful! Please check your email for verification code.");

                // Redirect to email verification page with publicId and email
                setTimeout(() => {
                    router.push(`/verify-email?publicId=${response.data.user.publicId}&email=${encodeURIComponent(dataForm.email)}`);
                }, 1500);
            } else {
                throw new Error('Invalid registration response');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
            toast.error(errorMessage);
            setIsLoading(false);
        }
    };

    if (typeof window === 'undefined') {
        return (
            <div className="flex w-full max-w-md mx-auto">
                <Loader2 className="animate-spin mr-2" /> Loading...
            </div>
        );
    }

    if (!window?.grecaptcha) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">reCAPTCHA not loaded</h2>
                <p className="text-gray-600">Please refresh this page</p>
                <button onClick={() => window.location.reload()} className="text-white bg-sky-400 rounded-xl hover:bg-sky-500 mt-4 px-3 py-1 text-sm cursor-pointer">Refresh</button>
            </div>
        );
    }

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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-md mx-auto">
            <div className="flex flex-col gap-1">
                <Label htmlFor="name">FULL NAME</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    {...register("name", { required: true })}
                    required
                    autoComplete="name"
                />
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
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="whatsapp">WHATSAPP NUMBER (Optional)</Label>
                <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="628123456789"
                    {...register("whatsappNumber")}
                    autoComplete="tel"
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="password">PASSWORD</Label>
                <div className="flex relative items-center">
                    <Input
                        id="password"
                        type={viewPassword}
                        placeholder="Minimum 10 characters"
                        {...register("password", { required: true, minLength: 10 })}
                        required
                        autoComplete="new-password"
                    />
                    {viewPassword === 'text' ?
                        <VscEye onClick={() => setViewPassword('password')} size={20} className="cursor-pointer absolute right-3 text-zinc-300 transition-colors hover:text-zinc-500" /> :
                        <VscEyeClosed onClick={() => setViewPassword('text')} size={20} className="cursor-pointer absolute right-3 text-zinc-300 transition-colors hover:text-zinc-500" />
                    }
                </div>
                {errors.password?.type === 'minLength' && (
                    <p className="text-xs text-red-500">Password must be at least 10 characters</p>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="confirmPassword">CONFIRM PASSWORD</Label>
                <div className="flex relative items-center">
                    <Input
                        id="confirmPassword"
                        type={viewConfirmPassword}
                        placeholder="Re-enter password"
                        {...register("confirmPassword", { required: true })}
                        required
                        autoComplete="new-password"
                    />
                    {viewConfirmPassword === 'text' ?
                        <VscEye onClick={() => setViewConfirmPassword('password')} size={20} className="cursor-pointer absolute right-3 text-zinc-300 transition-colors hover:text-zinc-500" /> :
                        <VscEyeClosed onClick={() => setViewConfirmPassword('text')} size={20} className="cursor-pointer absolute right-3 text-zinc-300 transition-colors hover:text-zinc-500" />
                    }
                </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </Button>

            <p className="text-center text-xs text-gray-600">
                Already have an account?{' '}
                <Link href="/" className="text-blue-600 hover:underline">Sign in</Link>
            </p>
        </form>
    );
}
