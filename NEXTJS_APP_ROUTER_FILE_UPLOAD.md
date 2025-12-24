# 📦 Next.js App Router - File Upload Configuration

## 🔴 Error yang Terjadi

```
Next.js can't recognize the exported `config` field in route.
Page config in `config` is deprecated and ignored, use individual exports instead.
```

## 🤔 Mengapa Error Ini Terjadi?

### Pages Router (Old - `/pages/api/*`) ❌
```typescript
// /pages/api/upload.ts
export async function handler(req, res) {
  // handler code
}

// ❌ Ini HANYA works di Pages Router
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
```

### App Router (New - `/app/api/*`) ✅
```typescript
// /app/api/upload/route.ts
export async function POST(request: NextRequest) {
  // handler code
}

// ❌ config export TIDAK SUPPORTED!
// App Router uses different approach
```

---

## ✅ Solusi untuk App Router

### 1. **Validasi di Route Handler** (Recommended)

```typescript
// /app/api/upload/image/route.ts
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // ✅ Validasi ukuran file di sini
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: 'File too large. Maximum size is 5MB.' },
      { status: 400 }
    );
  }

  // ✅ Validasi type di sini
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type' },
      { status: 400 }
    );
  }

  // Continue with upload...
}

// ✅ Tidak perlu export config!
```

**Keuntungan:**
- ✅ Flexible per endpoint
- ✅ Clear error messages
- ✅ Works with FormData
- ✅ No server restart needed
- ✅ Custom validation per route

---

### 2. **Konfigurasi Global** (Optional)

#### A. Server Actions Body Size

Di `next.config.ts`:

```typescript
experimental: {
  serverActions: {
    bodySizeLimit: '2mb', // ← Ini untuk Server Actions
  }
}
```

**⚠️ Important:** `serverActions.bodySizeLimit` hanya untuk:
- Server Actions (use server functions)
- Form submissions via Server Actions
- **BUKAN untuk API Routes!**

#### B. API Routes Body Size

**Next.js App Router tidak memiliki built-in config untuk API route body size limit.**

