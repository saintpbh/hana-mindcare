"use client";

import { useState } from "react";
import { X, Send, MessageSquare, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
type Client = any;
import { sendMessage } from "@/app/actions/messages";
import { sendSMS } from "@/services/smsService";

interface MessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    clients: any[];
}

const TEMPLATES = [
    { label: "포털 초대", text: "안녕하세요, 하나 마인드케어입니다. 내담자님을 위한 맞춤형 심리 케어 포털 'Hana Companion'이 준비되었습니다. 아래 링크를 통해 오늘의 기분과 변화를 기록해보세요." },
    { label: "예약 리마인드", text: "상담 예약이 내일 예정되어 있습니다. 시간 맞춰 방문 부탁드립니다." },
    { label: "상담 후 안부", text: "오늘 상담은 어떠셨나요? 편안한 저녁 되시길 바랍니다." },
    { label: "과제 확인", text: "이번 주 과제는 잘 진행되고 계신가요? 어려움이 있으시면 언제든 말씀해주세요." },
];

export function MessageModal({ isOpen, onClose, clients = [] }: MessageModalProps) {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [includeMobileLink, setIncludeMobileLink] = useState(true);

    const getFullMessage = (baseMessage: string, client: any) => {
        if (!includeMobileLink) return baseMessage;
        const link = `${window.location.origin}/mobile/${client.portalToken || client.id}`;
        return `${baseMessage}\n\n개인 페이지: ${link}`;
    };

    const handleSend = async () => {
        if (clients.length === 0 || !message) return;

        setIsSending(true);
        let successCount = 0;
        let failCount = 0;

        try {
            // Send to each client
            for (const client of clients) {
                const finalMessage = getFullMessage(message, client);

                // 1. Send SMS (External Service)
                const smsResponse = await sendSMS({
                    to: client.contact,
                    body: finalMessage,
                    type: finalMessage.length > 80 ? "LMS" : "SMS"
                });

                if (smsResponse.success) {
                    // 2. Save to DB Communication History
                    await sendMessage(client.id, finalMessage, "상담사");
                    successCount++;
                } else {
                    failCount++;
                }
            }

            if (failCount === 0) {
                alert(`[전송 완료] ${successCount}명에게 메시지를 보냈습니다.`);
                onClose();
                setMessage("");
            } else {
                alert(`${successCount}명 전송 성공, ${failCount}명 전송 실패했습니다.`);
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
                                    받는 사람: <span className="font-medium text-[var(--color-midnight-navy)]">
                                        {clients.length === 1
                                            ? `${clients[0].name} (${clients[0].contact})`
                                            : `${clients[0]?.name} 외 ${clients.length - 1}명`
                                        }
                                    </span>
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
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => {
                                        // Use the first client's info for the link pattern. If multiple, it might be generic or per-client (complex).
                                        // Assuming single client context usually for "Send Video Link".
                                        if (clients.length > 0) {
                                            const c = clients[0];
                                            const upcoming = c.sessions?.find((s: any) => new Date(s.date) >= new Date() && s.meetingLink);
                                            const link = upcoming?.meetingLink || `https://meet.jit.si/HanaMindcare-${c.name}-${c.id.slice(0, 4)}`;
                                            setMessage(prev => prev + (prev ? "\n" : "") + `[화상 상담 접속]\n${link}`);
                                        }
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    화상 링크 첨부
                                </button>
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
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={cn(
                                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                        includeMobileLink ? "bg-[var(--color-midnight-navy)] border-[var(--color-midnight-navy)]" : "border-gray-300"
                                    )}>
                                        {includeMobileLink && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={includeMobileLink}
                                        onChange={(e) => setIncludeMobileLink(e.target.checked)}
                                    />
                                    <span className="text-xs text-[var(--color-midnight-navy)]/60 group-hover:text-[var(--color-midnight-navy)]">개인 모바일 링크 포함</span>
                                </label>
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
