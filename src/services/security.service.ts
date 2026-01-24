/**
 * Security Service
 * Handles security-related API calls (activity logs, devices, sessions)
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SecurityActivity {
    id: string;
    type: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | '2FA_ENABLED' | '2FA_DISABLED' |
    'RECOVERY_CODE_GENERATED' | 'RECOVERY_CODE_USED' | 'FAILED_LOGIN' | 'SUSPICIOUS_LOGIN';
    description: string;
    ipAddress: string;
    location?: string;
    device: string;
    userAgent: string;
    timestamp: string;
    suspicious: boolean;
    metadata?: Record<string, unknown>;
}

export interface TrustedDevice {
    id: string;
    deviceName: string;
    deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN';
    browser: string;
    os: string;
    ipAddress: string;
    location?: string;
    lastUsed: string;
    firstTrusted: string;
    trusted: boolean;
}

export interface ActiveSession {
    id: string;
    deviceName: string;
    browser: string;
    os: string;
    ipAddress: string;
    location?: string;
    current: boolean;
    createdAt: string;
    lastActivity: string;
    expiresAt: string;
}

export interface SecurityActivityResponse {
    status: string;
    message: string;
    data: {
        activities: SecurityActivity[];
        total: number;
    };
}

export interface TrustedDevicesResponse {
    status: string;
    message: string;
    data: {
        devices: TrustedDevice[];
        total: number;
    };
}

export interface ActiveSessionsResponse {
    status: string;
    message: string;
    data: {
        sessions: ActiveSession[];
        total: number;
    };
}

export interface RemoveDeviceResponse {
    status: string;
    message: string;
}

export interface RevokeSessionResponse {
    status: string;
    message: string;
}

// ============================================================================
// SECURITY SERVICE CLASS
// ============================================================================

class SecurityService {
    /**
     * Get user security activity (recent events)
     * @param accessToken - User access token
     * @param limit - Number of activities to fetch (default: 10)
     */
    async getSecurityActivity(
        accessToken: string,
        limit: number = 10
    ): Promise<SecurityActivityResponse> {
        try {
            const response = await axios.get<SecurityActivityResponse>(
                `${API_URL}/user/security/activity`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    params: { limit },
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to fetch security activity'
                );
            }
            throw error;
        }
    }

    /**
     * Get trusted devices
     * @param accessToken - User access token
     */
    async getTrustedDevices(): Promise<TrustedDevicesResponse> {
        try {
            const response = await axios.get<TrustedDevicesResponse>(
                `${API_URL}/user/security/devices`,
                {
                    withCredentials: true,
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to fetch trusted devices'
                );
            }
            throw error;
        }
    }

    /**
     * Remove a trusted device
     * @param deviceId - Device ID to remove
     * @param accessToken - User access token
     */
    async removeTrustedDevice(
        deviceId: string
    ): Promise<RemoveDeviceResponse> {
        try {
            const response = await axios.delete<RemoveDeviceResponse>(
                `${API_URL}/user/security/devices/${deviceId}`,
                {
                    withCredentials: true,
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    'Failed to remove trusted device'
                );
            }
            throw error;
        }
    }

    /**
     * Get active sessions
     * @param accessToken - User access token
     */
    async getActiveSessions(
        accessToken: string
    ): Promise<ActiveSessionsResponse> {
        try {
            const response = await axios.get<ActiveSessionsResponse>(
                `${API_URL}/user/security/sessions`,
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
                    'Failed to fetch active sessions'
                );
            }
            throw error;
        }
    }

    /**
     * Revoke an active session
     * @param sessionId - Session ID to revoke
     * @param accessToken - User access token
     */
    async revokeSession(
        sessionId: string,
        accessToken: string
    ): Promise<RevokeSessionResponse> {
        try {
            const response = await axios.delete<RevokeSessionResponse>(
                `${API_URL}/user/security/sessions/${sessionId}`,
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
                    'Failed to revoke session'
                );
            }
            throw error;
        }
    }
}

// Export singleton instance
export const securityService = new SecurityService();
export default SecurityService;
