/**
 * IMPROVED: Client-side encryption dengan PBKDF2
 * Note: Tetap tidak recommended untuk production karena key exposure
 */

interface EncryptionResult {
    encrypted: string;
    iv: string;
    salt: string; // Add salt for each encryption
}

export class CryptoUserDataImproved {
    private static readonly ALGORITHM = 'AES-GCM';
    private static readonly KEY_LENGTH = 256;
    private static readonly IV_LENGTH = 12;
    private static readonly SALT_LENGTH = 16;
    private static readonly PBKDF2_ITERATIONS = 100000; // NIST recommendation

    /**
     * Derive key using PBKDF2 (proper KDF)
     */
    private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
        // Import password as key material
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        // Derive AES key using PBKDF2
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.PBKDF2_ITERATIONS,
                hash: 'SHA-256',
            },
            passwordKey,
            {
                name: this.ALGORITHM,
                length: this.KEY_LENGTH,
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Generate random bytes
     */
    private static generateRandom(length: number): Uint8Array {
        return crypto.getRandomValues(new Uint8Array(length));
    }

    /**
     * Convert ArrayBuffer to base64
     */
    private static arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
        const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Convert base64 to Uint8Array
     */
    private static base64ToUint8Array(base64: string): Uint8Array {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    /**
     * Encrypt plaintext string
     */
    public static async encrypt(plaintext: string): Promise<EncryptionResult> {
        try {
            // WARNING: This key is exposed in browser!
            const secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY_USERDATA;
            if (!secretKey) {
                throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY_USERDATA not found');
            }

            // Generate random salt and IV
            const salt = this.generateRandom(this.SALT_LENGTH);
            const iv = this.generateRandom(this.IV_LENGTH);

            // Derive key with PBKDF2
            const key = await this.deriveKey(secretKey, salt);

            // Encrypt data
            const data = new TextEncoder().encode(plaintext);
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: this.ALGORITHM,
                    iv: iv,
                },
                key,
                data
            );

            return {
                encrypted: this.arrayBufferToBase64(encrypted),
                iv: this.arrayBufferToBase64(iv),
                salt: this.arrayBufferToBase64(salt),
            };
        } catch (error) {
            throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Decrypt encrypted data
     */
    public static async decrypt(encryptedData: EncryptionResult): Promise<string> {
        try {
            const secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY_USERDATA;
            if (!secretKey) {
                throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY_USERDATA not found');
            }

            // Convert from base64
            const encrypted = this.base64ToUint8Array(encryptedData.encrypted);
            const iv = this.base64ToUint8Array(encryptedData.iv);
            const salt = this.base64ToUint8Array(encryptedData.salt);

            // Derive key with same salt
            const key = await this.deriveKey(secretKey, salt);

            // Decrypt data
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: this.ALGORITHM,
                    iv: iv,
                },
                key,
                encrypted
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Encrypt and return as single base64 string
     */
    public static async encryptToString(plaintext: string): Promise<string> {
        const result = await this.encrypt(plaintext);
        return btoa(JSON.stringify(result));
    }

    /**
     * Decrypt from single base64 string
     */
    public static async decryptFromString(encryptedString: string): Promise<string> {
        try {
            const decoded = atob(encryptedString);
            const result: EncryptionResult = JSON.parse(decoded);
            return await this.decrypt(result);
        } catch (error) {
            throw new Error(`Invalid format: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
