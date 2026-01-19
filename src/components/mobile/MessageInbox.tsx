"use client";

import { useEffect, useState } from "react";
import { getClientMessages, markMessageRead } from "@/app/actions/messages";
import { format } from "date-fns";
import { MessageCircle, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MessageInboxProps {
    clientId: string;
}

export function MessageInbox({ clientId }: MessageInboxProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMessages = async () => {
        setLoading(true);
        const res = await getClientMessages(clientId);
        if (res.success) setMessages(res.data || []);
        setLoading(false);
    };

    useEffect(() => {
        loadMessages();
    }, [clientId]);

    const handleRead = async (id: string, isRead: boolean) => {
        if (!isRead) {
            await markMessageRead(id);
            setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
        }
    };

    if (loading) return <div className="p-8 text-center text-[var(--color-midnight-navy)]/40 animate-pulse">메시지를 불러오는 중...</div>;

    if (messages.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-16 h-16 rounded-full bg-[var(--color-midnight-navy)]/5 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-[var(--color-midnight-navy)]/20" />
            </div>
            <p className="text-[var(--color-midnight-navy)]/40 text-sm">도착한 메시지가 없습니다.<br />편안한 하루 보내세요.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif text-[var(--color-midnight-navy)]">나눈 대화</h3>
                <span className="text-[10px] bg-[var(--color-midnight-navy)] text-white px-2 py-0.5 rounded-full font-bold">
                    {messages.filter(m => !m.isRead).length} New
                </span>
            </div>

            {messages.map((msg, idx) => (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={msg.id}
                    onClick={() => handleRead(msg.id, msg.isRead)}
                    className={cn(
                        "p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden",
                        msg.isRead
                            ? "bg-white/50 border-[var(--color-midnight-navy)]/5 grayscale-[0.5]"
                            : "bg-white border-[var(--color-midnight-navy)]/10 shadow-md ring-1 ring-[var(--color-midnight-navy)]/5"
                    )}
                >
                    {!msg.isRead && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-[var(--color-champagne-gold)]/20 rounded-bl-full flex items-center justify-end pr-2 pt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-champagne-gold)]" />
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest">{msg.senderName}</span>
                        <span className="text-[10px] text-gray-400">{format(new Date(msg.createdAt), "MM/dd HH:mm")}</span>
                    </div>

                    <p className="text-sm leading-relaxed text-[var(--color-midnight-navy)]">
                        {msg.content}
                    </p>

                    <div className="flex justify-end mt-2">
                        <CheckCheck className={cn("w-3 h-3 transition-colors", msg.isRead ? "text-blue-500" : "text-gray-200")} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
