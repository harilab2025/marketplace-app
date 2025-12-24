import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { FileType } from '@/types/file.types';

export async function POST(request: NextRequest) {
    try {
        // Get session
        const session = await auth();
        if (!session?.user?.key) {
            return NextResponse.json(
                { error: 'Unauthorized - No session' },
                { status: 401 }
            );
        }

        // Get the form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Optional: Get custom metadata from form data (if provided by client)
        const customFileType = formData.get('fileType') as string | null;
        const customIsPublic = formData.get('isPublic') as string | null;
        const customMetadata = formData.get('metadata') as string | null;
        const customTags = formData.get('tags') as string | null;
        const customExpiresAt = formData.get('expiresAt') as string | null;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        // Get token
        const { decryptData } = await import('@/actions/crypto.action');
        const decryptedData = await decryptData(session.user.key);
        const userData = JSON.parse(decryptedData);
        const token = userData.accessToken;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No token' },
                { status: 401 }
            );
        }

        // Prepare form data for backend with required fields
        const backendFormData = new FormData();
        backendFormData.append('file', file);

        // Required fields - use custom values or defaults
        // For Lexical editor uploads in product descriptions, use PRODUCT_IMAGE
        const fileType = customFileType || FileType.PRODUCT_IMAGE;
        backendFormData.append('fileType', fileType);

        // isPublic: Only send if explicitly provided by client
        // If not provided, backend will use fileType-based defaults:
        // - PRODUCT_IMAGE, PRODUCT_THUMBNAIL, PRODUCT_VIDEO, MEDIA → true (public)
        // - AVATAR, DOCUMENT, ID_CARD, SIGNATURE, etc. → false (private)
        if (customIsPublic !== null) {
            const isPublicValue = customIsPublic === 'false' ? 'false' : 'true';
            backendFormData.append('isPublic', isPublicValue);
        }
        // If customIsPublic is null, don't send it - let backend decide based on fileType

        // Metadata - merge custom with defaults
        let metadata = {
            originalName: file.name,
            uploadedFrom: 'lexical-editor',
            context: 'product-description',
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            uploadedBy: session.user.id || 'unknown'
        };

        // If custom metadata provided, merge it
        if (customMetadata) {
            try {
                const parsedCustomMetadata = JSON.parse(customMetadata);
                metadata = { ...metadata, ...parsedCustomMetadata };
            } catch {
                console.warn('Invalid custom metadata JSON, using defaults');
            }
        }
        backendFormData.append('metadata', JSON.stringify(metadata));

        // Tags - use custom or defaults
        let tags = ['product', 'description', 'image'];
        if (customTags) {
            try {
                tags = JSON.parse(customTags);
            } catch {
                console.warn('Invalid custom tags JSON, using defaults');
            }
        }
        backendFormData.append('tags', JSON.stringify(tags));

        // Expiration - optional
        if (customExpiresAt) {
            backendFormData.append('expiresAt', customExpiresAt);
        }
        // Note: If expiresAt is not set, backend should treat as no expiration

        // Forward to backend API
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/files/upload`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
            },
            body: backendFormData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || 'Failed to upload image' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Log the backend response for debugging
        console.log('📤 Backend upload response:', JSON.stringify(data, null, 2));

        // Return the file URL from backend
        // Adjust this based on your backend response structure
        return NextResponse.json({
            success: true,
            url: data.data?.url || data.url,
            publicId: data.data?.publicId || data.publicId,
            fullData: data, // Include full response for debugging
            message: 'Image uploaded successfully'
        });

    } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Next.js App Router automatically handles multipart/form-data
// No need for config export - file size is validated in the handler above
