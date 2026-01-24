/**
 * Token Manager - DEPRECATED
 *
 * This file is no longer used.
 * Tokens are now stored in HTTP-only cookies by the backend.
 *
 * All authenticated requests should use:
 * - axiosInstance (from @/lib/axiosInstance) which has withCredentials: true
 * - Cookies are sent automatically by the browser
 *
 * For user info, use:
 * - userData() from @/lib/auth.user
 * - useSession() from next-auth/react
 */

// Keeping minimal export to avoid breaking imports during transition
// These functions do nothing and should not be used

class TokenManager {
    async getAccessToken(): Promise<string | null> {
        console.warn('tokenManager.getAccessToken() is deprecated. Tokens are in HTTP-only cookies.');
        return null;
    }

    async getRefreshToken(): Promise<string | null> {
        console.warn('tokenManager.getRefreshToken() is deprecated. Tokens are in HTTP-only cookies.');
        return null;
    }

    async getTokens(): Promise<null> {
        console.warn('tokenManager.getTokens() is deprecated. Tokens are in HTTP-only cookies.');
        return null;
    }

    setTokens(): void {
        console.warn('tokenManager.setTokens() is deprecated. Tokens are in HTTP-only cookies.');
    }

    clearTokens(): void {
        console.warn('tokenManager.clearTokens() is deprecated. Tokens are in HTTP-only cookies.');
    }

    async hasTokens(): Promise<boolean> {
        console.warn('tokenManager.hasTokens() is deprecated. Tokens are in HTTP-only cookies.');
        return false;
    }
}

const tokenManager = new TokenManager();
export { tokenManager };
export default TokenManager;
