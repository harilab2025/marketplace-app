import NextAuth, { AuthError } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

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

// ============================================================================
// TYPES - User info only (no tokens - tokens are in HTTP-only cookies)
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

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                // User info as JSON string (no tokens!)
                userInfo: { label: "User Info", type: "text" }
            },
            async authorize(credentials) {
                // ============================================================
                // SIMPLIFIED: Just validate and store user info
                // Tokens are handled by HTTP-only cookies from backend
                // ============================================================
                if (!credentials?.userInfo) {
                    throw new CustomError('Invalid authentication data');
                }

                try {
                    const userInfo: UserInfo = JSON.parse(credentials.userInfo as string);

                    // Validate required user fields
                    if (!userInfo.publicId || !userInfo.email || !userInfo.role) {
                        throw new CustomError('Missing required user information');
                    }

                    // Return user object for NextAuth session
                    const uuid: string = generateUUID();
                    return {
                        id: uuid,
                        publicId: userInfo.publicId,
                        name: userInfo.name,
                        email: userInfo.email,
                        role: userInfo.role,
                        avatar: userInfo.avatar,
                        securityLevel: userInfo.securityLevel,
                        twoFactorEnabled: userInfo.twoFactorEnabled,
                    };

                } catch (error) {
                    if (error instanceof SyntaxError) {
                        throw new CustomError('Invalid user data format');
                    }

                    if (error instanceof CustomError) {
                        throw error;
                    }

                    throw new CustomError('Authentication failed');
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
        async jwt({ token, user, trigger, session }) {
            // On initial sign-in, store user info
            if (user) {
                token.id = user.id;
                token.publicId = user.publicId;
                token.name = user.name;
                token.email = user.email;
                token.role = user.role;
                token.avatar = user.avatar;
                token.securityLevel = user.securityLevel;
                token.twoFactorEnabled = user.twoFactorEnabled;
            }

            // Allow session updates (e.g., role changes)
            if (trigger === "update" && session) {
                token.role = session.role || token.role;
                token.name = session.name || token.name;
                token.avatar = session.avatar || token.avatar;
                token.securityLevel = session.securityLevel || token.securityLevel;
                token.twoFactorEnabled = session.twoFactorEnabled ?? token.twoFactorEnabled;
            }

            return token;
        },

        async session({ session, token }) {
            // ============================================================
            // Expose user info to client session
            // NO tokens here - tokens are in HTTP-only cookies
            // ============================================================
            if (token) {
                session.user.id = token.id as string;
                session.user.publicId = token.publicId as string;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                session.user.role = token.role as string;
                session.user.avatar = token.avatar as string | undefined;
                session.user.securityLevel = token.securityLevel as string | undefined;
                session.user.twoFactorEnabled = token.twoFactorEnabled as boolean | undefined;
            }
            return session;
        },
    },
    pages: {
        signIn: '/',
        error: '/error',
    },
    debug: process.env.NODE_ENV === 'development',
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
        async signOut() {
            // Backend logout is handled separately via authService.logout()
            // which uses HTTP-only cookies
            // No need to manually call backend here
        }
    }
})
