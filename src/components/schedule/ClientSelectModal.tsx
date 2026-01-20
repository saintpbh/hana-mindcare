"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Search } from "lucide-react";

interface ClientSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectNew: () => void;
    onSelectExisting: () => void;
}

export function ClientSelectModal({ isOpen, onClose, onSelectNew, onSelectExisting }: ClientSelectModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 p-8"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        {/* Header */}
                        <h2 className="text-2xl font-serif text-[var(--color-midnight-navy)] mb-2">
                            일정 추가하기
                        </h2>
                        <p className="text-sm text-[var(--color-midnight-navy)]/60 mb-8">
                            누구의 일정을 추가하시겠어요?
                        </p>

                        {/* Options */}
                        <div className="space-y-4">
                            {/* New Client */}
                            <button
                                onClick={onSelectNew}
                                className="w-full p-6 rounded-2xl border-2 border-[var(--color-midnight-navy)]/10 hover:border-[var(--color-midnight-navy)]/30 hover:bg-[var(--color-midnight-navy)]/5 transition-all text-left group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                        <UserPlus className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-[var(--color-midnight-navy)] mb-1">
                                            🆕 신규 내담자
                                        </h3>
                                        <p className="text-sm text-[var(--color-midnight-navy)]/60">
                                            새로운 내담자를 등록하고<br />첫 상담 일정을 잡습니다
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* Existing Client */}
                            <button
                                onClick={onSelectExisting}
                                className="w-full p-6 rounded-2xl border-2 border-[var(--color-midnight-navy)]/10 hover:border-[var(--color-midnight-navy)]/30 hover:bg-[var(--color-midnight-navy)]/5 transition-all text-left group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                        <Search className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-[var(--color-midnight-navy)] mb-1">
                                            👤 기존 내담자
                                        </h3>
                                        <p className="text-sm text-[var(--color-midnight-navy)]/60">
                                            이미 등록된 내담자의<br />추가 상담 일정을 잡습니다
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
