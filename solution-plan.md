# Solution Plan: Fix "window is not defined" Error

## Problem Analysis

The error occurs in `src/app/layout.tsx` at line 118 where the code attempts to access the `window` object directly during server-side rendering. In Next.js, the `window` object is only available in the browser environment, not during server-side rendering, which causes the "window is not defined" error.

Current problematic code:

```tsx
{
  typeof window !== undefined && window?.grecaptcha && (
    <div className="recaptcha-custom-logo">
      <Image
        src="/logo/logo-recpatcha.png"
        className="w-[45px] h-[45px]"
        alt="Custom reCAPTCHA Logo"
        width={70}
        height={60}
      />
    </div>
  );
}
```

## Issues Identified

1. `typeof window !== undefined` is incorrect syntax - it should be `typeof window !== 'undefined'` (comparing with a string)
2. Even with a correct check, accessing `window.grecaptcha` directly during SSR will cause issues
3. The component needs to be client-side only since it depends on browser APIs

## Solution Approach

1. Create a client-side React component that handles the reCAPTCHA logo display
2. Use React's `useEffect` hook to ensure the code only runs in the browser
3. Update the layout file to use this new component instead of direct window access

## Implementation Steps

### Step 1: Create Client-Side Component

Create `src/components/RecaptchaLogo.tsx` with the following content:

```tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function RecaptchaLogo() {
  const [isClient, setIsClient] = useState(false);
  const [hasRecaptcha, setHasRecaptcha] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if grecaptcha is available after component mounts
    if (typeof window !== "undefined" && window.grecaptcha) {
      setHasRecaptcha(true);
    }
  }, []);

  // Only render on client side when grecaptcha is available
  if (!isClient || !hasRecaptcha) {
    return null;
  }

  return (
    <div className="recaptcha-custom-logo">
      <Image
        src="/logo/logo-recpatcha.png"
        className="w-[45px] h-[45px]"
        alt="Custom reCAPTCHA Logo"
        width={70}
        height={60}
      />
    </div>
  );
}
```

### Step 2: Update Layout File

Modify `src/app/layout.tsx` to import and use the new component:

```tsx
// Add this import at the top with other imports
import { RecaptchaLogo } from "@/components/RecaptchaLogo";

// Replace the problematic line (around line 118) with:
<RecaptchaLogo />;
```

## Benefits of This Approach

1. Fixes the "window is not defined" error by ensuring browser-only code runs only in the browser
2. Uses React's `useEffect` hook to properly handle client-side execution
3. Maintains the same visual functionality
4. Follows Next.js best practices for client-side only components
5. Provides a clean separation of concerns

## Alternative Approaches Considered

1. Dynamic imports with `next/dynamic` - Would work but is more complex for this use case
2. Using `typeof window !== 'undefined'` check - Partially fixes the issue but doesn't fully address SSR concerns
3. Moving the code to a client-side only layout - Would work but is overkill for this specific component

The chosen approach is the most straightforward and follows React and Next.js best practices.
