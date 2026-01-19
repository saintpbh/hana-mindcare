"use client";

import { useState } from "react";
import { Send, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPrescription as savePrescription } from "@/app/actions/prescriptions";

interface PrescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    resourceTitle: string;
}

export function PrescriptionModal({ isOpen, onClose, resourceTitle, clientId }: PrescriptionModalProps & { clientId?: string }) {
    const [step, setStep] = useState<"select" | "sent">("select");
    const [note, setNote] = useState("");

    const handleSend = async () => {
        if (clientId) {
            await savePrescription({
                clientId,
                title: resourceTitle,
                type: 'article', // Default
                description: note
            });
        }
        setStep("sent");
        setTimeout(() => {
            onClose();
            setTimeout(() => setStep("select"), 300); // Reset for next time
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={step === "select" ? onClose : undefined}
                        className="absolute inset-0 bg-[var(--color-midnight-navy)]/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 overflow-hidden"
                    >
                        {step === "select" ? (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-full bg-[var(--color-champagne-gold)]/10 text-[var(--color-champagne-gold)]">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[var(--color-midnight-navy)]">콘텐츠 처방하기 (Prescribe Content)</h3>
                                        <p className="text-xs text-[var(--color-midnight-navy)]/60">"{resourceTitle}" 전송 중</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-midnight-navy)] mb-1.5 uppercase">내담자 선택 (Select Patient)</label>
                                        <select className="w-full h-11 px-3 rounded-lg border border-[var(--color-midnight-navy)]/10 text-sm bg-white focus:outline-none focus:border-[var(--color-midnight-navy)] transition-colors">
                                            <option>김민준 (Kim Minjun)</option>
                                            <option>이서연 (Lee Seoyeon)</option>
                                            <option>박지성 (Park Jisung)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-midnight-navy)] mb-1.5 uppercase">개인 메시지 (Personal Note)</label>
                                        <textarea
                                            className="w-full h-24 p-3 rounded-lg border border-[var(--color-midnight-navy)]/10 text-sm focus:outline-none focus:border-[var(--color-midnight-navy)] resize-none transition-colors"
                                            placeholder="내담자에게 보낼 메시지를 입력하세요..."
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSend}
                                    className="w-full py-3 rounded-xl bg-[var(--color-midnight-navy)] text-white font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    처방 전송하기
                                </button>
                            </>
                        ) : (
                            <div className="py-12 flex flex-col items-center text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mb-4"
                                >
                                    <Check className="w-8 h-8" />
                                </motion.div>
                                <h3 className="text-xl font-serif text-[var(--color-midnight-navy)] mb-1">처방이 전송되었습니다.</h3>
                                <p className="text-sm text-[var(--color-midnight-navy)]/60">내담자에게 알림이 발송되었습니다.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
