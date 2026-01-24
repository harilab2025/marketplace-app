import { TwoFactorSettings } from "@/components/TwoFactorSettings";
import { RecoveryCodesManagement } from "@/components/RecoveryCodesManagement";
import { Shield } from "lucide-react";

export default function SecuritySettingsPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold">Security Settings</h1>
                    </div>
                    <p className="text-gray-600">
                        Manage your account security and two-factor authentication
                    </p>
                </div>

                <div className="space-y-6">
                    <TwoFactorSettings />
                    <RecoveryCodesManagement />
                </div>
            </div>
        </div>
    );
}
