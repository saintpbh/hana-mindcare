"use client";

import { useState } from "react";
import { X, Send, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Client } from "@/data/mockClients";
import { sendSMS } from "@/services/smsService";

interface MessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | undefined;
}

const TEMPLATES = [
    { label: "예약 리마인드", text: "상담 예약이 내일 예정되어 있습니다. 시간 맞춰 방문 부탁드립니다." },
    { label: "상담 후 안부", text: "오늘 상담은 어떠셨나요? 편안한 저녁 되시길 바랍니다." },
    { label: "일정 변경 안내", text: "안녕하세요, 하나 마인드케어입니다. 요청하신 대로 일정이 변경되었습니다." },
    { label: "과제 확인", text: "이번 주 과제는 잘 진행되고 계신가요? 어려움이 있으시면 언제든 말씀해주세요." },
];

export function MessageModal({ isOpen, onClose, client }: MessageModalProps) {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!client || !message) return;

        setIsSending(true);
        try {
            const response = await sendSMS({
                to: client.contact,
                body: message,
                type: "LMS" // Default to LMS for generated messages
            });

            if (response.success) {
                alert(`[전송 완료] ${client.name}님에게 메시지를 보냈습니다.`);
                onClose();
                setMessage("");
            } else {
                alert("메시지 전송에 실패했습니다.");
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("오류가 발생했습니다.");
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[var(--color-midnight-navy)]/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-20"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-[var(--color-midnight-navy)]/5 bg-[var(--color-warm-white)] flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-midnight-navy)]/5 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-[var(--color-midnight-navy)]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif text-[var(--color-midnight-navy)]">문자 전송 (SMS)</h2>
                                <p className="text-sm text-[var(--color-midnight-navy)]/60">
                                    받는 사람: <span className="font-medium text-[var(--color-midnight-navy)]">{client?.name}</span> ({client?.contact})
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/60">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Templates */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">자주 쓰는 문구 (Templates)</label>
                            <div className="flex flex-wrap gap-2">
                                {TEMPLATES.map((template) => (
                                    <button
                                        key={template.label}
                                        onClick={() => setMessage(template.text)}
                                        className="px-3 py-1.5 rounded-lg border border-[var(--color-midnight-navy)]/10 text-xs font-medium text-[var(--color-midnight-navy)]/70 hover:bg-[var(--color-midnight-navy)]/5 hover:text-[var(--color-midnight-navy)] transition-colors"
                                    >
                                        {template.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">메시지 내용</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full p-4 h-40 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)] resize-none focus:outline-none focus:border-[var(--color-midnight-navy)]/30 transition-colors"
                                placeholder="전송할 내용을 입력하세요..."
                            />
                            <div className="flex justify-end">
                                <span className={cn("text-xs", message.length > 80 ? "text-orange-500" : "text-[var(--color-midnight-navy)]/40")}>
                                    {message.length}자 ({message.length > 80 ? "LMS" : "SMS"})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-[var(--color-midnight-navy)]/5 bg-white flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] font-medium hover:bg-[var(--color-midnight-navy)]/5 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={!message || isSending}
                            className={cn(
                                "px-6 py-3 rounded-xl text-white font-medium transition-colors flex items-center gap-2",
                                !message || isSending
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-[var(--color-midnight-navy)] hover:bg-[var(--color-midnight-navy)]/90"
                            )}
                        >
                            {isSending ? "전송 중..." : "전송하기"}
                            {!isSending && <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
