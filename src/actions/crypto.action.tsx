'use server'

import { ServerCrypto } from "@/lib/serverCrypto";

/**
 * Server-side encryption (NOT exposed to client)
 * Uses ENCRYPTION_KEY_USERDATA from server environment
 */
export async function encryptData(data: string) {
    return await ServerCrypto.encryptToString(data);
}

/**
 * Server-side decryption (NOT exposed to client)
 */
export async function decryptData(encryptedData: string) {
    return await ServerCrypto.decryptFromString(encryptedData);
}