"use server"

import { signIn } from "@/auth";



interface Payload {
    email: string;
    password: string;
    token: string;
    redirect: boolean;
}
export async function authenticate(formData: Payload) {
    try {
        const { email, password, token, redirect } = formData;
        await signIn('credentials', {
            email,
            password,
            token,
            redirect
        });
        return { success: true, error: false, message: 'login successful' };

    } catch (err) {
        if (err instanceof Error) {
            console.error('Authentication error:', err.message);
            return {
                success: false,
                error: true,
                message: err.message
            }
        }
        return {
            success: false,
            error: true,
            message: 'An unexpected error occurred'
        }
    }
}