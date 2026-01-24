'use server';

import { auth } from "@/auth";
import { encryptData, decryptData } from "./crypto.action";

/**
 * Update NextAuth session with new tokens (after refresh)
 * This is a server action that re-encrypts user data with new tokens
 *
 * @param newAccessToken - New access token from refresh
 * @param newRefreshToken - New refresh token (optional - for token rotation)
 * @returns Encrypted session data to be used with NextAuth update()
 */
export async function prepareSessionUpdate(
    newAccessToken: string,
    newRefreshToken?: string
): Promise<string> {
    try {
        // Get current session
        const session = await auth();
        if (!session || !session.user?.publicId) {
            throw new Error('No active session found');
        }

        // Decrypt current session data
        const currentDataString = await decryptData(session.user.publicId as string);
        const currentData = JSON.parse(currentDataString);

        // Update tokens
        const updatedData = {
            user: currentData.user,
            accessToken: newAccessToken,
            refreshTokens: newRefreshToken || currentData.refreshTokens,
        };

        // Re-encrypt with new tokens
        const encryptedData = await encryptData(JSON.stringify(updatedData));

        return encryptedData;
    } catch (error) {
        console.error('Failed to prepare session update:', error);
        throw new Error('Session update failed');
    }
}

/**
 * Get current user data from session
 * @returns User data with tokens or null
 */
export async function getCurrentSession() {
    try {
        const session = await auth();
        if (!session || !session.user?.publicId) {
            return null;
        }

        const dataString = await decryptData(session.user.publicId as string);
        const data = JSON.parse(dataString);

        return {
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshTokens,
        };
    } catch (error) {
        console.error('Failed to get current session:', error);
        return null;
    }
}
