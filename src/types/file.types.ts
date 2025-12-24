/**
 * File Types - Must match backend FileType enum
 * Location: ExpressJS/src/interfaces/file.interface.ts
 */
export enum FileType {
    AVATAR = 'AVATAR',
    DOCUMENT = 'DOCUMENT',
    ID_CARD = 'ID_CARD',
    SIGNATURE = 'SIGNATURE',
    PRODUCT_IMAGE = 'PRODUCT_IMAGE',
    PRODUCT_THUMBNAIL = 'PRODUCT_THUMBNAIL',
    PRODUCT_MANUAL = 'PRODUCT_MANUAL',
    PRODUCT_CERTIFICATE = 'PRODUCT_CERTIFICATE',
    PRODUCT_VIDEO = 'PRODUCT_VIDEO',
    PRODUCT_SPEC_SHEET = 'PRODUCT_SPEC_SHEET',
    ATTACHMENT = 'ATTACHMENT',
    BACKUP = 'BACKUP',
    TEMPORARY = 'TEMPORARY',
    MEDIA = 'MEDIA',
    ARCHIVE = 'ARCHIVE',
    SPREADSHEET = 'SPREADSHEET',
    PRESENTATION = 'PRESENTATION',
    CODE = 'CODE',
    DESIGN = 'DESIGN',
}

/**
 * File Status - Must match backend FileStatus enum
 */
export enum FileStatus {
    ACTIVE = 'ACTIVE',
    DELETED = 'DELETED',
    ARCHIVED = 'ARCHIVED',
    PROCESSING = 'PROCESSING',
    CORRUPTED = 'CORRUPTED',
    QUARANTINED = 'QUARANTINED',
}

/**
 * File Upload Request
 */
export interface FileUploadRequest {
    file: File;
    fileType?: FileType;
    isPublic?: boolean;
    metadata?: Record<string, any>;
    tags?: string[];
    expiresAt?: string; // ISO date string
}

/**
 * File Upload Response
 */
export interface FileUploadResponse {
    success: boolean;
    url?: string;
    publicId?: string;
    message?: string;
    data?: {
        publicId: string;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        url: string;
        fileType: FileType;
        isPublic: boolean;
        metadata?: Record<string, any>;
        tags?: string[];
        createdAt: string;
    };
}

/**
 * Helper function to get appropriate FileType for different contexts
 */
export const getFileTypeForContext = (context: string): FileType => {
    const contextMap: Record<string, FileType> = {
        'product-image': FileType.PRODUCT_IMAGE,
        'product-thumbnail': FileType.PRODUCT_THUMBNAIL,
        'product-description': FileType.PRODUCT_IMAGE,
        'lexical-editor': FileType.PRODUCT_IMAGE,
        'avatar': FileType.AVATAR,
        'document': FileType.DOCUMENT,
        'media': FileType.MEDIA,
        'attachment': FileType.ATTACHMENT,
        'temporary': FileType.TEMPORARY,
    };

    return contextMap[context] || FileType.MEDIA;
};
