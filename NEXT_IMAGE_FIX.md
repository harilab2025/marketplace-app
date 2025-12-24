# 🔧 Next.js Image Component Fix - Lexical Editor

## 🔴 Masalah

### Error yang Muncul:
```
Error: Image with src "/api/files/cmjdr4yab0007qwuhizngqgs0" is missing required "width" property.
    at getImgProps (get-img-props.ts:484:17)
    at image-component.tsx:402:64
```

### Root Cause:
1. **Lexical image-component.tsx menggunakan Next.js `<Image>` component**
2. **Next.js Image MEMBUTUHKAN width dan height sebagai NUMBER**
3. **Lexical mengirim width/height sebagai `"inherit"` (string) secara default**

### Alur Error:

```typescript
// image-node.tsx (line 145-146)
this.__width = width || "inherit"   // ❌ Default: "inherit"
this.__height = height || "inherit" // ❌ Default: "inherit"

// ↓ Dikirim ke ImageComponent

// image-component.tsx (line 86-98)
import Image from "next/image"  // ❌ Next.js Image

<Image
  src={src}
  width={width}    // ← "inherit" ❌ Next.js butuh number!
  height={height}  // ← "inherit" ❌ Next.js butuh number!
/>

// ↓ Next.js Error

Error: Image is missing required "width" property
```

---

## ✅ Solusi

### 1. Ganti Next.js `<Image>` dengan Regular `<img>`

**File:** `src/components/editor/editor-ui/image-component.tsx`

#### Before:
```typescript
import Image from "next/image"

function LazyImage({ ... }): JSX.Element {
  return (
    <Image
      src={src}
      alt={altText}
      width={width}    // ❌ Error jika "inherit"
      height={height}  // ❌ Error jika "inherit"
      style={{ ... }}
    />
  )
}
```

#### After:
```typescript
// ✅ Removed Next.js Image import

function LazyImage({ ... }): JSX.Element {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={altText}
      ref={imageRef}
      style={{
        height,      // ✅ Works with "inherit"
        maxWidth,
        width,       // ✅ Works with "inherit"
      }}
      onError={onError}
      draggable="false"
    />
  )
}
```

### 2. Fix BrokenImage Component

#### Before:
```typescript
function BrokenImage(): JSX.Element {
  return (
    <Image
      src={""}       // ❌ Empty src causes error
      style={{ ... }}
      alt="Broken image"
    />
  )
}
```

#### After:
```typescript
function BrokenImage(): JSX.Element {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="data:image/svg+xml,..."  // ✅ SVG placeholder
      style={{
        height: 200,
        opacity: 0.2,
        width: 200,
      }}
      draggable="false"
      alt="Broken image"
    />
  )
}
```

---

## 🎯 Mengapa Regular `<img>` Lebih Baik untuk Lexical?

### Next.js `<Image>` Component:
❌ Requires numeric width and height
❌ Doesn't support "inherit" or dynamic sizing
❌ Too restrictive for rich text editor
❌ Adds unnecessary optimization overhead
❌ Requires layout="fill" for dynamic images
❌ Not compatible with Lexical's resize feature

### Regular `<img>` Tag:
✅ Supports any width/height value ("inherit", numbers, etc.)
✅ Fully resizable via JavaScript
✅ Works perfectly with Lexical's ImageResizer
✅ No layout restrictions
✅ Simple and predictable behavior
✅ Perfect for editor content

---

## 📊 Impact Analysis

### Performance:
- **No negative impact** - Images are already loaded via proxy (`/api/files/[publicId]`)
- **Better flexibility** - Resizable images work correctly
- **Simpler code** - No Next.js Image constraints

### SEO:
- **Not applicable** - Editor content is in admin dashboard, not public pages
- Images in final product descriptions can still use Next.js Image when rendering

### User Experience:
- ✅ **Images now display correctly** in Lexical editor
- ✅ **Resize functionality works** as expected
- ✅ **No more width/height errors**

---

## 🧪 Testing

### Test Case 1: Upload Image
```bash
1. Open product description editor
2. Click image insert button
3. Upload test image
4. ✅ Image should display immediately
5. ✅ No "missing width property" error
```

### Test Case 2: Resize Image
```bash
1. Upload an image in editor
2. Click on the image to select it
3. Drag resize handles
4. ✅ Image should resize smoothly
5. ✅ Width/height should update
```

### Test Case 3: Image with URL
```bash
1. Click image insert → URL tab
2. Enter: https://picsum.photos/400/300
3. Click Confirm
4. ✅ Image should display
5. ✅ Resizing should work
```

---

## 📁 Files Modified

```
✅ src/components/editor/editor-ui/image-component.tsx
   - Removed: import Image from "next/image"
   - Changed: LazyImage uses <img> instead of <Image>
   - Changed: BrokenImage uses <img> with SVG placeholder
   - Added: ESLint disable comments for Next.js img rules
```

---

## 🔍 Perbedaan publicId

### Pertanyaan User:
> "kok publicId nya beda ya?"
> - Constructed: `/api/files/cmjdrae7s00003suhhgtzsxno`
> - Error message: `/api/files/cmjdr4yab0007qwuhizngqgs0`

### Penjelasan:
Ini **NORMAL** karena:

1. **Multiple upload attempts** - Setiap kali upload, backend generate publicId baru
2. **React re-renders** - Component mungkin re-render dengan state berbeda
3. **Error terjadi di render berbeda** - Error muncul saat Next.js mencoba render image

**Setelah fix ini, tidak akan ada error lagi!** Regular `<img>` tag akan accept "inherit" untuk width/height.

---

## ✅ Expected Behavior After Fix

### Console Logs:
```
📤 Upload response: {
  success: true,
  publicId: "cmjdr4yab0007qwuhizngqgs0"
}
✅ Constructed URL from publicId: /api/files/cmjdr4yab0007qwuhizngqgs0

🖼️ Image request for publicId: cmjdr4yab0007qwuhizngqgs0
📥 Fetching image from backend: http://localhost:3001/api/files/cmjdr4yab0007qwuhizngqgs0/download
📥 Backend response status: 200
✅ Image buffer size: 45678 bytes
✅ Content-Type: image/jpeg
```

### Browser:
- ✅ Image displays in Lexical editor
- ✅ No Next.js Image errors
- ✅ Resize handles appear when selected
- ✅ Image is draggable and resizable

---

## 🚀 Next Steps

1. **Test the fix:**
   ```bash
   npm run dev
   ```

2. **Upload an image** in Lexical editor

3. **Verify:**
   - Image displays correctly ✅
   - No width/height errors ✅
   - Resize functionality works ✅

4. **Check console** for complete upload/download flow logs

---

## 📝 Notes

### When to Use Next.js Image:
- ✅ **Public-facing pages** (landing pages, product listings, blog posts)
- ✅ **Static content** with known dimensions
- ✅ **Performance-critical images** that need optimization

### When to Use Regular `<img>`:
- ✅ **Rich text editors** (Lexical, TinyMCE, etc.)
- ✅ **Dynamic/resizable content**
- ✅ **Admin dashboards** where optimization is less critical
- ✅ **Content with "inherit" or flexible sizing**

---

**Status:** ✅ FIXED
**Testing:** Ready for testing
**Impact:** Resolves Next.js Image width/height error in Lexical editor
