# 🔧 Backend Fix - isPublic Parsing

## 🔴 Masalah

```typescript
// Current backend code
const { isPublic } = req.body;

const fileData = {
    isPublic: isPublic === true,  // ❌ Always false!
};
```

**Mengapa Error?**
- `req.body.isPublic` dari FormData = string `"true"`
- `"true" === true` = `false`
- Result: isPublic selalu `false` ❌

---

## ✅ Solusi 1: Parse String to Boolean (Recommended)

```typescript
static async uploadFile(req: Request, res: Response) {
    try {
        if (!req.file) {
            return ResponseHandler.error(res, 'No file provided', 400);
        }

        const { fileType, isPublic, metadata, tags, expiresAt } = req.body;
        const userId = (req.user as UserWithMethods | undefined)?.publicId;
        const productId = req.params.productId;

        if (!fileType || !Object.values(IfFileType).includes(fileType as IfFileType)) {
            return ResponseHandler.error(res, 'Invalid file type', 400);
        }

        // ✅ FIX: Parse isPublic from string to boolean
        const parseBoolean = (value: any): boolean => {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') {
                return value.toLowerCase() === 'true';
            }
            return false;
        };

        const fileData = {
            file: req.file,
            fileType: fileType,
            isPublic: parseBoolean(isPublic),  // ✅ Now works correctly!
            metadata: metadata ? JSON.parse(metadata) : {},
            tags: tags ? JSON.parse(tags) : [],
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        };

        const result = await FileService.uploadFile(fileData, userId, productId);

        return ResponseHandler.success(res, 'File uploaded successfully', result, 201);
    } catch (error) {
        logger.error('❌   File upload error:', error);
        return ResponseHandler.error(res, (error as Error).message, 500);
    }
}
```

---

## ✅ Solusi 2: Helper Function (Clean)

```typescript
// Create a helper utility
// utils/parseFormData.ts
export const parseBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
    }
    if (typeof value === 'number') {
        return value === 1;
    }
    return false;
};

// In controller
import { parseBoolean } from '@/utils/parseFormData';

const fileData = {
    file: req.file,
    fileType: fileType,
    isPublic: parseBoolean(isPublic),  // ✅ Clean & reusable
    metadata: metadata ? JSON.parse(metadata) : {},
    tags: tags ? JSON.parse(tags) : [],
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
};
```

---

## ✅ Solusi 3: One-liner (Quick Fix)

```typescript
const fileData = {
    file: req.file,
    fileType: fileType,
    isPublic: String(isPublic).toLowerCase() === 'true',  // ✅ Quick fix
    metadata: metadata ? JSON.parse(metadata) : {},
    tags: tags ? JSON.parse(tags) : [],
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
};
```

---

## 📊 Comparison

| Method | Code Cleanliness | Reusability | Type Safety |
|--------|------------------|-------------|-------------|
| Solusi 1 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Solusi 2 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Solusi 3 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

**Recommendation:** Use **Solusi 2** untuk production code yang clean dan reusable.

---

## 🧪 Testing

### Test Cases

```typescript
parseBoolean('true')    → true  ✅
parseBoolean('TRUE')    → true  ✅
parseBoolean('false')   → false ✅
parseBoolean('FALSE')   → false ✅
parseBoolean(true)      → true  ✅
parseBoolean(false)     → false ✅
parseBoolean('1')       → true  ✅ (if you want this)
parseBoolean('0')       → false ✅
parseBoolean(1)         → true  ✅
parseBoolean(0)         → false ✅
parseBoolean(null)      → false ✅
parseBoolean(undefined) → false ✅
parseBoolean('')        → false ✅
```

---

## 🔄 Alternative: Use JSON Body Instead of FormData

### Frontend
```typescript
// Send as JSON instead of FormData
const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        fileBase64: await fileToBase64(file),
        fileType: 'IMAGE',
        isPublic: true,  // ✅ Real boolean!
        metadata: { ... },
        tags: ['tag1', 'tag2']
    })
});
```

### Backend
```typescript
const { fileBase64, fileType, isPublic } = req.body;
// isPublic is now a real boolean!

const fileData = {
    isPublic: isPublic,  // ✅ Works directly
    // ...
};
```

**⚠️ Warning:** This approach has the base64 problem we discussed earlier!

---

## 📝 Summary

**Problem:** FormData converts all values to strings
**Solution:** Parse string `"true"` to boolean `true` on backend

**Recommended Code:**
```typescript
// Helper function
const parseBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return false;
};

// Usage
isPublic: parseBoolean(isPublic),
```

**Files to Update:**
- Backend controller: `uploadFile` method
- Potentially other controllers that handle FormData booleans

This is a common issue when working with FormData and should be fixed once in a utility function for reuse across your backend.
