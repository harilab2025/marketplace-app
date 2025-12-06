"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import Link from "next/link";

interface ForgotFormInputs {
    email: string;
}

export default function ForgotForm() {
    const { register, handleSubmit } = useForm<ForgotFormInputs>();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data: ForgotFormInputs) => {
        console.log(data);

        setLoading(true);
        // TODO: handle Forgot logic
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-md mx-auto">
            <div className="flex flex-col gap-1">
                <Label htmlFor="email">EMAIL ADDRESS</Label>
                <Input id="email" type="email" placeholder="name@example.com" {...register("email")} required autoComplete="email" />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
                Send
            </Button>
            <Link href="/" className="text-center text-xs text-blue-600 hover:underline mt-2">Sign in to an existing account</Link>
        </form>
    );
} 