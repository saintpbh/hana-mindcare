"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const DialogContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
} | null>(null);

export function Dialog({
    children,
    open,
    onOpenChange,
}: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [isOpen, setIsOpen] = React.useState(false);

    // Controlled vs Uncontrolled
    const isControlled = open !== undefined;
    const show = isControlled ? open : isOpen;
    const handleOpenChange = (val: boolean) => {
        if (!isControlled) setIsOpen(val);
        onOpenChange?.(val);
    };

    return (
        <DialogContext.Provider value={{ open: !!show, onOpenChange: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
}

export function DialogContent({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const context = React.useContext(DialogContext);
    if (!context) throw new Error("DialogContent must be used within Dialog");

    return (
        <AnimatePresence>
            {context.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => context.onOpenChange(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "relative bg-white rounded-2xl shadow-xl border border-neutral-100 w-full max-w-lg overflow-hidden bg-background p-6",
                            className
                        )}
                    >
                        {children}
                        <button
                            onClick={() => context.onOpenChange(false)}
                            className="absolute right-4 top-4 rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function DialogHeader({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>
            {children}
        </div>
    );
}

export function DialogTitle({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
            {children}
        </h3>
    );
}

export function DialogDescription({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p className={cn("text-sm text-neutral-500", className)}>
            {children}
        </p>
    );
}
