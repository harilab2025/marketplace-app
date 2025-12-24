# 📸 API Upload Image - Documentation

## 🎯 Overview

API endpoint untuk upload gambar yang compatible dengan backend requirements:
- `file` - File yang akan diupload
- `fileType` - Tipe kategori file (IMAGE, DOCUMENT, etc)
- `isPublic` - Public atau private access
- `metadata` - JSON metadata tentang file
- `tags` - Array tags untuk kategorisasi
- `expiresAt` - Optional expiration date

---

## 📡 Endpoint

```
POST /api/upload/image
Authorization: Required (via NextAuth session)
Content-Type: multipart/form-data
```

---

## 📥 Request Format

### Basic Upload (Default Values)

```typescript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData
});
```

**Default values yang dikirim ke backend:**
```json
{
  "file": <binary>,
  "fileType": "IMAGE",
  "isPublic": "true",
  "metadata": {
    "originalName": "photo.jpg",
    "uploadedFrom": "lexical-editor",
    "context": "product-description",
    "mimeType": "image/jpeg",
    "size": 524288,
    "uploadedAt": "2025-12-20T10:30:00Z",
    "uploadedBy": "user_abc123"
  },
  "tags": ["product", "description", "image"]
}
```

### Custom Upload (Override Values)

```typescript
const formData = new FormData();
formData.append('file', imageFile);

// Custom file type
formData.append('fileType', 'PRODUCT_IMAGE');

// Custom public/private setting
formData.append('isPublic', 'false');

// Custom metadata (akan di-merge dengan default)
const metadata = {
  productId: 'prod_123',
  category: 'electronics',
  customField: 'custom value'
};
formData.append('metadata', JSON.stringify(metadata));

// Custom tags
const tags = ['product', 'featured', 'electronics'];
formData.append('tags', JSON.stringify(tags));

// Optional: Set expiration
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
formData.append('expiresAt', expiresAt.toISOString());

const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData
});
```

---

## 📤 Response Format

### Success Response

```json
{
  "success": true,
  "url": "https://yoursite.com/uploads/file_123.jpg",
  "publicId": "file_abc123",
  "message": "Image uploaded successfully"
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized - No session"
}
```

#### 400 Bad Request - No File
```json
{
  "error": "No file provided"
}
```

#### 400 Bad Request - Invalid Type
```json
{
  "error": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
}
```

#### 400 Bad Request - File Too Large
```json
{
  "error": "File too large. Maximum size is 5MB."
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 🔒 Validation Rules

### Frontend Validation

```typescript
✅ File Type: image/jpeg, image/jpg, image/png, image/gif, image/webp
✅ File Size: Max 5MB (5,242,880 bytes)
✅ Authentication: Required (NextAuth session)
```

### Field Requirements

| Field | Required | Type | Default | Notes |
|-------|----------|------|---------|-------|
| `file` | ✅ Yes | File | - | The image file |
| `fileType` | ⚠️ Auto | String | "IMAGE" | Can be customized |
| `isPublic` | ⚠️ Auto | String | "true" | "true" or "false" |
| `metadata` | ⚠️ Auto | JSON String | Auto-generated | Merged with custom |
| `tags` | ⚠️ Auto | JSON Array | ["product","description","image"] | Can override |
| `expiresAt` | ❌ Optional | ISO Date String | null | No expiration if omitted |

---

## 🎨 Usage Examples

### 1. Lexical Editor Upload (Default)

```typescript
// Already implemented in images-plugin.tsx
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.url || `/api/files/${data.publicId}`;
};
```

### 2. Product Image Upload (Custom Metadata)

```typescript
const uploadProductImage = async (file: File, productId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', 'PRODUCT_IMAGE');

  const metadata = {
    productId,
    uploadedFrom: 'product-form',
    context: 'product-main-image'
  };
  formData.append('metadata', JSON.stringify(metadata));

  const tags = ['product', 'main-image', productId];
  formData.append('tags', JSON.stringify(tags));

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });

  return await response.json();
};
```

### 3. Temporary Upload with Expiration

```typescript
const uploadTemporaryImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', 'TEMP_IMAGE');
  formData.append('isPublic', 'false');

  // Expire in 24 hours
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  formData.append('expiresAt', expiresAt.toISOString());

  const tags = ['temporary', 'draft'];
  formData.append('tags', JSON.stringify(tags));

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });

  return await response.json();
};
```

### 4. Avatar Upload

```typescript
const uploadAvatar = async (file: File, userId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', 'AVATAR');
  formData.append('isPublic', 'true');

  const metadata = {
    userId,
    uploadedFrom: 'profile-settings',
    context: 'user-avatar',
    resized: true // If you resize before upload
  };
  formData.append('metadata', JSON.stringify(metadata));

  const tags = ['avatar', 'user', userId];
  formData.append('tags', JSON.stringify(tags));

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });

  return await response.json();
};
```

---

## 🔄 Backend Communication Flow

```
Frontend Request
    ↓
