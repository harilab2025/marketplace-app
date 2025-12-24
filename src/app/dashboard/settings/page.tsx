"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Moon, Sun, Globe, Shield, Database, Mail, Smartphone, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    // General Settings
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [language, setLanguage] = useState('en');

    // Notification Settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [orderUpdates, setOrderUpdates] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);

    // Privacy Settings
    const [showProfile, setShowProfile] = useState(true);
    const [showActivity, setShowActivity] = useState(false);

    // Security Settings
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState('30');

    const handleSaveSettings = () => {
        // Here you would normally save to backend
        toast.success('Settings saved successfully');
    };

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
                                <label className="text-sm font-medium text-gray-700 mb-3 block">
                                    <Moon className="h-4 w-4 inline mr-2" />
                                    Theme
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                                            theme === 'light'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Sun className="h-5 w-5 mx-auto mb-1" />
                                        Light
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                                            theme === 'dark'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Moon className="h-5 w-5 mx-auto mb-1" />
                                        Dark
                                    </button>
                                    <button
                                        onClick={() => setTheme('system')}
                                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                                            theme === 'system'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Globe className="h-5 w-5 mx-auto mb-1" />
                                        System
                                    </button>
                                </div>
                            </div>

                            {/* Language */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    <Globe className="h-4 w-4 inline mr-2" />
                                    Language
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="en">English</option>
                                    <option value="id">Bahasa Indonesia</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
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
                                    onClick={() => setEmailNotifications(!emailNotifications)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            emailNotifications ? 'translate-x-6' : 'translate-x-1'
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
                                    onClick={() => setPushNotifications(!pushNotifications)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            pushNotifications ? 'translate-x-6' : 'translate-x-1'
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
                                    onClick={() => setOrderUpdates(!orderUpdates)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        orderUpdates ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            orderUpdates ? 'translate-x-6' : 'translate-x-1'
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
                                    onClick={() => setMarketingEmails(!marketingEmails)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            marketingEmails ? 'translate-x-6' : 'translate-x-1'
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
                                    onClick={() => setShowProfile(!showProfile)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        showProfile ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            showProfile ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Show Activity Status</p>
                                    <p className="text-xs text-gray-500">Let others see when you're online</p>
                                </div>
                                <button
                                    onClick={() => setShowActivity(!showActivity)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        showActivity ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            showActivity ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div id="security" className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security Settings
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b">
                                <div className="flex items-center gap-3">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                                        <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                    variant={twoFactorEnabled ? "default" : "outline"}
                                    size="sm"
                                >
                                    {twoFactorEnabled ? 'Enabled' : 'Enable'}
                                </Button>
                            </div>

                            <div className="py-3">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Session Timeout (minutes)
                                </label>
                                <select
                                    value={sessionTimeout}
                                    onChange={(e) => setSessionTimeout(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="120">2 hours</option>
                                    <option value="0">Never</option>
                                </select>
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
                        <Button variant="outline">
                            Reset to Default
                        </Button>
                        <Button onClick={handleSaveSettings}>
                            Save All Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
