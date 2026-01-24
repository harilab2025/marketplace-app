/**
 * Axios Instance with HTTP-only Cookie Authentication
 *
 * Features:
 * - withCredentials: true for automatic cookie handling
 * - Auto-refresh on 401 errors (backend refreshes via cookies)
 * - Queue failed requests during refresh
 * - Redirect to login on refresh failure
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Refresh state
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

/**
 * Create axios instance with HTTP-only cookie support
 * No need to manually inject Authorization header - cookies are sent automatically
 */
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send and receive HTTP-only cookies
});

/**
 * Request interceptor: Log requests (no token injection needed)
 */
axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Cookies are sent automatically by browser with withCredentials: true
        // No need to manually inject Authorization header
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor: Handle 401 errors and refresh token
 */
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is not 401 or request already retried, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => {
                    return axiosInstance(originalRequest);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            console.log('[Token Refresh] Attempting to refresh access token via cookies...');

            // Call refresh token API - backend will read refreshToken from cookie
            // and set new accessToken cookie in response
            await axios.post(
                `${API_URL}/auth/refreshToken`,
                {},
                {
                    withCredentials: true,
                    timeout: 10000,
                }
            );

            console.log('[Token Refresh] Token refreshed successfully');

            // Process queued requests
            processQueue();

            // Retry original request (cookies will be sent automatically)
            return axiosInstance(originalRequest);

        } catch (refreshError) {
            console.error('[Token Refresh] Failed to refresh token:', refreshError);

            // Process queue with error
            processQueue(refreshError as Error);

            // Redirect to login (only in browser)
            if (typeof window !== 'undefined') {
                // Use NextAuth signOut
                try {
                    const { signOut } = await import('next-auth/react');
                    await signOut({ redirect: false });
                } catch (e) {
                    console.error('Failed to sign out:', e);
                }
                window.location.href = '/?error=session_expired';
            }

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosInstance;
