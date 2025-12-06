/**
 * IndexedDB Helper Class
 * Features:
 * - Dynamic object storage
 * - Blob/File optimization (max 3MB)
 * - Automatic expiry
 * - CRUD operations
 * - Automatic cleanup of expired data
 */

interface StoredItem<T = unknown> {
    id: string | number;
    data: T;
    createdAt: number;
    expiresAt?: number;
    metadata?: Record<string, unknown>;
}

interface AddOptions {
    expiresIn?: number; // milliseconds
    metadata?: Record<string, unknown>;
}

interface ImageCompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    quality?: number;
}

class IndexedDBHelper {
    private dbName: string;
    private storeName: string;
    private version: number;
    private db: IDBDatabase | null = null;
    private readonly MAX_SIZE_MB = 3;
    private readonly MAX_SIZE_BYTES = this.MAX_SIZE_MB * 1024 * 1024;

    constructor(dbName: string = 'AppDB', storeName: string = 'storage', version: number = 1) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
    }

    /**
     * Initialize database connection
     */
    async init(): Promise<void> {
        if (this.db) return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(new Error(`Failed to open database: ${request.error}`));

            request.onsuccess = () => {
                this.db = request.result;
                this.cleanupExpired(); // Clean expired data on init
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    objectStore.createIndex('expiresAt', 'expiresAt', { unique: false });
                    objectStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
        });
    }

    /**
     * Compress image/blob if size exceeds limit
     */
    private async compressBlob(
        blob: Blob,
        options: ImageCompressionOptions = {}
    ): Promise<Blob> {
        const {
            maxSizeMB = this.MAX_SIZE_MB,
            maxWidthOrHeight = 1920,
            quality = 0.8
        } = options;

        // If already under limit, return as-is
        if (blob.size <= maxSizeMB * 1024 * 1024) {
            return blob;
        }

        // Only compress images
        if (!blob.type.startsWith('image/')) {
            throw new Error(`File size ${(blob.size / 1024 / 1024).toFixed(2)}MB exceeds ${maxSizeMB}MB limit. Compression only works for images.`);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;

                if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
                    if (width > height) {
                        height = (height / width) * maxWidthOrHeight;
                        width = maxWidthOrHeight;
                    } else {
                        width = (width / height) * maxWidthOrHeight;
                        height = maxWidthOrHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (compressedBlob) => {
                        if (compressedBlob) {
                            // Check if compressed size is still too large
                            if (compressedBlob.size > maxSizeMB * 1024 * 1024) {
                                // Try with lower quality
                                canvas.toBlob(
                                    (recompressedBlob) => {
                                        resolve(recompressedBlob || blob);
                                    },
                                    blob.type,
                                    quality * 0.7
                                );
                            } else {
                                resolve(compressedBlob);
                            }
                        } else {
                            reject(new Error('Compression failed'));
                        }
                    },
                    blob.type,
                    quality
                );

                URL.revokeObjectURL(img.src);
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(blob);
        });
    }

    /**
     * Process data to optimize blobs
     */
    private async processData(data: unknown): Promise<unknown> {
        if (data instanceof Blob || data instanceof File) {
            return await this.compressBlob(data);
        }

        if (Array.isArray(data)) {
            return await Promise.all(data.map(item => this.processData(item)));
        }

        if (data && typeof data === 'object') {
            const processed: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(data)) {
                processed[key] = await this.processData(value);
            }
            return processed;
        }

        return data;
    }

    /**
     * Calculate total size of data
     */
    private calculateSize(data: unknown): number {
        if (data instanceof Blob || data instanceof File) {
            return data.size;
        }

        if (typeof data === 'string') {
            return new Blob([data]).size;
        }

        if (Array.isArray(data)) {
            return data.reduce((total: number, item) => total + this.calculateSize(item), 0);
        }

        if (data && typeof data === 'object') {
            return Object.values(data).reduce((total: number, value) => total + this.calculateSize(value), 0);
        }

        return 0;
    }

    /**
     * Add new data
     */
    async add<T = unknown>(
        id: string | number,
        data: T,
        options: AddOptions = {}
    ): Promise<StoredItem<T>> {
        await this.init();

        // Process and optimize blobs
        const processedData = await this.processData(data) as T;

        // Check total size
        const totalSize = this.calculateSize(processedData);
        if (totalSize > this.MAX_SIZE_BYTES) {
            throw new Error(
                `Data size ${(totalSize / 1024 / 1024).toFixed(2)}MB exceeds ${this.MAX_SIZE_MB}MB limit after compression`
            );
        }

        const now = Date.now();
        const item: StoredItem<T> = {
            id,
            data: processedData,
            createdAt: now,
            expiresAt: options.expiresIn ? now + options.expiresIn : undefined,
            metadata: options.metadata
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add(item);

            request.onsuccess = () => resolve(item);
            request.onerror = () => reject(new Error(`Failed to add item: ${request.error}`));
        });
    }

    /**
     * Get data by ID
     */
    async get<T = unknown>(id: string | number): Promise<StoredItem<T> | null> {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                const item = request.result as StoredItem<T> | undefined;

                if (!item) {
                    resolve(null);
                    return;
                }

                // Check if expired
                if (item.expiresAt && item.expiresAt < Date.now()) {
                    this.delete(id); // Auto-delete expired
                    resolve(null);
                    return;
                }

                resolve(item);
            };

            request.onerror = () => reject(new Error(`Failed to get item: ${request.error}`));
        });
    }

    /**
     * Get all data
     */
    async getAll<T = unknown>(): Promise<StoredItem<T>[]> {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const items = request.result as StoredItem<T>[];
                const now = Date.now();

                // Filter out expired items
                const validItems = items.filter(item => {
                    if (item.expiresAt && item.expiresAt < now) {
                        this.delete(item.id); // Auto-delete expired
                        return false;
                    }
                    return true;
                });

                resolve(validItems);
            };

            request.onerror = () => reject(new Error(`Failed to get all items: ${request.error}`));
        });
    }

    /**
     * Update existing data
     */
    async update<T = unknown>(
        id: string | number,
        data: Partial<T>,
        options: AddOptions = {}
    ): Promise<StoredItem<T>> {
        await this.init();

        // Get existing item
        const existing = await this.get<T>(id);
        if (!existing) {
            throw new Error(`Item with id ${id} not found`);
        }

        // Process and optimize new data
        const processedData = await this.processData(data) as Partial<T>;

        // Merge data
        const mergedData = { ...existing.data as object, ...processedData as object } as T;

        // Check total size
        const totalSize = this.calculateSize(mergedData);
        if (totalSize > this.MAX_SIZE_BYTES) {
            throw new Error(
                `Updated data size ${(totalSize / 1024 / 1024).toFixed(2)}MB exceeds ${this.MAX_SIZE_MB}MB limit`
            );
        }

        const now = Date.now();
        const updatedItem: StoredItem<T> = {
            ...existing,
            data: mergedData,
            expiresAt: options.expiresIn ? now + options.expiresIn : existing.expiresAt,
            metadata: options.metadata ? { ...existing.metadata, ...options.metadata } : existing.metadata
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(updatedItem);

            request.onsuccess = () => resolve(updatedItem);
            request.onerror = () => reject(new Error(`Failed to update item: ${request.error}`));
        });
    }

    /**
     * Delete data by ID
     */
    async delete(id: string | number): Promise<void> {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error(`Failed to delete item: ${request.error}`));
        });
    }

    /**
     * Delete all data
     */
    async clear(): Promise<void> {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error(`Failed to clear store: ${request.error}`));
        });
    }

    /**
     * Cleanup expired data
     */
    async cleanupExpired(): Promise<number> {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('expiresAt');
            const now = Date.now();
            const range = IDBKeyRange.upperBound(now);
            const request = index.openCursor(range);
            let deletedCount = 0;

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    cursor.delete();
                    deletedCount++;
                    cursor.continue();
                } else {
                    resolve(deletedCount);
                }
            };

            request.onerror = () => reject(new Error(`Failed to cleanup: ${request.error}`));
        });
    }

    /**
     * Get storage usage statistics
     */
    async getStats(): Promise<{
        totalItems: number;
        totalSizeMB: number;
        expiredItems: number;
    }> {
        await this.init();

        const allItems = await this.getAll();
        const now = Date.now();

        let totalSize = 0;
        let expiredItems = 0;

        allItems.forEach(item => {
            totalSize += this.calculateSize(item.data);
            if (item.expiresAt && item.expiresAt < now) {
                expiredItems++;
            }
        });

        return {
            totalItems: allItems.length,
            totalSizeMB: parseFloat((totalSize / 1024 / 1024).toFixed(2)),
            expiredItems
        };
    }

    /**
     * Close database connection
     */
    close(): void {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

// Export singleton instance
export default IndexedDBHelper;

// Example usage:
/*
const db = new IndexedDBHelper('MyApp', 'photos', 1);

// Add data with expiry (1 hour)
await db.add('photo-1', {
  file: photoBlob,
  caption: 'My Photo',
  tags: ['vacation', 'beach']
}, {
  expiresIn: 60 * 60 * 1000, // 1 hour
  metadata: { uploadedBy: 'user123' }
});

// Get data
const photo = await db.get('photo-1');
console.log(photo?.data);

// Update data
await db.update('photo-1', {
  caption: 'Updated Caption'
});

// Delete data
await db.delete('photo-1');

// Get stats
const stats = await db.getStats();
console.log(stats);

// Cleanup expired
const cleaned = await db.cleanupExpired();
console.log(`Cleaned ${cleaned} expired items`);
*/