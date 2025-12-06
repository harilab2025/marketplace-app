"use client";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import Link from "next/link";
import { VscEye } from "react-icons/vsc";
import { VscEyeClosed } from "react-icons/vsc";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authenticate } from "@/actions/auth.action";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { userData } from "@/lib/auth.user";
import { Loader2 } from "lucide-react";
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
interface LoginFormInputs {
    email: string;
    password: string;
    remember: boolean;
}
interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: string;
    accessToken: string;
    refreshTokens: string;
}

export default function LoginForm() {
    const { status } = useSession();
    const [session, setSession] = useState<SessionUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, reset } = useForm<LoginFormInputs>();
    const [viewtypepass, setViewtypepass] = useState('password');
    useEffect(() => {
        async function getUser() {
            try {
                const user = await userData();
                setSession(user);
            } catch {
                toast.error('Failed to fetch user data. Please try again.');
            }
        }
        getUser();
    }, []);
    const onSubmit = async (dataForm: LoginFormInputs) => {
        try {
            setIsLoading(true);
            if (window.grecaptcha) {
                const token = await window.grecaptcha.execute(SITE_KEY, { action: 'login' });
                const result = await authenticate({
                    ...dataForm,
                    token: token,
                    redirect: false // set false untuk handle redirect manual
                })
                if (result?.success) {
                    toast.success(result?.message || "Login successful!");
                    setTimeout(() => {
                        reset();
                        window.location.href = '/';
                    }, 2000);
                } else {
                    toast.error(result?.message || "Login failed. Please try again.");
                    setIsLoading(false);
                }
            } else {
                toast.error("reCAPTCHA is not loaded. Please try again later.");
                setIsLoading(false);
            }
        } catch {
            toast.error('Failed to verify reCAPTCHA. Please try again.');
            setIsLoading(false);
        }
    };
    const handleLogout = async () => {
        try {
            await signOut({
                redirect: false,
                callbackUrl: '/'
            });
            setSession(null);
            // Optional: Clear additional client-side data
            localStorage.clear();
            sessionStorage.clear();

            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (status === "authenticated" ?
        <div className="text-center flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-4">Welcome back, {session?.name || "User"}!</h2>
            <p className="text-gray-600">You are already logged in.</p>
            <Link href="/dashboard" className="text-blue-600 hover:underline mt-4">Go to Dashboard</Link>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button className="text-white bg-red-400 rounded-xl hover:bg-red-500 mt-4 px-3 py-1 text-sm cursor-pointer">Logout</button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to log out from your account?</AlertDialogTitle>
                        <AlertDialogDescription></AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} >Logout</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div> : status === "loading" ?
            <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div> :
            !window.grecaptcha ?
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">reCAPTCHA not loaded</h2>
                    <p className="text-gray-600">Please refresh this page </p>
                    <button onClick={() => window.location.reload()} className="text-white bg-sky-400 rounded-xl hover:bg-sky-500 mt-4 px-3 py-1 text-sm cursor-pointer">Refresh</button>
                </div> :
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
                        <Link href="/forgot" className="text-xs text-blue-600 hover:underline">Forgot Password?</Link>
                    </div>
                    <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                    </Button>
                    <Link href="/signup" className="text-center text-xs text-blue-600 hover:underline mt-2">Create an account</Link>
                </form>
    );
} 