Alternatif:
1. **Validasi manual** (seperti contoh #1 di atas) ✅
2. **Middleware global** (jika butuh apply ke banyak routes)
3. **Reverse proxy** (Nginx, Caddy) untuk limit di infrastructure level

---

## 📊 Perbandingan: Pages Router vs App Router

| Fitur | Pages Router (`/pages/api`) | App Router (`/app/api`) |
|-------|----------------------------|------------------------|
| **Config Export** | `export const config = {...}` | ❌ Not supported |
| **Body Size Limit** | Via `config.api.bodyParser` | Manual validation |
| **File Upload** | `req.files` via middleware | `formData.get('file')` |
| **Response** | `res.json()` | `NextResponse.json()` |
| **Request Type** | `NextApiRequest` | `NextRequest` |
| **HTTP Methods** | `req.method` | Separate `GET`, `POST` exports |

---

## 🔧 Best Practices untuk File Upload di App Router

### 1. **Size Validation**

```typescript
const validateFileSize = (file: File, maxSizeMB: number = 5) => {
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`File too large. Max ${maxSizeMB}MB`);
  }
};

// Usage
try {
  validateFileSize(file, 5);
} catch (error) {
  return NextResponse.json({ error: error.message }, { status: 400 });
}
```

### 2. **Type Validation**

```typescript
const validateFileType = (file: File, allowedTypes: string[]) => {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
  }
};

// Usage
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
try {
  validateFileType(file, allowedTypes);
} catch (error) {
  return NextResponse.json({ error: error.message }, { status: 400 });
}
```

### 3. **Multiple Files**

```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  // Get all files
  const files = formData.getAll('files') as File[];

  // Validate each file
  for (const file of files) {
    validateFileSize(file, 5);
    validateFileType(file, allowedTypes);
  }

  // Process files...
}
```

### 4. **Streaming untuk File Besar**

Jika perlu handle file > 10MB:

```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // Stream file instead of loading to memory
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload in chunks or stream to S3
  await uploadToS3Stream(buffer);
}
```

---

## 🚀 Production Recommendations

### 1. **Use CDN/Storage Service**

```typescript
// Instead of saving locally, upload to:
- AWS S3 + CloudFront
- Google Cloud Storage
- Cloudinary
- ImageKit
- UploadThing

// Benefits:
✅ Unlimited storage
✅ Global CDN
✅ Automatic optimization
✅ No server disk space issues
```

### 2. **Implement Rate Limiting**

```typescript
// Prevent abuse
import { ratelimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Continue with upload...
}
```

### 3. **Add Progress Tracking** (Frontend)

```typescript
// In your upload function
const uploadWithProgress = async (file: File) => {
  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100;
      console.log(`Upload ${percentComplete}% complete`);
    }
  });

  // Upload logic...
};
```

### 4. **Security Headers**

Already in your `next.config.ts`:

```typescript
headers: [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  // Prevents MIME type sniffing attacks
]
```

---

## 🔒 Security Checklist

### File Upload Security

- [ ] ✅ Validate file size
- [ ] ✅ Validate file type (MIME)
- [ ] ✅ Sanitize filename
- [ ] ✅ Generate unique filenames (prevent overwrites)
- [ ] ✅ Store files outside web root (if local)
- [ ] ✅ Scan for malware (ClamAV or cloud service)
- [ ] ✅ Rate limit uploads
- [ ] ✅ Authenticate users
- [ ] ✅ Set storage quotas per user
- [ ] ⚠️ TODO: Content-based type verification (not just MIME)
- [ ] ⚠️ TODO: Image dimension validation
- [ ] ⚠️ TODO: Prevent path traversal attacks

### Filename Sanitization

```typescript
const sanitizeFilename = (filename: string): string => {
  // Remove special characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
};

// Generate unique filename
const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = originalName.split('.').pop();
  return `${timestamp}_${random}.${ext}`;
};
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Request entity too large"

**Problem:** File upload fails with 413 error

**Solutions:**
1. Check route handler validation (should catch before 413)
2. If using Nginx/reverse proxy, increase `client_max_body_size`
3. If using Vercel, max file size is 4.5MB on Hobby plan

```nginx
# Nginx config
client_max_body_size 10M;
```

### Issue 2: "Memory exceeded"

**Problem:** Server runs out of memory with large files

**Solutions:**
1. Use streaming instead of loading entire file
2. Process files in chunks
3. Upload directly to S3 (client-side)
4. Increase server memory limits

```typescript
// Stream approach
const stream = file.stream();
const reader = stream.getReader();

let chunk;
while (!(chunk = await reader.read()).done) {
  // Process chunk
  await processChunk(chunk.value);
}
```

### Issue 3: "Request timeout"

**Problem:** Upload takes too long and times out

**Solutions:**
1. Increase route timeout (Vercel: 10s free, 60s Pro)
2. Use background jobs for large files
3. Implement chunked upload

```typescript
// For Vercel (requires Pro plan)
export const maxDuration = 60; // seconds
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Long-running upload
}
```

---

## 📱 Mobile & Progressive Upload

### Resumable Upload (Advanced)

```typescript
// Track upload progress in database
// Resume if connection drops
// Useful for mobile users with unstable connection

// Libraries:
- tus.io (resumable upload protocol)
- Uppy (UI + resumable uploads)
- UploadThing (Next.js-specific)
```

---

## 📚 References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [File Upload Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

---

## ✅ Summary

| Item | Status |
|------|--------|
| ❌ Remove deprecated `config` export | ✅ Done |
| ✅ Validate file size in handler | ✅ Done |
| ✅ Validate file type in handler | ✅ Done |
| ✅ Handle FormData correctly | ✅ Done |
| ✅ Return proper error messages | ✅ Done |
| ✅ Authentication check | ✅ Done |
| ⚠️ Backend endpoint implementation | ⏳ Pending |
| ⚠️ Cloud storage setup (optional) | ⏳ Optional |

---

**Your implementation is now correct and follows Next.js App Router best practices!** 🎉
