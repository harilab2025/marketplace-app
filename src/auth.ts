import NextAuth, { AuthError } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"
import { decryptData } from "@/actions/crypto.action";

class CustomError extends AuthError {
    constructor(message: string) {
        super()
        this.message = message
    }
}

function generateUUID(): string {
    return ('10000000-1000-4000-8000-100000000000').replace(/[018]/g, (c: string) =>
        (parseInt(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> parseInt(c) / 4).toString(16)
    );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                token: { label: "Token", type: "text" }
            },
            async authorize(credentials) {
                // Validasi input - langsung throw error tanpa try-catch
                if (!credentials?.email || !credentials?.password) {
                    throw new CustomError('Email and password are required');
                }
                if (!credentials?.token) {
                    throw new CustomError('reCAPTCHA verification is required');
                }

                try {
                    const requestData = {
                        email: credentials.email,
                        password: credentials.password,
                        token: credentials.token
                    };

                    const response = await axios.post(`${API_URL}/auth/login`, requestData, {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 10000, // 10 second timeout
                    });

                    // Cek response status dan data
                    if (response.status === 200 && response.data?.data) {
                        const result_key = response.data.data;
                        const uuid: string = generateUUID();
                        if (result_key) {
                            return {
                                id: uuid,
                                key: result_key
                            };
                        }
                    }

                    // Jika sampai sini, response tidak valid
                    throw new CustomError('Invalid response from server');

                } catch (error) {
                    // Handle axios errors
                    if (axios.isAxiosError(error)) {
                        if (error.response) {
                            // Server responded with error status
                            const apiErrorMessage = error.response.data?.message ||
                                error.response.data?.error ||
                                'Login failed';
                            throw new CustomError(apiErrorMessage);
                        } else if (error.request) {
                            // Network error
                            throw new CustomError('Unable to connect to server. Please try again.');
                        } else {
                            // Request setup error
                            throw new CustomError('Network error occurred');
                        }
                    }

                    // Re-throw other errors (termasuk dari validasi atau decryption)
                    if (error instanceof Error) {
                        throw error;
                    }

                    // Fallback error
                    throw new CustomError('An unexpected error occurred');
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt" as const,
        maxAge: 24 * 60 * 60, // 24 hours
        updateAge: 2 * 60 * 60, // Update every 2 hours
    },
    trustHost: true,
    callbacks: {
        async jwt({ token, user, account, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.key = user.key;
            }

            if (account && account.access_token) {
                token.accessToken = account.access_token;
            }

            if (trigger === "update" && session) {
                token.role = session.role || token.role;
            }

            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.key = token.key as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/', // custom login page (opsional)
        error: '/error', // custom error page (opsional)
    },
    debug: process.env.NODE_ENV === 'development', // enable debug di development
    logger: {
        error(error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('NextAuth Error:', error);
            }
        },
        warn(code) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('NextAuth Warning:', code);
            }
        },
        debug(code, metadata) {
            if (process.env.NODE_ENV === 'development') {
                console.info('NextAuth Debug:', code, metadata);
            }
        }
    },
    events: {
        async signOut(message) {
            // Panggil API untuk invalidate token di server (optional)
            try {
                // Check if API_URL is available
                if (!API_URL) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('API_URL not configured, skipping server logout');
                    }
                    return;
                }

                const token = 'token' in message ? message.token : null;
                if (token?.key && typeof token.key === 'string') {
                    const result_string = await decryptData(token.key);
                    const result = JSON.parse(result_string);

                    if (result?.accessToken) {
                        await axios.post(`${API_URL}/auth/logout`, {}, {
                            headers: {
                                'Authorization': `Bearer ${result.accessToken}`,
                                'Content-Type': 'application/json'
                            },
                            timeout: 3000, // 3 second timeout
                            validateStatus: () => {
                                // Accept any status code - logout should always succeed
                                return true;
                            }
                        });
                    }
                }
            } catch (error) {
                // Silently ignore logout errors - client logout should always succeed
                // Only log in development for debugging
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Server logout warning (ignored):', error);
                }
            }
        }
    }
})