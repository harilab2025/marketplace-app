import { DefaultSession } from "next-auth"

/**
 * NEXTAUTH TYPE EXTENSIONS
 *
 * Extended types for session management.
 *
 * SECURITY NOTES:
 * - Tokens (accessToken, refreshToken) are stored in HTTP-only cookies by backend
 * - NextAuth session only contains user info (no tokens)
 * - This is more secure as tokens are never exposed to JavaScript
 */

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            publicId: string
            name: string
            email: string
            role: string
            avatar?: string
            securityLevel?: string
            twoFactorEnabled?: boolean
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        publicId: string
        name: string
        email: string
        role: string
        avatar?: string
        securityLevel?: string
        twoFactorEnabled?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        publicId: string
        name: string
        email: string
        role: string
        securityLevel?: string
        twoFactorEnabled?: boolean
    }
}
