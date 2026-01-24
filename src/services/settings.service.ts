import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UserSettings {
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    orderUpdates: boolean;
    marketingEmails: boolean;
    showProfile: boolean;
    showActivity: boolean;
    sessionTimeout: number;
}

export interface UpdateSettingsRequest {
    language?: string;
    timezone?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    orderUpdates?: boolean;
    marketingEmails?: boolean;
    showProfile?: boolean;
    showActivity?: boolean;
    sessionTimeout?: number;
}

export interface SettingsResponse {
    success: boolean;
    message: string;
    data: UserSettings;
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class SettingsService {
    /**
     * Get current user's settings
     */
    static async getSettings(accessToken: string): Promise<UserSettings> {
        try {
            const response = await axios.get<SettingsResponse>(
                `${API_URL}/user/settings`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch settings');
            }

            return response.data.data;
        } catch (error) {
            console.error('Get settings error:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to fetch settings'
                );
            }
            throw error;
        }
    }

    /**
     * Update user settings
     */
    static async updateSettings(
        accessToken: string,
        settings: UpdateSettingsRequest
    ): Promise<UserSettings> {
        try {
            const response = await axios.put<SettingsResponse>(
                `${API_URL}/user/settings`,
                settings,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update settings');
            }

            return response.data.data;
        } catch (error) {
            console.error('Update settings error:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to update settings'
                );
            }
            throw error;
        }
    }

    /**
     * Reset settings to default values
     */
    static async resetSettings(accessToken: string): Promise<UserSettings> {
        try {
            const response = await axios.post<SettingsResponse>(
                `${API_URL}/user/settings/reset`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to reset settings');
            }

            return response.data.data;
        } catch (error) {
            console.error('Reset settings error:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to reset settings'
                );
            }
            throw error;
        }
    }
}