[/api/upload/image]
    ↓
Validate Session ✅
    ↓
Validate File (type, size) ✅
    ↓
Get Token from Session ✅
    ↓
Prepare FormData with:
  - file
  - fileType (default: IMAGE)
  - isPublic (default: true)
  - metadata (auto + custom merge)
  - tags (default or custom)
  - expiresAt (optional)
    ↓
Forward to Backend
POST {BACKEND_URL}/files/upload
Authorization: Bearer {token}
    ↓
Backend Response:
{
  "status": "success",
  "data": {
    "url": "...",
    "publicId": "..."
  }
}
    ↓
Return to Frontend:
{
  "success": true,
  "url": "...",
  "publicId": "..."
}
```

---

## 🛠️ Backend Expected Request

Your backend should receive:

```
POST /api/files/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
  file: <binary>
  fileType: "IMAGE"
  isPublic: "true"
  metadata: '{"originalName":"photo.jpg","uploadedFrom":"lexical-editor",...}'
  tags: '["product","description","image"]'
  expiresAt: "2025-01-20T10:30:00Z" (optional)
```

**Backend Response Expected:**

```json
{
  "status": "success",
  "data": {
    "url": "https://yoursite.com/uploads/file_123.jpg",
    "publicId": "file_abc123",
    "filename": "file_123.jpg",
    "size": 524288,
    "mimeType": "image/jpeg",
    "fileType": "IMAGE",
    "isPublic": true,
    "metadata": { ... },
    "tags": ["product", "description", "image"],
    "expiresAt": null,
    "createdAt": "2025-12-20T10:30:00Z"
  }
}
```

---

## 📊 Metadata Structure

### Default Metadata

```json
{
  "originalName": "photo.jpg",
  "uploadedFrom": "lexical-editor",
  "context": "product-description",
  "mimeType": "image/jpeg",
  "size": 524288,
  "uploadedAt": "2025-12-20T10:30:00Z",
  "uploadedBy": "user_abc123"
}
```

### Merged with Custom Metadata

If you send:
```json
{
  "productId": "prod_123",
  "category": "electronics"
}
```

Final metadata sent to backend:
```json
{
  "originalName": "photo.jpg",
  "uploadedFrom": "lexical-editor",
  "context": "product-description",
  "mimeType": "image/jpeg",
  "size": 524288,
  "uploadedAt": "2025-12-20T10:30:00Z",
  "uploadedBy": "user_abc123",
  "productId": "prod_123",
  "category": "electronics"
}
```

---

## 🏷️ Tags Usage

### Default Tags
```json
["product", "description", "image"]
```

### Custom Tags Examples

**Product Main Image:**
```json
["product", "main-image", "featured", "prod_123"]
```

**Category Banner:**
```json
["category", "banner", "electronics"]
```

**User Avatar:**
```json
["avatar", "user", "user_abc123"]
```

**Temporary Upload:**
```json
["temporary", "draft", "unpublished"]
```

### Tag Best Practices

1. **Be Specific** - Use descriptive tags
2. **Consistent Naming** - Use kebab-case or camelCase consistently
3. **Include IDs** - Add product/user IDs for easy filtering
4. **Context Tags** - Add context (main-image, thumbnail, banner)
5. **Status Tags** - Add status (featured, draft, archived)

---

## ⏰ Expiration Handling

### No Expiration (Default)
```typescript
// Don't send expiresAt field
// Backend will set it as null
```

### Expire in X Days
```typescript
const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

