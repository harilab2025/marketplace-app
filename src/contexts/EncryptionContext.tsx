"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import {
    hybridEncryptJSON,
    decryptResponse,
    RSAHybridEncrypted,
} from '@/lib/clientEncryption';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const CLIENT_ENCRYPTION_KEY = process.env.CLIENT_ENCRYPTION_KEY || '';

interface EncryptionContextType {
    rsaPublicKey: string | null;
    isLoading: boolean;
    error: string | null;
    hybridEncryptJSON: (data: unknown) => Promise<RSAHybridEncrypted>;
    decryptResponse: <T = unknown>(base64String: string) => Promise<T>;
    refetchKey: () => Promise<void>;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

export function EncryptionProvider({ children }: { children: ReactNode }) {
    const [rsaPublicKey, setRsaPublicKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEncryptionKey = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch RSA public key from backend
            const response = await axios.get(`${API_URL}/auth/encryption/public-key`, {
                timeout: 10000,
            });
            if (response.data?.status === 'success' && response.data?.data) {
                // Try both possible field names
                const publicKey = response.data.data.publicKey || response.data.data.key;

                if (!publicKey) {
                    console.error('Public key not found in response. Available fields:', Object.keys(response.data.data));
                    throw new Error('Public key not found in response');
                }

                // Validate PEM format
                if (!publicKey.includes('BEGIN PUBLIC KEY')) {
                    console.error('Invalid PEM format received. First 100 chars:', publicKey.substring(0, 100));
                    throw new Error('Invalid PEM format: missing BEGIN PUBLIC KEY header');
                }

                console.log('RSA public key loaded successfully. Length:', publicKey.length);
                setRsaPublicKey(publicKey);
            } else {
                console.error('Invalid response structure:', response.data);
                throw new Error('Invalid encryption key response');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch RSA public key';
            setError(errorMessage);
            console.error('Failed to fetch RSA public key:', err);
            if (axios.isAxiosError(err)) {
                console.error('Response data:', err.response?.data);
                console.error('Response status:', err.response?.status);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEncryptionKey();
    }, []);

    /**
     * Encrypt request data using RSA hybrid encryption
     * Client → Server (Request)
     */
    const hybridEncryptJSONData = async (data: unknown): Promise<RSAHybridEncrypted> => {
        if (!rsaPublicKey) {
            throw new Error('RSA public key not available');
        }
        return hybridEncryptJSON(data, rsaPublicKey);
    };

    /**
     * Decrypt response data using AES symmetric decryption
     * Server → Client (Response)
     * Uses CLIENT_ENCRYPTION_KEY from environment
     */
    const decryptResponseData = async <T = unknown,>(base64String: string): Promise<T> => {
        if (!CLIENT_ENCRYPTION_KEY) {
            throw new Error('CLIENT_ENCRYPTION_KEY not configured in environment');
        }
        return decryptResponse<T>(base64String);
    };

    const value: EncryptionContextType = {
        rsaPublicKey,
        isLoading,
        error,
        hybridEncryptJSON: hybridEncryptJSONData,
        decryptResponse: decryptResponseData,
        refetchKey: fetchEncryptionKey,
    };

    return (
        <EncryptionContext.Provider value={value}>
            {children}
        </EncryptionContext.Provider>
    );
}

export function useEncryption() {
    const context = useContext(EncryptionContext);
    if (context === undefined) {
        throw new Error('useEncryption must be used within EncryptionProvider');
    }
    return context;
}
