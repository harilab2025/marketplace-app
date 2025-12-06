import axios from 'axios';
import { AppConfig } from '@/lib/config';
import { userData } from './auth.user';
import { signOut } from 'next-auth/react';

export async function resolveAccessToken(): Promise<string | null> {
    const user = await userData();
    if (!user || !user.accessToken) {
        return null;
    }
    const accessToken = user.accessToken;
    return accessToken;
}

export const apiClient = axios.create({
    baseURL: AppConfig.apiBaseUrl,
    timeout: 10000, // 10 seconds timeout for external API
    validateStatus: (status) => {
        // Accept status codes 200-299 as success
        return status >= 200 && status < 300;
    },
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

apiClient.interceptors.request.use(async (config) => {
    const token = await resolveAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    // Auto-detect FormData dan hapus Content-Type
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
        // Atau bisa juga: config.headers['Content-Type'] = 'multipart/form-data';
    }
    return config;
});

apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error?.config as (typeof error)['config'] & { _retry?: boolean };
        const status = error?.response?.status;

        if (status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;
            try {
                const user = await userData();
                const refreshToken = user?.refreshTokens;
                if (!refreshToken) throw new Error('Missing refresh token');
                const token = await resolveAccessToken();
                const refreshRes = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/refreshToken`,
                    { refreshToken },
                    { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
                );
                if (!refreshRes || (refreshRes.status !== 200 && refreshRes.status !== 201)) {
                    await signOut({
                        redirect: false,
                        callbackUrl: '/'
                    });
                    // Optional: Clear additional client-side data
                    localStorage.clear();
                    sessionStorage.clear();

                    return Promise.reject(error);
                }
                const newAccessToken: string | undefined = refreshRes?.data?.data?.accessToken;
                if (!newAccessToken) {
                    await signOut({
                        redirect: false,
                        callbackUrl: '/'
                    });
                    // Optional: Clear additional client-side data
                    localStorage.clear();
                    sessionStorage.clear();

                    throw new Error('No access token in refresh response');
                }

                originalRequest.headers = originalRequest.headers || {};
                (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
            } catch (e) {
                try {
                    await signOut({
                        redirect: false,
                        callbackUrl: '/'
                    });
                    // Optional: Clear additional client-side data
                    localStorage.clear();
                    sessionStorage.clear();

                } catch { }
                return Promise.reject(e);
            }
        }

        return Promise.reject(error);
    }
);