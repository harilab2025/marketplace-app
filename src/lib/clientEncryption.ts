/**
 * Client-side RSA Hybrid Encryption utility using Web Crypto API
 * Compatible with backend RSA + AES-256-GCM encryption
 *
 * Backend uses:
 * - RSA-4096 with OAEP-SHA256 padding for key encryption
 * - AES-256-GCM for data encryption
 * - Format (Request): { encryptedData: base64, encryptedKey: base64, iv: base64 }
 * - Format (Response): base64(JSON.stringify({ encryptedData: base64, iv: base64 }))
 */

import { scrypt } from '@noble/hashes/scrypt.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RSAHybridEncrypted {
    encryptedData: string;  // base64 - Data encrypted with AES
    encryptedKey: string;   // base64 - AES key encrypted with RSA
    iv: string;             // base64 - Initialization vector
}

export interface AESEncryptedData {
    encryptedData: string;  // base64
    iv: string;             // base64
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    try {
        // Sanitize base64: remove whitespace and newlines
        const sanitized = base64.replace(/\s/g, '');

        // Decode base64
        const binaryString = atob(sanitized);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (error) {
        console.error('Base64 decode error:', error);
        console.error('Invalid base64 string length:', base64.length);
        console.error('First 100 chars:', base64.substring(0, 100));
        throw new Error('Failed to decode base64 string. Invalid format.');
    }
}

/**
 * Convert PEM public key to CryptoKey
 */
async function pemToPublicKey(pem: string): Promise<CryptoKey> {
    try {
        // Validate PEM format
        if (!pem || typeof pem !== 'string') {
            throw new Error('Invalid PEM key: must be a non-empty string');
        }

        // Remove PEM header/footer and whitespace
        const pemHeader = '-----BEGIN PUBLIC KEY-----';
        const pemFooter = '-----END PUBLIC KEY-----';

        // Check if PEM has proper headers
        if (!pem.includes(pemHeader)) {
            console.error('PEM key missing header. Raw key:', pem.substring(0, 100));
            throw new Error('Invalid PEM format: missing BEGIN PUBLIC KEY header');
        }

        const pemContents = pem
            .replace(pemHeader, '')
            .replace(pemFooter, '')
            .replace(/\s/g, '');

        if (!pemContents) {
            throw new Error('PEM key content is empty after removing headers');
        }

        // Convert base64 to ArrayBuffer
        const binaryDer = base64ToArrayBuffer(pemContents);

        // Import as CryptoKey
        return await crypto.subtle.importKey(
            'spki',
            binaryDer,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256',
            },
            true,
            ['encrypt']
        );
    } catch (error) {
        console.error('PEM to CryptoKey conversion error:', error);
        throw new Error(`Failed to import RSA public key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// ============================================================================
// RSA HYBRID ENCRYPTION (for REQUEST to backend)
// ============================================================================

/**
 * Hybrid Encrypt: RSA + AES
 * - Generate random AES key
 * - Encrypt data with AES-256-GCM
 * - Encrypt AES key with RSA public key
 *
 * @param plaintext - Data to encrypt
 * @param rsaPublicKeyPEM - RSA public key in PEM format
 * @returns { encryptedData, encryptedKey, iv } all in base64
 */
export async function hybridEncrypt(
    plaintext: string,
    rsaPublicKeyPEM: string
): Promise<RSAHybridEncrypted> {
    try {
        // 1. Generate random AES key (256 bits = 32 bytes)
        const aesKey = await crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256,
            },
            true,
            ['encrypt', 'decrypt']
        );

        // 2. Generate random IV (16 bytes)
        const iv = crypto.getRandomValues(new Uint8Array(16));

        // 3. Encrypt data with AES-256-GCM
        const encoder = new TextEncoder();
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
                tagLength: 128, // 16 bytes auth tag
            },
            aesKey,
            encoder.encode(plaintext)
        );

        // 4. Export AES key as raw bytes
        const aesKeyBytes = await crypto.subtle.exportKey('raw', aesKey);

        // 5. Import RSA public key
        const rsaPublicKey = await pemToPublicKey(rsaPublicKeyPEM);

        // 6. Encrypt AES key with RSA public key
        const encryptedKey = await crypto.subtle.encrypt(
            {
                name: 'RSA-OAEP',
            },
            rsaPublicKey,
            aesKeyBytes
        );

        // 7. Return all components in base64
        return {
            encryptedData: arrayBufferToBase64(encryptedData),
            encryptedKey: arrayBufferToBase64(encryptedKey),
            iv: arrayBufferToBase64(iv.buffer),
        };
    } catch (error) {
        console.error('Hybrid encryption error:', error);
        throw new Error('Failed to encrypt data with RSA hybrid encryption');
    }
}

/**
 * Helper to encrypt JSON object with RSA hybrid
 */
export async function hybridEncryptJSON(
    data: unknown,
    rsaPublicKeyPEM: string
): Promise<RSAHybridEncrypted> {
    const jsonString = JSON.stringify(data);
    return hybridEncrypt(jsonString, rsaPublicKeyPEM);
}

// ============================================================================
// AES SYMMETRIC DECRYPTION (for RESPONSE from backend)
// ============================================================================

/**
 * Decrypt AES-encrypted data (server responses)
 * Uses shared CLIENT_ENCRYPTION_KEY
 *
 * @param encryptedData - { encryptedData: base64, iv: base64 }
 * @param secretKey - Shared secret key (CLIENT_ENCRYPTION_KEY from .env)
 * @returns Decrypted plaintext
 */
export async function aesDecrypt(
    encryptedData: AESEncryptedData
): Promise<string> {
    try {
        // 1. Derive key from secret using scrypt (same as backend)
        const encoder = new TextEncoder();
        const salt = encoder.encode('salt');
        const passwordKey = encoder.encode(process.env.CLIENT_ENCRYPTION_KEY || '');

        // Use scrypt for key derivation (matches backend)
        const derivedKeyBytes = scrypt(passwordKey, salt, {
            N: 16384,
            r: 8,
            p: 1,
            dkLen: 32,
        });

        // 2. Import derived key
        const aesKey = await crypto.subtle.importKey(
            'raw',
            new Uint8Array(derivedKeyBytes),
            {
                name: 'AES-GCM',
                length: 256,
            },
            false,
            ['decrypt']
        );

        // 3. Decode base64
        const ivBuffer = base64ToArrayBuffer(encryptedData.iv);
        const encryptedBuffer = base64ToArrayBuffer(encryptedData.encryptedData);

        // 4. Decrypt (Web Crypto handles auth tag automatically)
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: ivBuffer,
                tagLength: 128,
            },
            aesKey,
            encryptedBuffer
        );

        // 5. Convert to string
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    } catch (error) {
        console.error('AES decryption error:', error);
        throw new Error('Failed to decrypt response data');
    }
}

/**
 * Helper to decrypt JSON from AES-encrypted response
 */
export async function aesDecryptJSON<T = unknown>(
    encryptedData: AESEncryptedData
): Promise<T> {
    const decryptedString = await aesDecrypt(encryptedData);
    return JSON.parse(decryptedString) as T;
}

/**
 * Decrypt base64-encoded encrypted response from backend
 * Format: base64(JSON.stringify({ encryptedData: base64, iv: base64 }))
 *
 * @param base64String - Base64 encoded encrypted response
 * @param secretKey - CLIENT_ENCRYPTION_KEY from .env
 * @returns Decrypted data
 */
export async function decryptResponse<T = unknown>(
    base64String: string
): Promise<T> {
    try {
        // 1. Decode base64 to JSON string
        const jsonString = atob(base64String);

        // 2. Parse JSON to get { encryptedData, iv }
        const encrypted: AESEncryptedData = JSON.parse(jsonString);

        // 3. Decrypt
        return await aesDecryptJSON<T>(encrypted);
    } catch (error) {
        console.error('Response decryption error:', error);
        throw new Error('Failed to decrypt server response');
    }
}
