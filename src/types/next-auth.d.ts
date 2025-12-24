import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id?: string
            key?: string
            role?: string
        } & DefaultSession["user"]
    }

    interface User {
        id?: string
        key?: string
        role?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string
        key?: string
        role?: string
        accessToken?: string
    }
}
