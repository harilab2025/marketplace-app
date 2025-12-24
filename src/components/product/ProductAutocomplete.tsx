'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { getProductSuggestions } from '@/services/fetch/product.fetch';
import { useDebounce } from '@/hooks/useDebounce';

interface ProductAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (suggestion: string) => void;
    placeholder?: string;
    className?: string;
    debounceMs?: number;
}

export function ProductAutocomplete({
    value,
    onChange,
    onSelect,
    placeholder = 'Search products...',
    className = '',
    debounceMs = 300
}: ProductAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const debouncedQuery = useDebounce(value, debounceMs);

    // Fetch suggestions
    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query || query.trim().length < 2) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        try {
            const response = await getProductSuggestions({
                query: query.trim(),
                limit: 5,
                signal: abortControllerRef.current.signal
            });

            if (response.status === 'success' && response.data.suggestions) {
                setSuggestions(response.data.suggestions);
                setShowDropdown(response.data.suggestions.length > 0);
            }
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'name' in error && error.name !== 'AbortError') {
                console.error('Failed to fetch suggestions:', error);
                setSuggestions([]);
                setShowDropdown(false);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch on debounced query change
    useEffect(() => {
        fetchSuggestions(debouncedQuery);
    }, [debouncedQuery, fetchSuggestions]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
                setSelectedIndex(-1);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSelectSuggestion(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Handle suggestion selection
    const handleSelectSuggestion = (suggestion: string) => {
        onChange(suggestion);
        setShowDropdown(false);
        setSelectedIndex(-1);
        if (onSelect) {
            onSelect(suggestion);
        }
    };

    // Clear input
    const handleClear = () => {
        onChange('');
        setSuggestions([]);
        setShowDropdown(false);
        setSelectedIndex(-1);
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setShowDropdown(true);
                        }
                    }}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {/* Loading Spinner */}
                {isLoading && (
                    <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                )}
                {/* Clear Button */}
                {value && !isLoading && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                                index === selectedIndex ? 'bg-blue-50' : ''
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Search className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{suggestion}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
