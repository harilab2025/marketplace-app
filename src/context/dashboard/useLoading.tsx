// components/LoadingProvider.tsx
"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingOptions {
    message?: string;
    backdrop?: boolean;
    spinner?: 'default' | 'dots' | 'pulse' | 'ring';
    size?: 'sm' | 'md' | 'lg';
}

interface LoadingContextType {
    isLoading: boolean;
    showLoading: (options?: LoadingOptions) => void;
    hideLoading: () => void;
    withLoading: <T>(
        asyncFn: () => Promise<T>,
        options?: LoadingOptions
    ) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

const Spinner: React.FC<{
    type: 'default' | 'dots' | 'pulse' | 'ring';
    size: 'sm' | 'md' | 'lg';
}> = ({ type, size }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const sizeClass = sizeClasses[size];

    switch (type) {
        case 'dots':
            return (
                <div className="flex space-x-1">
                    <div className={`${sizeClass} bg-blue-500 rounded-full animate-bounce`}></div>
                    <div className={`${sizeClass} bg-blue-500 rounded-full animate-bounce delay-100`}></div>
                    <div className={`${sizeClass} bg-blue-500 rounded-full animate-bounce delay-200`}></div>
                </div>
            );

        case 'pulse':
            return (
                <div className={`${sizeClass} bg-blue-500 rounded-full animate-pulse`}></div>
            );

        case 'ring':
            return (
                <div className={`${sizeClass} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}></div>
            );

        default: // default spinner
            return (
                <div className={`${sizeClass} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}></div>
            );
    }
};

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState<LoadingOptions>({});

    const showLoading = (options: LoadingOptions = {}) => {
        setLoadingOptions({
            message: 'Loading...',
            backdrop: true,
            spinner: 'default',
            size: 'md',
            ...options
        });
        setIsLoading(true);
    };

    const hideLoading = () => {
        setIsLoading(false);
        setLoadingOptions({});
    };

    const withLoading = async <T,>(
        asyncFn: () => Promise<T>,
        options: LoadingOptions = {}
    ): Promise<T> => {
        try {
            showLoading(options);
            const result = await asyncFn();
            return result;
        } finally {
            hideLoading();
        }
    };

    return (
        <LoadingContext.Provider value={{
            isLoading,
            showLoading,
            hideLoading,
            withLoading
        }}>
            {children}

            {/* Loading Overlay */}
            {isLoading && (
                <div className={`
          fixed inset-0 z-50 flex items-center justify-center
          ${loadingOptions.backdrop
                        ? 'bg-black/50 backdrop-blur-lg'
                        : 'pointer-events-none'
                    }
        `}>
                    <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center space-y-4 max-w-sm mx-4">
                        <Spinner
                            type={loadingOptions.spinner || 'default'}
                            size={loadingOptions.size || 'md'}
                        />
                        {loadingOptions.message && (
                            <p className="text-gray-700 text-center font-medium">
                                {loadingOptions.message}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    );
};

export const useLoading = (): LoadingContextType => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

// Hook dengan utility functions
export const useLoadingUtils = () => {
    const { showLoading, hideLoading, withLoading } = useLoading();

    return {
        // Basic loading
        show: showLoading,
        hide: hideLoading,

        // Wrapper untuk async functions
        wrap: withLoading,

        // Predefined loading states
        showSaving: (message = "Saving...") => showLoading({
            message,
            spinner: 'ring',
            size: 'md'
        }),

        showDeleting: (message = "Deleting...") => showLoading({
            message,
            spinner: 'pulse',
            size: 'md'
        }),

        showUploading: (message = "Uploading...") => showLoading({
            message,
            spinner: 'dots',
            size: 'lg'
        }),

        showProcessing: (message = "Processing...") => showLoading({
            message,
            spinner: 'ring',
            size: 'lg'
        }),

        // Manual control dengan timeout
        showWithTimeout: (duration: number, options?: LoadingOptions) => {
            showLoading(options);
            setTimeout(hideLoading, duration);
        }
    };
};

// Contoh penggunaan di komponen

// Manual Control:
// const { showLoading, hideLoading } = useLoading();

// showLoading({
//   message: 'Processing...',
//   spinner: 'ring',
//   size: 'lg'
// });
// // ... async operation
// hideLoading();

// AutoWrap:
// const { withLoading } = useLoading();

// const result = await withLoading(
//   () => apiCall(),
//   { message: 'Loading...' }
// );

// Predefined States:
// const { showSaving, showDeleting, showUploading } = useLoadingUtils();

// showSaving('Saving data...');
// showDeleting('Deleting item...');
// showUploading('Uploading file...');