'use server'

import { auth } from "@/auth";
import { decryptData } from "@/actions/crypto.action";

/**
 * SECURE SERVER-SIDE SESSION DATA
 *
 * Interface for decrypted session data containing sensitive tokens.
 * This data is NEVER exposed to client.
 */
interface DecryptedSessionData {
    user: {
        publicId: string;
        name: string;
        email: string;
        role: string;
        securityLevel?: string;
        twoFactorEnabled?: boolean;
    };
    accessToken: string;
    refreshToken?: string;
    refreshTokens?: string; // Support both naming conventions
}

/**
 * Get decrypted session data with access tokens
 *
 * SECURITY: This function can ONLY be called from server-side code
 * - Server Components
 * - Server Actions
 * - API Routes
 *
 * NEVER call this from client components!
 *
 * @returns Decrypted session data including access tokens
 * @throws Error if session is invalid or decryption fails
 */
export async function getServerSession(): Promise<DecryptedSessionData | null> {
    try {
        // Get NextAuth session (server-side only)
        const session = await auth();

        if (!session?.user?.key) {
            return null;
        }

        // Decrypt the encrypted session data
        const decryptedString = await decryptData(session.user.key);
        const decryptedData: DecryptedSessionData = JSON.parse(decryptedString);

        // Validate structure
        if (!decryptedData?.user || !decryptedData?.accessToken) {
            throw new Error('Invalid session data structure');
        }

        return decryptedData;

    } catch (error) {
        console.error('Failed to get server session:', error);
        return null;
    }
}

/**
 * Get only the access token from session
 *
 * Convenience function for API calls that only need the token
 *
 * @returns Access token or null
 */
export async function getAccessToken(): Promise<string | null> {
    const sessionData = await getServerSession();
    return sessionData?.accessToken || null;
}

/**
 * Get only the refresh token from session
 *
 * @returns Refresh token or null
 */
export async function getRefreshToken(): Promise<string | null> {
    const sessionData = await getServerSession();
    return sessionData?.refreshToken || sessionData?.refreshTokens || null;
}

/**
 * Get user info from session (without tokens)
 *
 * This is safe to use when you only need user information
 *
 * @returns User info or null
 */
export async function getSessionUser() {
    const sessionData = await getServerSession();
    return sessionData?.user || null;
}

/**
 * Example usage in Server Component:
 *
 * ```typescript
 * import { getServerSession, getAccessToken } from '@/lib/auth.user.secure';
 *
 * export default async function DashboardPage() {
 *   const sessionData = await getServerSession();
 *
 *   if (!sessionData) {
 *     redirect('/login');
 *   }
 *
 *   // Use accessToken for API calls
 *   const response = await fetch('http://api.example.com/data', {
 *     headers: {
 *       'Authorization': `Bearer ${sessionData.accessToken}`
 *     }
 *   });
 *
 *   return <div>Welcome {sessionData.user.name}</div>
 * }
 * ```
 *
 * Example usage in Server Action:
 *
 * ```typescript
 * 'use server'
 * import { getAccessToken } from '@/lib/auth.user.secure';
 *
 * export async function updateProfile(formData: FormData) {
 *   const accessToken = await getAccessToken();
 *
 *   if (!accessToken) {
 *     throw new Error('Unauthorized');
 *   }
 *
 *   const response = await fetch('http://api.example.com/profile', {
 *     method: 'PUT',
 *     headers: {
 *       'Authorization': `Bearer ${accessToken}`,
 *       'Content-Type': 'application/json'
 *     },
 *     body: JSON.stringify({ name: formData.get('name') })
 *   });
 *
 *   return response.json();
 * }
 * ```
 */
