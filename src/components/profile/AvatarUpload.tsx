"use client";

import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface AvatarUploadProps {
    currentAvatar: string | null;
    userName: string;
    onUploadSuccess: (newAvatarUrl: string) => void;
}

export default function AvatarUpload({ currentAvatar, userName, onUploadSuccess }: AvatarUploadProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file');
            return;
        }

        try {
            setIsUploading(true);

            // Create FormData
            const formData = new FormData();
            formData.append('avatar', selectedFile);

            // Upload to backend
            const response = await apiClient.post('/users/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.status === 'success') {
                const newAvatarUrl = response.data.data.avatar;
                toast.success('Avatar uploaded successfully');
                onUploadSuccess(newAvatarUrl);
                handleClose();
            }
        } catch (error: unknown) {
            const message = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : 'Failed to upload avatar';
            toast.error(message || 'Failed to upload avatar');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            setIsUploading(true);

            const response = await apiClient.delete('/users/avatar');

            if (response.data.status === 'success') {
                toast.success('Avatar removed successfully');
                onUploadSuccess('');
                handleClose();
            }
        } catch (error: unknown) {
            const message = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : 'Failed to remove avatar';
            toast.error(message || 'Failed to remove avatar');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setIsDialogOpen(false);
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            {/* Camera Button */}
            <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                title="Change avatar"
            >
                <Camera className="h-4 w-4" />
            </button>

            {/* Upload Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={handleClose}
                    ></div>

                    {/* Dialog */}
                    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Change Avatar</h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={isUploading}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Current/Preview Avatar */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-40 h-40 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold overflow-hidden">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : currentAvatar ? (
                                    <Image
                                        src={currentAvatar}
                                        alt={userName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    userName.charAt(0).toUpperCase()
                                )}
                            </div>
                            {previewUrl && (
                                <p className="text-sm text-gray-600 mt-2">Preview</p>
                            )}
                        </div>

                        {/* File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {/* Actions */}
                        <div className="space-y-3">
                            {!selectedFile && (
                                <>
                                    <Button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="w-full"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose Image
                                    </Button>

                                    {currentAvatar && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleRemoveAvatar}
                                            disabled={isUploading}
                                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Removing...
                                                </>
                                            ) : (
                                                <>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Remove Avatar
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </>
                            )}

                            {selectedFile && (
                                <>
                                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">Selected:</span> {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Size: {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                        className="w-full"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload Avatar
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                        disabled={isUploading}
                                        className="w-full"
                                    >
                                        Choose Different Image
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* File Requirements */}
                        <div className="mt-4 bg-gray-50 rounded-md p-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">Image Requirements:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li className="flex items-center gap-1">
                                    <span className="text-gray-400">•</span>
                                    Supported formats: JPG, PNG, GIF, WebP
                                </li>
                                <li className="flex items-center gap-1">
                                    <span className="text-gray-400">•</span>
                                    Maximum file size: 5MB
                                </li>
                                <li className="flex items-center gap-1">
                                    <span className="text-gray-400">•</span>
                                    Recommended: Square image (1:1 ratio)
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
