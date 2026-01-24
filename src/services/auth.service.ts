import axios from 'axios';
import { RSAHybridEncrypted } from '@/lib/clientEncryption';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Axios instance for authenticated requests (after login)
// Uses withCredentials to send HTTP-only cookies automatically
const authAxios = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // Send cookies with requests
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface LoginRequest {
    email: string;
    password: string;
    token: string; // reCAPTCHA token
}

export interface LoginResponseData {
    // Success login (user sudah punya 2FA)
    user?: {
        publicId: string;
        name: string;
        email: string;
        role: string;
        securityLevel?: string;
        twoFactorEnabled?: boolean;
    };
    // 2FA required (user sudah setup 2FA)
    requires2FA?: boolean;
    sessionToken?: string;
    method?: 'EMAIL' | 'WHATSAPP';
    message?: string;
    // 2FA setup required (user belum setup 2FA)
    requires2FASetup?: boolean;
}

export interface LoginResponse {
    status: string;
    message: string;
    data: string | LoginResponseData; // Can be encrypted string or plain object
}

export interface Verify2FARequest {
    sessionToken: string;
    code: string;
    useRecoveryCode?: boolean;
}

export interface Verify2FAResponseData {
    user: {
        publicId: string;
        name: string;
        email: string;
        role: string;
        securityLevel: string;
        twoFactorEnabled: boolean;
    };
}

export interface Verify2FAResponse {
    status: string;
    message: string;
    data: string | Verify2FAResponseData; // Can be encrypted string or plain object
}

// ============================================================================
// 2FA SETUP DURING LOGIN (for users without 2FA)
// ============================================================================

export interface Setup2FASelectMethodRequest {
    sessionToken: string;
    method: 'EMAIL' | 'WHATSAPP';
}

export interface Setup2FASelectMethodResponse {
    status: string;
    message: string;
    data: string | {
        success: boolean;
        message: string;
        method: 'EMAIL' | 'WHATSAPP';
    };
}

export interface Setup2FACompleteLoginRequest {
    sessionToken: string;
    code: string;
}

export interface Setup2FACompleteLoginResponseData {
    user: {
        publicId: string;
        name: string;
        email: string;
        role: string;
        securityLevel?: string;
        twoFactorEnabled: boolean;
    };
    twoFactorEnabled: boolean;
    method: 'EMAIL' | 'WHATSAPP';
}

export interface Setup2FACompleteLoginResponse {
    status: string;
    message: string;
    data: string | Setup2FACompleteLoginResponseData;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    whatsappNumber?: string;
    recaptchaToken: string;
}

export interface RegisterResponse {
    status: string;
    message: string;
    data: {
        user: {
            publicId: string;
            name: string;
            email: string;
            role: string;
            emailVerified: boolean;
            phoneVerified: boolean;
            twoFactorEnabled: boolean;
            securityLevel: string;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    };
}

export interface VerifyEmailRequest {
    publicId: string;
    code: string;
}

export interface VerifyEmailResponse {
    status: string;
    message: string;
    data?: unknown; // Backend may return encrypted data
}

export interface ResendVerificationEmailRequest {
    publicId: string;
}

export interface ResendVerificationEmailResponse {
    status: string;
    message: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    status: string;
    message: string;
    data: {
        resetToken: string;
        requires2FA: boolean;
    };
}

export interface ResetPasswordRequest {
    resetToken: string;
    newPassword: string;
    otp: string;
    twoFactorCode?: string;
}

export interface Setup2FARequest {
    method: 'EMAIL' | 'WHATSAPP';
}

export interface Verify2FASetupRequest {
    code: string;
}

export interface Disable2FARequest {
    password: string;
}

export interface GenerateRecoveryCodesResponse {
    status: string;
    message: string;
    data: {
        codes: string[];
    };
}

export interface Get2FAStatusResponse {
    status: string;
    message: string;
    data: {
        twoFactorEnabled: boolean;
        twoFactorMethod: 'EMAIL' | 'WHATSAPP' | null;
        twoFactorSetupAt: string | null;
        securityLevel: string;
        recoveryCodesCount: number;
    };
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface ChangePasswordResponse {
    status: string;
    message: string;
}

// ============================================================================
// AUTH SERVICE CLASS
// ============================================================================

class AuthService {
    /**
     * Login user
     * NOTE: Request uses RSA hybrid encryption
     */
    async login(encryptedData: RSAHybridEncrypted): Promise<LoginResponse> {
        try {
            const response = await axios.post<LoginResponse>(
                `${API_URL}/auth/login`,
                encryptedData,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    error.message ||
                    'Login failed'
                );
            }
            throw error;
        }
    }

    /**
     * Verify 2FA code during login (for users WITH 2FA already enabled)
     * NOTE: Request uses RSA hybrid encryption
     * Backend sets HTTP-only cookies on success
     */
    async verify2FA(encryptedData: RSAHybridEncrypted): Promise<Verify2FAResponse> {
        try {
            const response = await axios.post<Verify2FAResponse>(
                `${API_URL}/auth/2fa/verify`,
                encryptedData,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                    withCredentials: true, // Receive HTTP-only cookies
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    error.message ||
                    '2FA verification failed'
                );
            }
            throw error;
        }
    }

