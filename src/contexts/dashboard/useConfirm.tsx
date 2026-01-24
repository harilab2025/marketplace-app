"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
    title?: string;
    description?: string;
    cancelText?: string;
    confirmText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface ConfirmDialogContextType {
    showConfirm: (props: ConfirmDialogProps) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export const ConfirmDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dialogProps, setDialogProps] = useState<ConfirmDialogProps>({});
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const showConfirm = (props: ConfirmDialogProps): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialogProps(props);
            setResolvePromise(() => resolve);
            setIsOpen(true);
        });
    };

    const handleConfirm = () => {
        dialogProps.onConfirm?.();
        setIsOpen(false);
        resolvePromise?.(true);
        setResolvePromise(null);
    };

    const handleCancel = () => {
        dialogProps.onCancel?.();
        setIsOpen(false);
        resolvePromise?.(false);
        setResolvePromise(null);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            handleCancel();
        }
    };

    return (
        <ConfirmDialogContext.Provider value={{ showConfirm }}>
            {children}
            <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {dialogProps.title || "Are you absolutely sure?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogProps.description || "This action cannot be undone. This will permanently delete your account and remove your data from our servers."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>
                            {dialogProps.cancelText || "Cancel"}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>
                            {dialogProps.confirmText || "Continue"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ConfirmDialogContext.Provider>
    );
};

export const useConfirmDialog = (): ConfirmDialogContextType => {
    const context = useContext(ConfirmDialogContext);
    if (!context) {
        throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
    }
    return context;
};

// Hook alternatif untuk kemudahan penggunaan
export const useConfirm = () => {
    const { showConfirm } = useConfirmDialog();

    return {
        confirm: showConfirm,
        // Shorthand untuk kasus umum
        confirmDelete: (itemName?: string) => showConfirm({
            title: "Delete Confirmation",
            description: `Are you sure you want to delete ${itemName || 'this item'}? This action cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel"
        }),
        confirmAction: (action: string, description?: string) => showConfirm({
            title: `Confirm ${action}`,
            description: description || `Are you sure you want to ${action.toLowerCase()}?`,
            confirmText: action,
            cancelText: "Cancel"
        })
    };
};

// // Untuk delete confirmation
// const result = await confirmDelete("user account");

// // Untuk custom confirmation
// const result = await confirm({
//   title: "Custom Title",
//   description: "Custom description",
//   confirmText: "Yes",
//   cancelText: "No"
// });

// // Untuk action confirmation
// const result = await confirmAction("Logout", "You will be signed out.");