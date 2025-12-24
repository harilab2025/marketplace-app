import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    try {
        const { publicId } = await params;
        console.log('🖼️ Image request for publicId:', publicId);

        // Get session from NextAuth
        const session = await auth();

        if (!session?.user?.key) {
            console.error('❌ No session found');
            return new NextResponse('Unauthorized - No session', { status: 401 });
        }

        // Import decryptData dynamically to avoid circular dependencies
        const { decryptData } = await import('@/actions/crypto.action');
        const decryptedData = await decryptData(session.user.key);
        const userData = JSON.parse(decryptedData);
        const token = userData.accessToken;


        if (!token) {
            console.error('❌ No token found');
            return new NextResponse('Unauthorized - No token', { status: 401 });
        }

        // Forward request to backend API with authentication
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/files/${publicId}/download`;
        console.log('📥 Fetching image from backend:', apiUrl);

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('📥 Backend response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error('❌ Backend error:', response.status, errorText);
            return new NextResponse(`Failed to fetch image: ${errorText}`, { status: response.status });
        }

        // Get the image buffer
        const imageBuffer = await response.arrayBuffer();
        console.log('✅ Image buffer size:', imageBuffer.byteLength, 'bytes');

        // Get content type from response
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        console.log('✅ Content-Type:', contentType);

        // Return the image with appropriate headers
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('❌ Image proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
