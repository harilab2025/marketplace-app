'use server'

import { signIn } from "@/auth";
/**
 * SECURE SERVER-SIDE LOGIN HANDLER
 *
 * This server action handles the login flow securely:
 * 1. Receives encrypted response from backend API
 * 2. Decrypts on server-side to extract user info
 * 3. Creates NextAuth session with user info only (tokens are in HTTP-only cookies)
 * 4. Returns metadata to client for flow control
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface UserInfo {
    publicId: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    securityLevel?: string;
    twoFactorEnabled?: boolean;
}

interface LoginFlowResponse {
    success: boolean;
    // Flow A: 2FA required (user already has 2FA enabled)
    requires2FA?: boolean;
    method?: 'EMAIL' | 'WHATSAPP';
    sessionToken?: string;
    // Flow B: 2FA setup required (user needs to setup 2FA)
    requires2FASetup?: boolean;
    // Error
    error?: string;
}

interface Verify2FAFlowResponse {
    success: boolean;
    error?: string;
}

interface Setup2FASelectMethodResponse {
    success: boolean;
    method?: 'EMAIL' | 'WHATSAPP';
    error?: string;
}

interface Setup2FACompleteResponse {
    success: boolean;
    error?: string;
}

// ============================================================================
// LOGIN RESPONSE HANDLER
// ============================================================================

/**
 * Process encrypted login response from backend
 * Handles 3 possible flows:
 * A) requires2FA: true - User has 2FA, needs to verify OTP
 * B) requires2FASetup: true - User needs to setup 2FA first
 * C) Login success - User info returned, create session
 *
 * @param encryptedResponse - Encrypted response from backend login API
 * @returns Metadata for client flow control
 */
export async function processLoginResponse(
    ResponseLogin: string
): Promise<LoginFlowResponse> {
    try {
        const ResponseData = JSON.parse(ResponseLogin);

        // Flow A: 2FA verification required (user already has 2FA)
        if (ResponseData?.requires2FA) {
            return {
                success: true,
                requires2FA: true,
                method: ResponseData.method || 'EMAIL',
                sessionToken: ResponseData.sessionToken,
            };
        }

        // Flow B: 2FA setup required (user doesn't have 2FA yet)
        if (ResponseData?.requires2FASetup) {
            return {
                success: true,
                requires2FASetup: true,
                sessionToken: ResponseData.sessionToken,
            };
        }

        // Flow C: Login success - create NextAuth session
        if (!ResponseData?.user) {
            return {
                success: false,
                error: 'Invalid response from server',
            };
        }
        // Create NextAuth session with user info only
        const userInfo: UserInfo = {
            publicId: ResponseData.user.publicId,
            name: ResponseData.user.name,
            email: ResponseData.user.email,
            role: ResponseData.user.role,
            avatar: ResponseData.user.avatar,
            securityLevel: ResponseData.user.securityLevel,
            twoFactorEnabled: ResponseData.user.twoFactorEnabled,
        };

        const result = await signIn('credentials', {
            userInfo: JSON.stringify(userInfo),
            redirect: false,
        });

        if (result?.error) {
            return {
                success: false,
                error: result.error,
            };
        }

        return {
            success: true,
        };

    } catch (error) {
        console.error('Login processing error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Login processing failed',
        };
    }
}

// ============================================================================
// 2FA VERIFICATION HANDLER (for users WITH 2FA already enabled)
// ============================================================================

/**
 * Process encrypted 2FA verification response from backend
 * Backend sets HTTP-only cookies on success
 *
 * @param encryptedResponse - Encrypted response from backend 2FA verify API
 * @returns Success status
 */
export async function process2FAVerificationResponse(
    dataResponse: string
): Promise<Verify2FAFlowResponse> {
    try {
        const data = JSON.parse(dataResponse);

        if (!data?.user) {
            return {
                success: false,
                error: 'Invalid verification response',
            };
        }

        // Create NextAuth session with user info
        const userInfo: UserInfo = {
            publicId: data.user.publicId,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            avatar: data.user.avatar,
            securityLevel: data.user.securityLevel,
            twoFactorEnabled: data.user.twoFactorEnabled,
        };

        const result = await signIn('credentials', {
            userInfo: JSON.stringify(userInfo),
            redirect: false,
        });

        if (result?.error) {
            return {
                success: false,
                error: result.error,
            };
        }

        return {
            success: true,
        };

    } catch (error) {
        console.error('2FA verification processing error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '2FA verification failed',
        };
    }
}

// ============================================================================
// 2FA SETUP HANDLERS (for users WITHOUT 2FA)
// ============================================================================

/**
 * Process encrypted response from select-method API
 * This is Step 1 of 2FA setup during login
 *
 * @param encryptedResponse - Encrypted response from backend
 * @returns Success status and selected method
 */
export async function process2FASelectMethodResponse(
    dataResponse: string
): Promise<Setup2FASelectMethodResponse> {
    try {
        const responseData = JSON.parse(dataResponse);

        if (!responseData?.success) {
            return {
                success: false,
                error: responseData?.message || 'Failed to select 2FA method',
            };
        }

        return {
            success: true,
            method: responseData.method,
        };

    } catch (error) {
        console.error('2FA select method processing error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process 2FA method selection',
        };
    }
}

/**
 * Process encrypted response from complete-login API
 * This is Step 2 of 2FA setup during login
 * Backend sets HTTP-only cookies on success
 *
 * @param encryptedResponse - Encrypted response from backend
 * @returns Success status
 */
export async function process2FASetupCompleteResponse(
    dataResponse: string
): Promise<Setup2FACompleteResponse> {
    try {
        const data = JSON.parse(dataResponse);

        if (!data?.user) {
            return {
                success: false,
                error: 'Invalid setup complete response',
            };
        }

        // Create NextAuth session with user info
        const userInfo: UserInfo = {
            publicId: data.user.publicId,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            avatar: data.user.avatar,
            securityLevel: data.user.securityLevel,
            twoFactorEnabled: data.twoFactorEnabled, // 2FA is now enabled
        };

        const result = await signIn('credentials', {
            userInfo: JSON.stringify(userInfo),
            redirect: false,
        });

        if (result?.error) {
            return {
                success: false,
                error: result.error,
            };
        }

        return {
            success: true,
        };

    } catch (error) {
        console.error('2FA setup complete processing error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to complete 2FA setup',
        };
    }
}
