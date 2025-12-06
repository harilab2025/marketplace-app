# Troubleshooting Guide

## Masalah: Aplikasi Stuck/Hang saat Navigasi ke Products

### Penyebab:

1. API `/products` tidak tersedia atau tidak merespons
2. Timeout pada request API
3. Token authentication yang tidak valid
4. CORS error pada API eksternal
5. Format response API tidak sesuai

### Solusi yang Sudah Diterapkan:

#### 1. **API Eksternal Configuration**

- Timeout 10 detik untuk API eksternal
- Error handling yang detail untuk berbagai jenis error
- Logging untuk debugging

#### 2. **Konfigurasi API**

```typescript
// src/lib/config.ts
export const AppConfig = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_URL || "https://your-external-api.com/api",
};
```

#### 3. **Axios Configuration**

```typescript
// src/lib/axios.ts
export const apiClient = axios.create({
  baseURL: AppConfig.apiBaseUrl,
  timeout: 10000, // 10 second timeout for external API
  validateStatus: (status) => {
    return status >= 200 && status < 300; // Only accept 2xx status codes
  },
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
```

#### 4. **Redux API Call**

```typescript
// src/store/productsSlice.ts
const res = await apiClient.get(`/products`, {
  params: { page, limit },
  timeout: 10000,
});
return res.data;
```

### Cara Mengatasi:

#### 1. **Setup Environment Variables**

Buat file `.env.local` dengan:

```bash
NEXT_PUBLIC_API_URL=https://your-external-api.com/api
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

#### 2. **Format API Response**

API endpoint `/products` harus mengembalikan:

```json
{
  "items": [
    {
      "productId": "string",
      "name": "string",
      "sku": "string",
      "price": "number",
      "stock": "number",
      "isActive": "boolean",
      "updatedAt": "string (ISO date)"
    }
  ],
  "page": "number",
  "limit": "number",
  "total": "number",
  "totalPages": "number"
}
```

#### 3. **CORS Configuration**

Pastikan API server mengizinkan CORS dari domain aplikasi:

```javascript
// Di server API
app.use(
  cors({
    origin: ["http://localhost:3000", "https://your-domain.com"],
    credentials: true,
  }),
);
```

#### 4. **Authentication**

Jika API memerlukan authentication, pastikan token valid:

```typescript
// Headers akan otomatis ditambahkan
Authorization: Bearer<token>;
```

### Testing:

1. Buka browser developer tools
2. Lihat console untuk:
   - `Fetching products from API: { page, limit }`
   - `API Response: { data }`
   - `API Error: { error }`

### Debugging Steps:

1. **Cek Network Tab**: Lihat request ke API
2. **Cek Console**: Lihat error messages
3. **Test API Manual**: Gunakan curl atau Postman
4. **Cek CORS**: Pastikan tidak ada CORS error
5. **Cek Authentication**: Pastikan token valid

### Status:

✅ **CONFIGURED** - Siap untuk API eksternal
✅ **TIMEOUT** - Request timeout 10 detik
✅ **ERROR HANDLING** - Error handling yang detail
✅ **LOGGING** - Console logging untuk debugging
✅ **CORS READY** - Siap untuk CORS configuration
