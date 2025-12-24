import { NextRequest } from "next/server";

// app/api/image/[id]/route.ts
export async function GET(_req: NextRequest, ctx: RouteContext<'/api/image/[id]'>) {
    const { id } = await ctx.params;
    const upstream = await fetch(
        `http://localhost:3001/api/files/${id}/serve`,
        { cache: 'no-store' }
    );

    if (!upstream.ok || !upstream.body) {
        return new Response('Not found', { status: 404 });
    }

    const contentType =
        upstream.headers.get('content-type') ?? 'image/jpeg';
    return new Response(upstream.body, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': 'inline', // 🔥 penting
        },
    });
}
