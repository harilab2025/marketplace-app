"use client";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";

// Add grecaptcha to the Window interface
declare global {
    interface Window {
        grecaptcha: {
            execute(siteKey: string, options: { action: string }): Promise<string>;
            ready(cb: () => void): void;
        };
    }
}
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import Link from "next/link";
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../store/signupSlice';
import { AppDispatch, RootState } from "@/store";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { VscEye, VscEyeClosed } from "react-icons/vsc";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
interface SignupFormInputs {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
    whatsappNumber: string;
    recaptchaToken: string;
}


export default function SignupForm() {
    const dispatch = useDispatch<AppDispatch>();
    type SignupError = string | { email?: string; whatsappNumber?: string;[key: string]: string | undefined };
    const { loading, error, success } = useSelector((state: RootState) => state.signup) as {
        loading: boolean;
        error: SignupError | null;
        success: boolean;
    };
    const router = useRouter();
    const [viewtypepass, setViewtypepass] = useState('password');
    const {
        register,
        handleSubmit,
        setError,
        watch,
        setValue,
        formState: { errors },
        reset
    } = useForm<SignupFormInputs>({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            whatsappNumber: "",
            terms: false
        }
    });
    const termsValue = watch("terms");

    // Custom validation function
    const validateForm = (data: SignupFormInputs) => {
        let isValid = true;

        // Validate name
        if (!data.name || data.name.trim() === "") {
            setError("name", { message: "Name is required" });
            isValid = false;
        }

        // Validate email
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            setError("email", { message: "Please enter a valid email address" });
            isValid = false;
        }

        // Validate password
        if (!data.password || data.password.length < 10) {
            setError("password", { message: "Password must be at least 10 characters" });
            isValid = false;
        } else if (!/[A-Z]/.test(data.password)) {
            setError("password", { message: "Password must contain at least one uppercase letter" });
            isValid = false;
        } else if (!/[0-9]/.test(data.password)) {
            setError("password", { message: "Password must contain at least one number" });
            isValid = false;
        }

        // Validate confirm password
        if (data.password !== data.confirmPassword) {
            setError("confirmPassword", { message: "Passwords don't match" });
            isValid = false;
        }

        // Validate WhatsApp number
        if (!data.whatsappNumber || data.whatsappNumber.trim() === "") {
            setError("whatsappNumber", { message: "WhatsApp number is required" });
            isValid = false;
        } else if (!/^[0-9+]+$/.test(data.whatsappNumber)) {
            setError("whatsappNumber", { message: "Please enter a valid phone number" });
            isValid = false;
        }

        // Validate terms
        if (!data.terms) {
            setError("terms", { message: "You must accept the terms and privacy policy" });
            isValid = false;
        }

        return isValid;
    };


    useEffect(() => {
        // Handle API errors
        if (error) {
            if (typeof error === 'string') {
                toast.error(error);
            } else if (error.email) {
                setError('email', { message: error.email });
            } else if (error.whatsappNumber) {
                setError('whatsappNumber', { message: error.whatsappNumber });
            } else {
                toast.error(error.message || 'An unexpected error occurred. Please try again.');
            }
        }

        if (success) {
            toast.success('Signup successful! Redirecting to login page...');
            reset();
            const timer = setTimeout(() => {
                router.push('/');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [error, success, router, reset, setError]);

    const onSubmit = async (data: SignupFormInputs) => {
        // Validate form data
        if (!validateForm(data)) {
            return;
        }

        try {
            if (window.grecaptcha) {
                const token = await window.grecaptcha.execute(SITE_KEY, { action: 'signup' });
                dispatch(signupUser({ ...data, recaptchaToken: token }));
            } else {
                dispatch(signupUser({ ...data, recaptchaToken: '' }));
            }
        } catch {
            toast.error('Failed to verify reCAPTCHA. Please try again.');
        }
    };
    const handleTermsChange = (checked: boolean) => {
        setValue("terms", checked, {
            shouldValidate: true,  // Memicu validasi setelah perubahan
            shouldDirty: true,     // Menandai field sebagai "dirty" (sudah diubah)
            shouldTouch: true      // Menandai field sebagai "touched" (sudah diinteraksi)
        });
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-md mx-auto">
            <div className="flex flex-col gap-1">
                <Label htmlFor="name">NAME</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Name"
                    {...register("name")}
                    autoComplete="name"
                    className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="email">EMAIL ADDRESS</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    autoComplete="email"
                    className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="whatsappNumber">WHATSAPP NUMBER</Label>
                <Input
                    id="whatsappNumber"
                    type="text"
                    placeholder="62812345678"
                    {...register("whatsappNumber")}
                    autoComplete="tel"
                    className={errors.whatsappNumber ? "border-red-500" : ""}
                />
                {errors.whatsappNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.whatsappNumber.message}</p>
                )}
            </div>

            <div className="flex gap-2 items-center">
                <div className="flex flex-col gap-1 w-1/2">
                    <Label htmlFor="password">PASSWORD</Label>
                    <Input
                        id="password"
                        type={viewtypepass}
                        placeholder="Password"
                        {...register("password")}
                        autoComplete="new-password"
                        className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                    )}
                </div>
                <div className="flex flex-col gap-1 w-1/2">
                    <Label htmlFor="confirmPassword">CONFIRM PASSWORD</Label>
                    <Input
                        id="confirmPassword"
                        type={viewtypepass}
                        placeholder="Confirm Password"
                        {...register("confirmPassword")}
                        autoComplete="new-password"
                        className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                    )}
                </div>
                {viewtypepass === 'text' ? <VscEye onClick={() => viewtypepass === 'text' ? setViewtypepass('password') : setViewtypepass('text')} size={20} className="cursor-pointer mt-5 text-zinc-300 transition-colors hover:text-zinc-500" /> :
                    <VscEyeClosed onClick={() => viewtypepass === 'text' ? setViewtypepass('password') : setViewtypepass('text')} size={20} className="cursor-pointer mt-5 text-zinc-300 transition-colors hover:text-zinc-500" />}
            </div>

            <div className="flex items-center gap-2">
                <div className="pt-1">
                    <Checkbox
                        id="terms"
                        checked={termsValue}
                        onCheckedChange={handleTermsChange}
                        className={errors.terms ? "border-red-500" : ""}
                        {...register("terms", {
                            onChange: () => {

                            }
                        })}
                    />
                </div>
                <div>
                    <Label htmlFor="terms" className="text-xs">I accept the <Link href="#" className="text-blue-600 underline">terms and privacy policy</Link></Label>
                    {errors.terms && (
                        <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>
                    )}
                </div>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? "Signing up..." : "Sign up"}
            </Button>

            <Link href="/" className="text-center text-xs text-blue-600 hover:underline mt-2">
                Sign in to an existing account
            </Link>
        </form>
    );
}