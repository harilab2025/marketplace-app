'use server'

import { CryptoUserData } from "@/lib/cryptoUser";

export async function encryptData(data: string) {
    return await CryptoUserData.encryptToString(data)
}
export async function decryptData(encryptedData: string) {
    return await CryptoUserData.decryptFromString(encryptedData);
}