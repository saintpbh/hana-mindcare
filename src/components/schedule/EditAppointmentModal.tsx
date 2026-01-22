"use client";

import { useState, useEffect } from "react";
import { X, Clock, Calendar, MapPin, User, Tag, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/contexts/ConfirmContext";

interface EditAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedApt: any) => void;
    onDelete: (id: number) => void;
    appointment: any;
}

export function EditAppointmentModal({ isOpen, onClose, onSave, onDelete, appointment }: EditAppointmentModalProps) {
    const { confirm } = useConfirm();
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (appointment) {
            setFormData({ ...appointment });
        }
    }, [appointment]);

    if (!isOpen || !formData) return null;

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const handleDelete = async () => {
        if (await confirm("정말로 이 상담 세션을 취소하시겠습니까?", {
            title: "세션 취소",
            confirmText: "취소하기",
            variant: "destructive"
        })) {
            onDelete(formData.id);
            onClose();
        }
    }

    const TYPES = ["Intake", "Ongoing", "Crisis"];
    const DAYS = ["월", "화", "수", "목", "금"];

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
                    <div className="p-6 border-b border-[var(--color-midnight-navy)]/5 bg-[var(--color-warm-white)] flex justify-between items-center">
                        <h2 className="text-xl font-serif text-[var(--color-midnight-navy)]">세션 상세 정보 수정</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/60">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Client Name */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">
                                <User className="w-3 h-3" /> 내담자 성명
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)] font-medium text-lg"
                            />
                        </div>

                        {/* Type Selection */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">
                                <Tag className="w-3 h-3" /> 세션 유형
                            </label>
                            <div className="flex gap-2">
                                {TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            handleChange("type", type);
                                            // Auto-update color based on type for consistency
                                            let color = "bg-teal-100 text-teal-900 border-teal-200";
                                            if (type === "Intake") color = "bg-amber-100 text-amber-900 border-amber-200";
                                            if (type === "Crisis") color = "bg-rose-100 text-rose-900 border-rose-200";
                                            handleChange("color", color);
                                        }}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                                            formData.type === type
                                                ? "bg-[var(--color-midnight-navy)] text-white border-[var(--color-midnight-navy)]"
                                                : "bg-white text-[var(--color-midnight-navy)]/60 border-[var(--color-midnight-navy)]/10 hover:bg-[var(--color-midnight-navy)]/5"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Day */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">
                                    <Calendar className="w-3 h-3" /> 요일
                                </label>
                                <select
                                    value={DAYS[formData.day]}
                                    onChange={(e) => handleChange("day", DAYS.indexOf(e.target.value))}
                                    className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                >
                                    {DAYS.map(day => <option key={day} value={day}>{day}요일</option>)}
                                </select>
                            </div>

                            {/* Time */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">
                                    <Clock className="w-3 h-3" /> 시작 시간
                                </label>
                                <select
                                    value={Math.floor(formData.time)}
                                    onChange={(e) => handleChange("time", parseInt(e.target.value))} // Reset minutes if changing hour, simplified
                                    className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                >
                                    {Array.from({ length: 11 }, (_, i) => i + 9).map(h => (
                                        <option key={h} value={h}>{h}:00</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-[var(--color-midnight-navy)]/5 bg-white flex justify-between gap-3">
                        <button
                            onClick={handleDelete}
                            className="px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Trash2 className="w-4 h-4" /> 세션 취소
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] font-medium hover:bg-[var(--color-midnight-navy)]/5 transition-colors"
                            >
                                닫기
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-3 rounded-xl bg-[var(--color-champagne-gold)] text-white font-medium hover:bg-[var(--color-champagne-gold)]/90 transition-colors flex items-center gap-2"
                            >
                                변경사항 저장 <Check className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