    /**
     * Select 2FA method during login (for users WITHOUT 2FA)
     * Step 1: User selects EMAIL or WHATSAPP, OTP is sent
     * NOTE: Request uses RSA hybrid encryption
     */
    async setup2FASelectMethod(selectedData: Setup2FASelectMethodRequest): Promise<Setup2FASelectMethodResponse> {
        try {
            const response = await axios.post<Setup2FASelectMethodResponse>(
                `${API_URL}/auth/2fa/setup/select-method`,
                selectedData,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to select 2FA method'
                );
            }
            throw error;
        }
    }

    /**
     * Complete login with 2FA setup (for users WITHOUT 2FA)
     * Step 2: User verifies OTP, 2FA is enabled, login completes
     * NOTE: Request uses RSA hybrid encryption
     * Backend sets HTTP-only cookies on success
     */
    async setup2FACompleteLogin(encryptedData: RSAHybridEncrypted): Promise<Setup2FACompleteLoginResponse> {
        try {
            const response = await axios.post<Setup2FACompleteLoginResponse>(
                `${API_URL}/auth/2fa/setup/complete-login`,
                encryptedData,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                    withCredentials: true, // Receive HTTP-only cookies
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to complete 2FA setup'
                );
            }
            throw error;
        }
    }

    /**
     * Register new user
     * NOTE: Request uses RSA hybrid encryption
     */
    async register(encryptedData: RSAHybridEncrypted): Promise<RegisterResponse> {
        try {
            const response = await axios.post<RegisterResponse>(
                `${API_URL}/auth/register`,
                encryptedData,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    error.message ||
                    'Registration failed'
                );
            }
            throw error;
        }
    }

    /**
     * Logout user
     * Uses HTTP-only cookies for authentication
     */
    async logout(): Promise<void> {
        try {
            await authAxios.post('/auth/logout', {});
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    /**
     * Refresh access token
     * Uses HTTP-only cookies - backend handles token refresh via cookies
     */
    async refreshToken(): Promise<void> {
        try {
            await authAxios.post('/auth/refreshToken', {});
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Token refresh failed'
                );
            }
            throw error;
        }
    }

    /**
     * Verify email with OTP
     * NOTE: Request uses RSA hybrid encryption
     */
    async verifyEmail(encryptedData: RSAHybridEncrypted): Promise<VerifyEmailResponse> {
        try {
            const response = await axios.post<VerifyEmailResponse>(
                `${API_URL}/auth/verify-email`,
                encryptedData,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Email verification failed'
                );
            }
            throw error;
        }
    }

    /**
     * Resend email verification code
     * NOTE: Request uses RSA hybrid encryption
     */
    async resendVerificationEmail(encryptedData: RSAHybridEncrypted): Promise<ResendVerificationEmailResponse> {
        try {
            const response = await axios.post<ResendVerificationEmailResponse>(
                `${API_URL}/auth/resend-verification-email`,
                encryptedData,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to resend verification email'
                );
            }
            throw error;
        }
    }

    /**
     * Request password reset
     * NOTE: Request uses RSA hybrid encryption
     */
    async forgotPassword(encryptedData: RSAHybridEncrypted): Promise<ForgotPasswordResponse> {
        try {
            const response = await axios.post<ForgotPasswordResponse>(
                `${API_URL}/auth/password/forgot`,
                encryptedData,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to send reset code'
                );
            }
            throw error;
        }
    }

    /**
     * Reset password with OTP
     * NOTE: Request uses RSA hybrid encryption
     */
    async resetPassword(encryptedData: RSAHybridEncrypted): Promise<{ status: string; message: string }> {
        try {
            const response = await axios.post(
                `${API_URL}/auth/password/reset`,
                encryptedData,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Password reset failed'
                );
            }
            throw error;
        }
    }

    /**
     * Initiate 2FA setup
     * NOTE: Request uses RSA hybrid encryption
     */
    async initiate2FASetup(
        encryptedData: RSAHybridEncrypted,
        accessToken: string
    ): Promise<{ status: string; message: string; data: { method: string } }> {
        try {
            const response = await axios.post(
                `${API_URL}/auth/2fa/setup/initiate`,
                encryptedData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    '2FA setup initiation failed'
                );
            }
            throw error;
        }
    }

    /**
     * Verify 2FA setup with OTP
     * NOTE: Request uses RSA hybrid encryption
     */
    async verify2FASetup(
        encryptedData: RSAHybridEncrypted,
        accessToken: string
    ): Promise<{ status: string; message: string }> {
        try {
            const response = await axios.post(
                `${API_URL}/auth/2fa/setup/verify`,
                encryptedData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    '2FA setup verification failed'
                );
            }
            throw error;
        }
    }

    /**
     * Disable 2FA
     * NOTE: Request uses RSA hybrid encryption
     */
    async disable2FA(
        encryptedData: RSAHybridEncrypted,
        accessToken: string
    ): Promise<{ status: string; message: string }> {
        try {
            const response = await axios.post(
                `${API_URL}/auth/2fa/disable`,
                encryptedData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to disable 2FA'
                );
            }
            throw error;
        }
    }

    /**
     * Generate recovery codes
     */
    async generateRecoveryCodes(
        accessToken: string
    ): Promise<GenerateRecoveryCodesResponse> {
        try {
            const response = await axios.post<GenerateRecoveryCodesResponse>(
                `${API_URL}/auth/2fa/recovery/generate`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to generate recovery codes'
                );
            }
            throw error;
        }
    }

    /**
     * Get 2FA status
     */
    async get2FAStatus(
        accessToken: string
    ): Promise<Get2FAStatusResponse> {
        try {
            const response = await axios.get<Get2FAStatusResponse>(
                `${API_URL}/auth/2fa/status`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to get 2FA status'
                );
            }
            throw error;
        }
    }

    /**
     * Change password
     * NOTE: Request uses RSA hybrid encryption
     */
    async changePassword(
        accessToken: string,
        encryptedData: RSAHybridEncrypted
    ): Promise<ChangePasswordResponse> {
        try {
            const response = await axios.post<ChangePasswordResponse>(
                `${API_URL}/auth/password/change`,
                encryptedData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to change password'
                );
            }
            throw error;
        }
    }
}

export const authService = new AuthService();
