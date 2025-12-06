# Konfigurasi API Eksternal

## Setup API Eksternal

### 1. Buat file `.env.local` di root project:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-external-api.com/api

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Development
NODE_ENV=development
```

### 2. Format API Response yang Diharapkan

API endpoint `/products` harus mengembalikan data dalam format:

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

### 3. Headers yang Diperlukan

API harus menerima headers:

- `Content-Type: application/json`
- `Accept: application/json`
- `Authorization: Bearer <token>` (jika diperlukan)

### 4. Error Handling

API harus mengembalikan error dalam format:

```json
{
  "message": "Error message",
  "error": "Error code",
  "status": "number"
}
```

### 5. Testing API

Untuk test API, gunakan curl:

```bash
curl -X GET "https://your-external-api.com/api/products?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Debugging

Buka browser developer tools dan lihat console untuk:

- `Fetching products from API: { page, limit }`
- `API Response: { data }`
- `API Error: { error }`

### 7. Troubleshooting

Jika masih ada masalah:

1. **CORS Error**: Pastikan API server mengizinkan CORS dari domain aplikasi
2. **Authentication Error**: Periksa token dan endpoint auth
3. **Timeout Error**: Periksa koneksi internet dan response time API
4. **Format Error**: Pastikan response format sesuai dengan yang diharapkan

### 8. Status Code yang Didukung

- `200-299`: Success
- `400-499`: Client Error (akan ditampilkan sebagai error message)
- `500+`: Server Error (akan ditampilkan sebagai error message)

