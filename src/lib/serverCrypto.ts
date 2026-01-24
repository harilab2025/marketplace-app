/**
 * SERVER-SIDE ONLY Encryption
 * Uses AES-256-GCM with server secret (NOT exposed to client)
 */

import { createCipheriv, createDecipheriv, randomBytes, scrypt, scryptSync } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

interface EncryptedData {
    encryptedData: string;  // base64
    iv: string;         // base64
}

export class ServerCrypto {
    private static readonly ALGORITHM = 'aes-256-gcm';
    private static readonly KEY_LENGTH = 32;
    private static readonly IV_LENGTH = 16;
    private static readonly SALT_LENGTH = 16;
    private static readonly AUTH_TAG_LENGTH = 16;

    /**
     * Get encryption key from environment (server-side only)
     */
    private static getSecretKey(): string {
        const key = process.env.CLIENT_ENCRYPTION_KEY;
        if (!key) {
            throw new Error('KEY not found in server environment');
        }
        return key;
    }

    /**
     * Derive encryption key using scrypt
     */
    private static async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
        return (await scryptAsync(password, salt, this.KEY_LENGTH)) as Buffer;
    }

    /**
     * Encrypt data (server-side only)
     */
    public static async encrypt(plaintext: string): Promise<EncryptedData> {
        try {
            const secretKey = this.getSecretKey();

            // Generate initialization vector
            const iv = randomBytes(this.IV_LENGTH);

            // Create key buffer from secret
            const key = scryptSync(secretKey, "salt", this.KEY_LENGTH);

            // Create cipher
            const cipher = createCipheriv(this.ALGORITHM, key, iv);

            // Encrypt the data - get as Buffer
            const encryptedData = Buffer.concat([
                cipher.update(plaintext, "utf8"),
                cipher.final()
            ]);

            // Get auth tag
            const authTag = cipher.getAuthTag();

            // Combine encrypted data and auth tag, then encode as base64
            const encryptedBuffer = Buffer.concat([encryptedData, authTag]);

            return {
                encryptedData: encryptedBuffer.toString("base64"),
                iv: iv.toString("base64"),
            };
        } catch (error) {
            throw new Error(`Server encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Decrypt data (server-side only)
     */
    public static async decrypt(encryptedData: EncryptedData): Promise<string> {
        try {
            const secretKey = this.getSecretKey();

            // Decode IV
            const iv = Buffer.from(encryptedData.iv, "base64");
            const key = scryptSync(secretKey, "salt", this.KEY_LENGTH);

            // Decode the encrypted buffer
            const encryptedBuffer = Buffer.from(encryptedData.encryptedData, "base64");

            // Split encrypted data and auth tag (last 16 bytes)
            const authTag = encryptedBuffer.slice(-this.AUTH_TAG_LENGTH);
            const encryptedText = encryptedBuffer.slice(0, -this.AUTH_TAG_LENGTH);

            // Create decipher
            const decipher = createDecipheriv(this.ALGORITHM, key, iv);
            decipher.setAuthTag(authTag);

            // Decrypt the data
            let decrypted = decipher.update(encryptedText, undefined, "utf8");
            decrypted += decipher.final("utf8");

            return decrypted;
        } catch (error) {
            throw new Error(`Server decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Encrypt to single base64 string
     */
    public static async encryptToString(plaintext: string): Promise<string> {
        const result = await this.encrypt(plaintext);
        return Buffer.from(JSON.stringify(result)).toString('base64');
    }

    /**
     * Decrypt from single base64 string
     */
    public static async decryptFromString(encryptedString: string): Promise<string> {
        try {
            const decoded = Buffer.from(encryptedString, 'base64').toString('utf8');
            const result: EncryptedData = JSON.parse(decoded);
            return await this.decrypt(result);
        } catch (error) {
            throw new Error(`Invalid encrypted format: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
