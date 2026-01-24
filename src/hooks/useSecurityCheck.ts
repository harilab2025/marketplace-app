'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SecurityCheckProps {
  securityLevel?: string;
  twoFactorEnabled?: boolean;
}

export function useSecurityCheck({ securityLevel, twoFactorEnabled }: SecurityCheckProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if we should show the security prompt
    // Only show once per session using sessionStorage
    const hasShownPrompt = sessionStorage.getItem('securityPromptShown');

    if (securityLevel === 'BASIC' && !hasShownPrompt) {
      // Show toast notification
      toast.warning('Security Alert', {
        description: 'Your account security is set to BASIC. We recommend enabling 2FA for better protection.',
        duration: 8000,
        action: {
          label: 'Upgrade Security',
          onClick: () => router.push('/dashboard/settings/security'),
        },
      });

      // Mark as shown for this session
      sessionStorage.setItem('securityPromptShown', 'true');
    }
  }, [securityLevel, twoFactorEnabled, router]);
}
