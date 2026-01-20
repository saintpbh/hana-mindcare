"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface LinkCopyModalProps {
    isOpen: boolean;
    onClose: () => void;
    link: string;
    title?: string;
    description?: string;
}

export function LinkCopyModal({
    isOpen,
    onClose,
    link,
    title = "링크가 복사되었습니다",
    description = "클립보드에 저장되었습니다.\n원하는 곳에 붙여넣기(Ctrl+V) 하세요."
}: LinkCopyModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm rounded-3xl p-8 bg-white border-0 shadow-2xl">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                        <Check className="w-8 h-8 text-emerald-500" />
                    </div>

                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-serif text-[var(--color-midnight-navy)] mb-2">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-[var(--color-midnight-navy)]/60 whitespace-pre-line">
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6 break-all">
                        <p className="text-xs text-gray-400 font-mono text-center select-all cursor-text" onClick={(e) => (e.target as any).select?.()}>
                            {link}
                        </p>
                    </div>

                    <Button
                        onClick={onClose}
                        className="w-full h-12 rounded-xl bg-[var(--color-midnight-navy)] text-white font-medium hover:bg-[var(--color-midnight-navy)]/90"
                    >
                        확인
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
