"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
import { AlertCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type ConfirmOptions = {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive" | "info";
};

type ConfirmContextType = {
    confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<{
        message: string;
        options: ConfirmOptions;
        resolve: (value: boolean) => void;
    } | null>(null);

    const confirm = useCallback((message: string, options: ConfirmOptions = {}) => {
        return new Promise<boolean>((resolve) => {
            setConfig({
                message,
                options: {
                    title: options.title || "확인",
                    confirmText: options.confirmText || "예",
                    cancelText: options.cancelText || "아니오",
                    variant: options.variant || "default",
                },
                resolve,
            });
            setIsOpen(true);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (config) {
            config.resolve(true);
            setIsOpen(false);
            // Add a small delay to clear config to allow animation to finish if needed
            setTimeout(() => setConfig(null), 300);
        }
    }, [config]);

    const handleCancel = useCallback(() => {
        if (config) {
            config.resolve(false);
            setIsOpen(false);
            setTimeout(() => setConfig(null), 300);
        }
    }, [config]);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <AnimatePresence>
                {isOpen && config && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={handleCancel}
                        />

                        {/* Dialog */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20"
                            style={{ boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.25)" }}
                        >
                            <div className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                                        config.options.variant === "destructive" ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                                    )}>
                                        {config.options.variant === "destructive" ? (
                                            <AlertCircle className="w-6 h-6" />
                                        ) : (
                                            <HelpCircle className="w-6 h-6" />
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif">
                                        {config.options.title}
                                    </h3>

                                    <p className="text-sm text-slate-500 whitespace-pre-wrap leading-relaxed mb-6">
                                        {config.message}
                                    </p>

                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={handleCancel}
                                            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                                        >
                                            {config.options.cancelText}
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            className={cn(
                                                "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]",
                                                config.options.variant === "destructive"
                                                    ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
                                                    : "bg-[var(--color-midnight-navy)] hover:opacity-90 shadow-indigo-500/20"
                                            )}
                                        >
                                            {config.options.confirmText}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (context === undefined) {
        throw new Error("useConfirm must be used within a ConfirmProvider");
    }
    return context;
}
