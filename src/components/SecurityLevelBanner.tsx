'use client';

import { AlertCircle, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SecurityLevelBannerProps {
  securityLevel: string;
  twoFactorEnabled: boolean;
}

export function SecurityLevelBanner({ securityLevel, twoFactorEnabled }: SecurityLevelBannerProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  // Only show for BASIC level users
  if (securityLevel !== 'BASIC' || dismissed) {
    return null;
  }

  const handleUpgrade = () => {
    router.push('/dashboard/settings/security');
  };

  return (
    <Alert className="border-yellow-200 bg-yellow-50 mb-6 relative">
      <AlertCircle className="h-5 w-5 text-yellow-600" />
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
      <AlertTitle className="text-yellow-800 font-semibold mb-2">
        Security Alert: Your Account Security is Basic
      </AlertTitle>
      <AlertDescription className="text-yellow-700 space-y-3">
        <p>
          Your account security level is currently set to <strong>BASIC</strong>.
          We strongly recommend upgrading your security to protect your account from unauthorized access.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">Recommended Security Improvements:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              {!twoFactorEnabled && (
                <li>Enable Two-Factor Authentication (2FA)</li>
              )}
              <li>Review your trusted devices</li>
              <li>Check recent security activity</li>
              <li>Set up recovery codes</li>
            </ul>
          </div>

          <div className="flex items-center sm:items-start">
            <Button
              onClick={handleUpgrade}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Shield className="mr-2 h-4 w-4" />
              Upgrade Security Now
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
