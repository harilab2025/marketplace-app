
interface EncryptionResult {
    encrypted: string;  // base64 encoded
    iv: string;         // base64 encoded
}

/**
 * Simple AES-GCM encryption/decryption using secret key from environment
 */
export class CryptoUserData {
    private static readonly ALGORITHM = 'AES-GCM';
    private static readonly KEY_LENGTH = 256;
    private static readonly IV_LENGTH = 12;
    private static readonly HASH_ALGORITHM = 'SHA-256';

    private static cachedKey: CryptoKey | null = null;

    /**
     * Get or create crypto key from environment secret
     */
    private static async getKey(): Promise<CryptoKey> {
        if (CryptoUserData.cachedKey) {
            return CryptoUserData.cachedKey;
        }

        const secretKey = process.env.ENCRYPTION_KEY_USERDATA;
        if (!secretKey) {
            throw new Error('SECRET_KEY tidak ditemukan dalam environment variables');
        }

        // Hash secret key untuk mendapatkan key yang konsisten
        try {
            const keyMaterial = await crypto.subtle.digest(
                CryptoUserData.HASH_ALGORITHM,
                new TextEncoder().encode(secretKey)
            );
            // Import sebagai AES key
            CryptoUserData.cachedKey = await crypto.subtle.importKey(
                'raw',
                keyMaterial,
                {
                    name: CryptoUserData.ALGORITHM,
                    length: CryptoUserData.KEY_LENGTH
                },
                false,
                ['encrypt', 'decrypt']
            );

            return CryptoUserData.cachedKey;

        } catch {
            throw new Error('Gagal membuat atau mengambil kunci enkripsi');
        }
    }

    /**
     * Generate random IV
     */
    private static generateIV(): ArrayBuffer {
        return crypto.getRandomValues(new Uint8Array(CryptoUserData.IV_LENGTH)).buffer;
    }

    /**
     * Convert ArrayBuffer to base64
     */
    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Convert base64 to ArrayBuffer
     */
    private static base64ToArrayBuffer(base64: string): ArrayBuffer {
        // dukung base64url (ganti -_ menjadi +/ dan pad dengan '=')
        let normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
        const pad = normalized.length % 4;
        if (pad === 2) normalized += '==';
        else if (pad === 3) normalized += '=';
        const binary = atob(normalized);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Encrypt plaintext string
     */
    public static async encrypt(plaintext: string): Promise<EncryptionResult> {
        try {
            const key = await CryptoUserData.getKey();
            const iv = CryptoUserData.generateIV();
            const data = new TextEncoder().encode(plaintext);

            const encrypted = await crypto.subtle.encrypt(
                {
                    name: CryptoUserData.ALGORITHM,
                    iv: iv
                },
                key,
                data
            );

            return {
                encrypted: CryptoUserData.arrayBufferToBase64(encrypted),
                iv: CryptoUserData.arrayBufferToBase64(iv)
            };

        } catch (error) {
            throw new Error(`Enkripsi gagal: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Decrypt encrypted data
     */
    public static async decrypt(encryptedData: EncryptionResult): Promise<string> {
        try {
            const key = await CryptoUserData.getKey();
            const encrypted = CryptoUserData.base64ToArrayBuffer(encryptedData.encrypted);
            const iv = CryptoUserData.base64ToArrayBuffer(encryptedData.iv);

            // Convert ArrayBuffer to Uint8Array for Edge compatibility
            const encryptedUint8 = new Uint8Array(encrypted);
            const ivUint8 = new Uint8Array(iv);


            const decrypted = await crypto.subtle.decrypt(
                {
                    name: CryptoUserData.ALGORITHM,
                    iv: ivUint8
                },
                key,
                encryptedUint8
            );

            return new TextDecoder().decode(decrypted);

        } catch (error) {
            throw new Error(`Dekripsi gagal: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Encrypt and return as single base64 string for easy storage
     */
    public static async encryptToString(plaintext: string): Promise<string> {
        const result = await CryptoUserData.encrypt(plaintext);
        return btoa(JSON.stringify(result));
    }

    /**
     * Decrypt from single base64 string
     */
    public static async decryptFromString(encryptedString: string): Promise<string> {
        try {
            const decoded = atob(encryptedString);
            const result: EncryptionResult = JSON.parse(decoded);
            return await CryptoUserData.decrypt(result);
        } catch (error) {
            throw new Error(`Format data tidak valid: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}