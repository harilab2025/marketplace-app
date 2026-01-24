'use server';

import { auth } from "@/auth";
import { Session } from "next-auth";

/**
 * Get user data from NextAuth session
 *
 * SIMPLIFIED: No token decryption needed
 * Tokens are stored in HTTP-only cookies by backend
 * This function only returns user info from session
 */
export async function userData() {
    try {
        const session: Session | null = await auth();

        if (session?.user) {
            return {
                id: session.user.id,
                publicId: session.user.publicId,
                name: session.user.name,
                email: session.user.email,
                role: session.user.role,
                avatar: session.user.avatar,
                securityLevel: session.user.securityLevel,
                twoFactorEnabled: session.user.twoFactorEnabled,
            };
        }

        return null;
    } catch (error) {
        console.error('Session error:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await userData();
    return user !== null;
}

/**
 * Get user role
 */
export async function getUserRole(): Promise<string | null> {
    const user = await userData();
    return user?.role || null;
}
