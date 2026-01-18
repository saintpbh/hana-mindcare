"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { type Client } from "@prisma/client";

interface NewClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => void;
}

export function NewClientModal({ isOpen, onClose, onRegister }: NewClientModalProps) {
    const [name, setName] = useState("");
    const [englishName, setEnglishName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState<"Male" | "Female">("Female");
    const [contact, setContact] = useState("");
    const [condition, setCondition] = useState("");
    const [status, setStatus] = useState<"stable" | "attention" | "crisis">("attention");
    const [notes, setNotes] = useState("");

    const handleRegister = () => {
        if (!name || !age || !condition) return;

        const newClient: Omit<Client, "id" | "createdAt" | "updatedAt"> = {
            name,
            englishName: englishName || null,
            age: parseInt(age),
            gender,
            contact: contact || "010-0000-0000",
            condition,
            status,
            lastSession: "없음",
            nextSession: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // +7 days
            sessionTime: "14:00", // Default time
            isSessionCanceled: false,
            location: null,
            tags: [],
            notes: notes || "상담 초기 단계입니다.",
            terminatedAt: null
        };

        onRegister(newClient);

        // Reset form
        setName("");
        setEnglishName("");
        setAge("");
        setContact("");
        setCondition("");
        setNotes("");
        onClose();
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
                        <div>
                            <h2 className="text-xl font-serif text-[var(--color-midnight-navy)]">신규 내담자 등록</h2>
                            <p className="text-sm text-[var(--color-midnight-navy)]/60">새로운 내담자 정보를 입력해주세요.</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/60">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">성명 (Name)</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                    placeholder="홍길동"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">영문 성명 (Eng Name)</label>
                                <input
                                    type="text"
                                    value={englishName}
                                    onChange={(e) => setEnglishName(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                    placeholder="Gildong Hong"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">나이 (Age)</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                    placeholder="30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">성별 (Gender)</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value as "Male" | "Female")}
                                    className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                >
                                    <option value="Female">여성</option>
                                    <option value="Male">남성</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">연락처 (Contact)</label>
                            <input
                                type="text"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                placeholder="010-1234-5678"
                            />
                        </div>

                        <div className="border-t border-[var(--color-midnight-navy)]/5 my-4" />

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">주요 증상/상태 (Condition)</label>
                            <input
                                type="text"
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                placeholder="예: 우울증, 불안장애, 직무 스트레스"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">초기 상태 분류 (Initial Status)</label>
                            <div className="flex gap-2">
                                {["stable", "attention", "crisis"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatus(s as any)}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-sm font-medium transition-colors border",
                                            status === s
                                                ? "bg-[var(--color-midnight-navy)] text-white border-[var(--color-midnight-navy)]"
                                                : "bg-white text-[var(--color-midnight-navy)]/60 border-[var(--color-midnight-navy)]/10 hover:bg-[var(--color-midnight-navy)]/5"
                                        )}
                                    >
                                        {s === "stable" ? "안정" : s === "attention" ? "주의" : "위기"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">초기 메모 (Notes)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-3 h-24 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)] resize-none"
                                placeholder="특이사항이나 초기 면담 요약..."
                            />
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
                            onClick={handleRegister}
                            disabled={!name || !age || !condition}
                            className={cn(
                                "px-6 py-3 rounded-xl text-white font-medium transition-colors flex items-center gap-2",
                                !name || !age || !condition
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-[var(--color-champagne-gold)] hover:bg-[var(--color-champagne-gold)]/90"
                            )}
                        >
                            등록하기 <Check className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
