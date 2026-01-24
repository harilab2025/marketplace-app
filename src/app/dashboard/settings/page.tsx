"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Bell, Moon, Sun, Globe, Shield, Database, Mail, Smartphone, Lock, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';
import { useTheme } from 'next-themes';
import { SettingsService, UserSettings } from '@/services/settings.service';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const { data: session } = useSession();

    // Settings state
    const [settings, setSettings] = useState<UserSettings>({
        language: 'en',
        timezone: 'UTC',
        emailNotifications: true,
        pushNotifications: true,
        orderUpdates: true,
        marketingEmails: false,
        showProfile: true,
        showActivity: false,
        sessionTimeout: 30,
    });

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load settings function with useCallback
    const loadSettings = useCallback(async () => {
        const accessToken = (session as { accessToken?: string })?.accessToken;
        if (!accessToken) return;

        setIsLoading(true);
        try {
            const data = await SettingsService.getSettings(accessToken);
            setSettings(data);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load settings';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    // Mount effect
    useEffect(() => {
        setMounted(true);
        const accessToken = (session as { accessToken?: string })?.accessToken;
        if (accessToken) {
            loadSettings();
        }
    }, [session, loadSettings]);

    const handleSaveSettings = async () => {
        const accessToken = (session as { accessToken?: string })?.accessToken;
        if (!accessToken) {
            toast.error('You must be logged in');
            return;
        }

        setIsSaving(true);
        try {
            await SettingsService.updateSettings(accessToken, settings);
            toast.success('Settings saved successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save settings';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetSettings = async () => {
        const accessToken = (session as { accessToken?: string })?.accessToken;
        if (!accessToken) {
            toast.error('You must be logged in');
            return;
        }

        setIsSaving(true);
        try {
            const data = await SettingsService.resetSettings(accessToken);
            setSettings(data);
            toast.success('Settings reset to default');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to reset settings';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-full px-2 sm:px-4 lg:px-6">
                {/* Header Skeleton */}
                <div className="mb-6">
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Navigation Skeleton */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="mb-3">
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {[1, 2, 3, 4].map((section) => (
                            <div key={section} className="bg-white rounded-lg shadow-sm border p-6">
                                <Skeleton className="h-6 w-48 mb-4" />
                                <div className="space-y-4">
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full px-2 sm:px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="text-gray-600 text-sm mt-1">Manage your application preferences and account settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-4">
                        <nav className="space-y-1">
                            <a href="#general" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
                                <Sun className="h-5 w-5" />
                                General
                            </a>
                            <a href="#notifications" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                                <Bell className="h-5 w-5" />
                                Notifications
                            </a>
                            <a href="#privacy" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                                <Eye className="h-5 w-5" />
                                Privacy
                            </a>
                            <a href="#security" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                                <Shield className="h-5 w-5" />
                                Security
                            </a>
                            <a href="#data" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                                <Database className="h-5 w-5" />
                                Data & Storage
                            </a>
                        </nav>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Settings */}
                    <div id="general" className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Sun className="h-5 w-5" />
                            General Settings
                        </h2>

                        <div className="space-y-6">
                            {/* Theme */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                                    <Moon className="h-4 w-4 inline mr-2" />
                                    Theme
                                </label>
                                {mounted ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                                                theme === 'light'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            <Sun className="h-5 w-5 mx-auto mb-1" />
                                            Light
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                                                theme === 'dark'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            <Moon className="h-5 w-5 mx-auto mb-1" />
                                            Dark
                                        </button>
                                        <button
                                            onClick={() => setTheme('system')}
                                            className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                                                theme === 'system'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            <Globe className="h-5 w-5 mx-auto mb-1" />
                                            System
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 border-2 border-gray-200 rounded-lg animate-pulse bg-gray-100 h-20"></div>
                                        <div className="p-3 border-2 border-gray-200 rounded-lg animate-pulse bg-gray-100 h-20"></div>
                                        <div className="p-3 border-2 border-gray-200 rounded-lg animate-pulse bg-gray-100 h-20"></div>
                                    </div>
                                )}
                            </div>

                            {/* Language */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    <Globe className="h-4 w-4 inline mr-2" />
                                    Language
                                </label>
                                {mounted ? (
                                    <select
                                        value={settings.language}
                                        onChange={(e) => updateSetting('language', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="en">English</option>
                                        <option value="id">Bahasa Indonesia</option>
                                        <option value="es">Español</option>
                                        <option value="fr">Français</option>
                                    </select>
                                ) : (
                                    <div className="w-full h-10 border border-gray-300 rounded-md animate-pulse bg-gray-100"></div>
                                )}
                            </div>

                            {/* Timezone */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    <Globe className="h-4 w-4 inline mr-2" />
                                    Timezone
                                </label>
                                <select
                                    value={settings.timezone}
                                    onChange={(e) => updateSetting('timezone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                                    <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                                    <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                                    <option value="America/New_York">America/New York (EST)</option>
                                    <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
                                    <option value="Europe/London">Europe/London (GMT)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div id="notifications" className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notification Preferences
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                                        <p className="text-xs text-gray-500">Receive notifications via email</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                                        <p className="text-xs text-gray-500">Receive push notifications on your device</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateSetting('pushNotifications', !settings.pushNotifications)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b">
                                <div className="flex items-center gap-3">
                                    <Bell className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Order Updates</p>
                                        <p className="text-xs text-gray-500">Get notified about order status changes</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateSetting('orderUpdates', !settings.orderUpdates)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.orderUpdates ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.orderUpdates ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Marketing Emails</p>
                                        <p className="text-xs text-gray-500">Receive promotional content and offers</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateSetting('marketingEmails', !settings.marketingEmails)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Privacy */}
                    <div id="privacy" className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Privacy Settings
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Show Profile</p>
                                    <p className="text-xs text-gray-500">Make your profile visible to other users</p>
                                </div>
                                <button
                                    onClick={() => updateSetting('showProfile', !settings.showProfile)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.showProfile ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.showProfile ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Show Activity Status</p>
                                    <p className="text-xs text-gray-500">Let others see when you&apos;re online</p>
                                </div>
                                <button
                                    onClick={() => updateSetting('showActivity', !settings.showActivity)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.showActivity ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.showActivity ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div id="security" className="space-y-6">
                        {/* Change Password */}
                        <ChangePasswordForm />

                        {/* Other Security Settings */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Session Settings
                            </h2>

                            <div className="space-y-4">
                                <div className="py-3">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        <Lock className="h-4 w-4 inline mr-2" />
                                        Session Timeout (minutes)
                                    </label>
                                    <select
                                        value={settings.sessionTimeout}
                                        onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={15}>15 minutes</option>
                                        <option value={30}>30 minutes</option>
                                        <option value={60}>1 hour</option>
                                        <option value={120}>2 hours</option>
                                        <option value={0}>Never</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Automatically log out after this period of inactivity
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data & Storage */}
                    <div id="data" className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Data & Storage
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Clear Cache</p>
                                    <p className="text-xs text-gray-500">Remove temporary files to free up space</p>
                                </div>
                                <Button variant="outline" size="sm">
                                    Clear
                                </Button>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Download Your Data</p>
                                    <p className="text-xs text-gray-500">Get a copy of your account data</p>
                                </div>
                                <Button variant="outline" size="sm">
                                    Download
                                </Button>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-sm font-medium text-red-600">Delete Account</p>
                                    <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
                                </div>
                                <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={handleResetSettings}
                            disabled={isSaving}
                        >
                            Reset to Default
                        </Button>
                        <Button
                            onClick={handleSaveSettings}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save All Changes'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
