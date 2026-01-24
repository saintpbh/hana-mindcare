"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { type Client } from "@prisma/client";

interface EditClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedClient: Client) => void;
    client: Client | undefined;
}

export function EditClientModal({ isOpen, onClose, onSave, client }: EditClientModalProps) {
    const [name, setName] = useState("");
    const [englishName, setEnglishName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState<"Male" | "Female">("Female");
    const [contact, setContact] = useState("");
    const [location, setLocation] = useState("");
    const [condition, setCondition] = useState("");
    const [status, setStatus] = useState<"stable" | "attention" | "crisis">("attention");
    const [notes, setNotes] = useState("");

    // Load client data when modal opens
    useEffect(() => {
        if (isOpen && client) {
            setName(client.name);
            setEnglishName(client.englishName || "");
            setAge(client.age.toString());
            setGender(client.gender as "Male" | "Female");
            setContact(client.contact);
            setLocation(client.location || "");
            setCondition(client.condition);
            setStatus(client.status as "stable" | "attention" | "crisis");
            setNotes(client.notes);
        }
    }, [isOpen, client]);

    const handleSave = () => {
        console.log('🔵 EditClientModal handleSave called');
        if (!client || !name || !age || !condition) {
            console.log('❌ Validation failed:', { client: !!client, name, age, condition });
            return;
        }

        const updatedClient: Client = {
            ...client,
            name,
            englishName,
            age: parseInt(age),
            gender,
            contact,
            location,
            condition,
            status,
            notes
        };

        console.log('🔵 Calling onSave with:', updatedClient);
        onSave(updatedClient);
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
                            <h2 className="text-xl font-serif text-[var(--color-midnight-navy)]">정보 수정 (Edit Profile)</h2>
                            <p className="text-sm text-[var(--color-midnight-navy)]/60">내담자 정보를 수정합니다.</p>
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

                        <div className="grid grid-cols-2 gap-4">
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
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">상담 장소 (Location)</label>
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                >
                                    <option value="">(미정)</option>
                                    <option value="선릉 센터">선릉 센터</option>
                                    <option value="양재 센터">양재 센터</option>
                                    <option value="논현 센터">논현 센터</option>
                                </select>
                            </div>
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
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">상태 분류 (Status)</label>
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
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">메모 (Notes)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-3 h-24 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)] resize-none"
                                placeholder="특이사항..."
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
                            onClick={handleSave}
                            disabled={!name || !age || !condition}
                            className={cn(
                                "px-6 py-3 rounded-xl text-white font-medium transition-colors flex items-center gap-2",
                                !name || !age || !condition
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-[var(--color-champagne-gold)] hover:bg-[var(--color-champagne-gold)]/90"
                            )}
                        >
                            저장하기 <Check className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
