'use server';
import { decryptData } from "@/actions/crypto.action";
import { auth } from "@/auth";
import { Session } from "next-auth";
export async function userData() {
    try {
        const session: Session | null = await auth();
        if (session && typeof session.user?.key === 'string') {
            const result_string = await decryptData(session.user.key);
            const result = JSON.parse(result_string);
            return {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role,
                accessToken: result.accessToken,
                refreshTokens: result.refreshTokens
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Session error:', error);
        return null
    }
}