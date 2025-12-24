import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { userData } from './lib/auth.user';
import { signOut } from './auth';
type AccessRule = { pattern: RegExp; roles: string[] };

const accessRules: AccessRule[] = [
    { pattern: /^\/dashboard\/management-users(?:\/.*)?$/, roles: ['SUPERADMIN'] },
    { pattern: /^\/dashboard\/management-categories(?:\/.*)?$/, roles: ['SUPERADMIN'] },
    { pattern: /^\/dashboard\/management-products(?:\/.*)?$/, roles: ['SUPERADMIN', 'PRODUCT_MANAGER'] },
    { pattern: /^\/dashboard\/analytics(?:\/.*)?$/, roles: ['SUPERADMIN', 'PRODUCT_MANAGER'] },
    { pattern: /^\/api\/dashboard\/.*$/, roles: ['SUPERADMIN', 'PRODUCT_MANAGER', 'CASHIER'] }
];

export async function proxy(request: NextRequest) {

    const url = new URL(request.url);
    const user = await userData();

    if (!user) {
        const loginUrl = new URL('/', request.url);
        loginUrl.searchParams.set('callbackUrl', url.pathname);
        await signOut({
            redirect: false
        });
        const cleanupUrl = new URL('/auth/cleanup', request.url);
        cleanupUrl.searchParams.set('next', '/');
        return NextResponse.redirect(loginUrl);
    }

    const accessToken = user.accessToken;
    const refreshTokens = user.refreshTokens;

    const userRole: string | null = user.role;

    // If role cannot be determined, block access to protected areas
    if (!userRole) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Check matching rule
    const matchedRule = accessRules.find((rule) => rule.pattern.test(url.pathname));
    if (matchedRule && !matchedRule.roles.includes(String(userRole))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Inject security tokens to upstream request headers
    const requestHeaders = new Headers(request.headers);
    if (accessToken) {
        requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    }
    // Only forward refresh token to API routes
    if (url.pathname.startsWith('/api/') && refreshTokens) {
        requestHeaders.set('x-refresh-token', String(refreshTokens));
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders
        }
    });
}

export const config = {
    matcher: [
        '/dashboard/:path*',
    ]
};