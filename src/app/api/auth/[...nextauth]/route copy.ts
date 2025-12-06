import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"
import { decryptData } from "@/actions/crypto.action";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log("NextAuth route loaded") // Debug log
// Gunakan NextAuthConfig untuk Auth.js v5
const handler = NextAuth({
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
                if (!credentials?.email || !credentials?.password) {
                    return null
                }
                if (!credentials?.token) {
                    return null;
                }
                try {
                    const response = await axios.post(
                        `${API_URL}/auth/login`,
                        {
                            email: credentials?.email,
                            password: credentials?.password,
                            token: credentials?.token,
                        },
                        {
                            headers: { "Content-Type": "application/json" },
                        }
                    );

                    if (response.status !== 200) {
                        return null;
                    }

                    if (response.data && response.data.data) {
                        const result_key = response.data.data;
                        const result_string = await decryptData(result_key);
                        const result = JSON.parse(result_string);

                        const data = {
                            id: result.user.id,
                            name: result.user.name,
                            email: result.user.email,
                            role: result.user.role,
                            accessToken: result.accessToken,
                            refreshTokens: result.refreshTokens
                        };
                        return data;
                    }
                    return null;
                } catch {
                    return null;
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
            }
            return session
        },
    },
    pages: {
        signIn: '/', // custom login page (opsional)
        error: '/error', // custom error page (opsional)
    },
    debug: process.env.NODE_ENV === 'development', // enable debug di development
});


export { handler as GET, handler as POST }