formData.append('expiresAt', daysFromNow(30)); // 30 days
```

### Expire at Specific Date
```typescript
const specificDate = new Date('2025-12-31T23:59:59Z');
formData.append('expiresAt', specificDate.toISOString());
```

### Temporary Files (24 hours)
```typescript
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24);
formData.append('expiresAt', expiresAt.toISOString());
```

---

## 🔐 Security Notes

### Frontend Validation
- ✅ File type whitelist
- ✅ File size limit (5MB)
- ✅ Session authentication
- ✅ MIME type validation

### Backend Should Also Validate
- ⚠️ Re-validate file type (MIME sniffing)
- ⚠️ Re-validate file size
- ⚠️ Scan for malware
- ⚠️ Verify user permissions
- ⚠️ Rate limiting
- ⚠️ Storage quota check

### Sensitive Data
- ❌ Never include passwords in metadata
- ❌ Never include API keys in metadata
- ❌ Don't expose internal paths
- ✅ Use user IDs, not email addresses
- ✅ Sanitize all metadata values

---

## 🧪 Testing

### Test Cases

```typescript
// 1. Valid upload
✅ Upload JPEG < 5MB → Success

// 2. Invalid file type
❌ Upload PDF → Error: Invalid file type

// 3. File too large
❌ Upload 10MB image → Error: File too large

// 4. No authentication
❌ Upload without session → Error: Unauthorized

// 5. Custom metadata
✅ Upload with custom metadata → Merged correctly

// 6. Custom tags
✅ Upload with custom tags → Override defaults

// 7. With expiration
✅ Upload with expiresAt → Set correctly

// 8. No file
❌ POST without file → Error: No file provided
```

### Manual Testing

```bash
# Using curl
curl -X POST http://localhost:3005/api/upload/image \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "fileType=PRODUCT_IMAGE" \
  -F "isPublic=true" \
  -F 'metadata={"productId":"prod_123"}' \
  -F 'tags=["product","featured"]'
```

---

## 📚 Related Files

- **API Route:** `/app/api/upload/image/route.ts`
- **Lexical Plugin:** `/components/editor/plugins/images-plugin.tsx`
- **Usage Example:** See Lexical editor in product create/edit forms

---

## 🆘 Troubleshooting

### Error: "No file provided"
**Cause:** File not attached to FormData
**Solution:** Ensure `formData.append('file', fileObject)`

### Error: "Invalid file type"
**Cause:** File is not an image
**Solution:** Only upload JPEG, PNG, GIF, or WebP

### Error: "File too large"
**Cause:** File > 5MB
**Solution:** Resize or compress image before upload

### Error: "Unauthorized"
**Cause:** No session or invalid session
**Solution:** Ensure user is logged in

### Backend returns 413 (Payload Too Large)
**Cause:** Backend has stricter size limit
**Solution:** Adjust backend configuration

### Metadata not merged correctly
**Cause:** Invalid JSON in metadata field
**Solution:** Ensure `JSON.stringify()` is used

---

## ✅ Summary

| Feature | Status |
|---------|--------|
| ✅ File upload to backend | Implemented |
| ✅ fileType field | Supported (default: IMAGE) |
| ✅ isPublic field | Supported (default: true) |
| ✅ metadata field | Auto-generated + custom merge |
| ✅ tags field | Supported (default + custom) |
| ✅ expiresAt field | Optional |
| ✅ Validation (type, size) | Implemented |
| ✅ Authentication | Required (NextAuth) |
| ✅ Error handling | Comprehensive |
| ✅ Lexical integration | Working |

**Your upload API is now fully compatible with your backend requirements!** 🎉
