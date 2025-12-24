# 🔍 Image Display Debugging Guide

## Problem
Images uploaded via Lexical editor are not displaying.

## What I've Added

### 1. Enhanced Logging
I've added comprehensive console logging at every step:

**Upload Route** (`src/app/api/upload/image/route.ts`):
- Logs the complete backend response
- Shows what URL/publicId is extracted

**Lexical Images Plugin** (`src/components/editor/plugins/images-plugin.tsx`):
- Logs the upload response
- Shows which URL is being used (direct URL vs constructed)
- Logs the final image src

**Image Proxy** (`src/app/api/files/[publicId]/route.ts`):
- Logs each image request with publicId
- Shows backend API URL being called
- Logs response status and content type
- Shows image buffer size

### 2. Better Error Handling
- More descriptive error messages
- Backend error details forwarded to frontend

## How to Debug

### Step 1: Test Image Upload
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try uploading an image in Lexical editor
4. Look for these logs:

```
📤 Upload response: { success: true, publicId: "...", url: "..." }
✅ Using direct URL: ... OR ✅ Constructed URL from publicId: /api/files/...
```

**Expected:**
- Either `url` or `publicId` should be present
- No error messages

**If you see errors:**
- Check the error message
- Verify backend is running on `http://localhost:3001`

### Step 2: Check Backend Response
Look for this log in your Next.js server console:
```
📤 Backend upload response: {
  "status": "success",
  "message": "File uploaded successfully",
  "data": {
    "publicId": "abc123",
    "filename": "...",
    // ... other fields
  }
}
```

**What to check:**
- ✅ Does it have `data.publicId`?
- ✅ Does it have `data.url`?
- ❌ Is there an error?

### Step 3: Test Image Display
After upload, check if image displays in Lexical editor.

**If image doesn't display:**
1. Open Network tab in DevTools
2. Look for requests to `/api/files/...`
3. Check the response

**Expected logs in server console:**
```
🖼️ Image request for publicId: abc123
📥 Fetching image from backend: http://localhost:3001/api/files/abc123/download
📥 Backend response status: 200
✅ Image buffer size: 12345 bytes
✅ Content-Type: image/jpeg
```

**Common Issues:**

#### Issue 1: 401 Unauthorized
```
❌ No session found
OR
❌ No token found
```
**Solution:** User not logged in or session expired. Refresh and login again.

#### Issue 2: 404 Not Found
```
❌ Backend error: 404 ...
```
**Solution:** File doesn't exist or wrong publicId. Check backend database.

#### Issue 3: Backend not responding
```
❌ Image proxy error: fetch failed
```
**Solution:**
- Check if backend is running on port 3001
- Verify `NEXT_PUBLIC_API_URL=http://localhost:3001/api` in `.env`

#### Issue 4: Empty response
```
✅ Image buffer size: 0 bytes
```
**Solution:** Backend FileService.downloadFile is not returning file data.

## Verification Checklist

### Backend Checks
- [ ] Backend is running on `http://localhost:3001`
- [ ] Route exists: `GET /api/files/:publicId/download`
- [ ] FileService.downloadFile returns buffer correctly
- [ ] Database has file record with correct publicId
- [ ] File actually exists in storage (Cloudinary/S3/local)

### Frontend Checks
- [ ] `NEXT_PUBLIC_API_URL` is set in `.env`
- [ ] Next.js dev server is running
- [ ] User is logged in with valid session
- [ ] Upload returns `publicId` or `url`
- [ ] Image URL is constructed correctly

## Testing Flow

### 1. Direct Backend Test
Test the backend download endpoint directly:

```bash
# Get your auth token first (check browser DevTools > Application > Cookies)
TOKEN="your-jwt-token-here"

# Upload a file
curl -X POST http://localhost:3001/api/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-image.jpg" \
  -F "fileType=PRODUCT_IMAGE" \
  -F "isPublic=true"

# Note the publicId from response, then download:
curl -X GET http://localhost:3001/api/files/{publicId}/download \
  -H "Authorization: Bearer $TOKEN" \
  --output test-download.jpg

# Check if file was downloaded correctly
ls -lh test-download.jpg
```

### 2. Frontend Proxy Test
If backend works, test the frontend proxy:

```bash
# Open in browser (while logged in):
http://localhost:3000/api/files/{publicId}

# Should display the image
```

### 3. Lexical Editor Test
Upload via the Lexical editor and watch console logs.

## Expected Complete Flow

```
1. User uploads image in Lexical
   📤 Upload response: { publicId: "abc123" }
   ✅ Constructed URL: /api/files/abc123

2. Lexical inserts <img src="/api/files/abc123" />

3. Browser requests /api/files/abc123
   🖼️ Image request for publicId: abc123
   📥 Fetching from: http://localhost:3001/api/files/abc123/download
   📥 Backend response: 200
   ✅ Image buffer: 45678 bytes
   ✅ Content-Type: image/jpeg

4. Image displays in editor ✅
```

## Next Steps

1. **Run the dev server:**
   ```bash
   npm run dev
   ```

2. **Try uploading an image in Lexical editor**

3. **Check the console logs** (both browser and server)

4. **Share the logs with me** if you see errors:
   - What does the upload response show?
   - What's the publicId?
   - What error appears when requesting the image?

5. **Check Network tab**:
   - Is the request to `/api/files/{publicId}` being made?
   - What's the status code?
   - What's the response?

## Common Solutions

### Solution 1: Backend Not Returning URL
If backend only returns `publicId` (not `url`), that's fine! The frontend will construct the URL as `/api/files/${publicId}`.

### Solution 2: CORS Issues
Since we're using Next.js API routes as proxy, there should be no CORS issues. All requests are same-origin.

### Solution 3: File Storage Issue
Backend might be failing to retrieve file from storage (Cloudinary/S3/local). Check:
- Backend logs for FileService errors
- Storage credentials are correct
- File actually exists in storage

### Solution 4: Authentication Issue
The proxy needs a valid session. Make sure:
- User is logged in
- Session hasn't expired
- Token is valid

## What to Share

When reporting the issue, please share:

1. **Upload logs:**
   ```
   📤 Backend upload response: { ... }
   📤 Upload response: { ... }
   ```

2. **Image request logs:**
   ```
   🖼️ Image request for publicId: ...
   📥 Backend response status: ...
   ```

3. **Network tab screenshot** showing the `/api/files/...` request

4. **Any error messages** from console or Network tab

---

**Status:** Debugging tools added ✅
**Next:** Test upload and share logs 📊
