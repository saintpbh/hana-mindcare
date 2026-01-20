"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, FileText, Loader2 } from "lucide-react";
import { addSessionForExistingClient } from "@/app/actions/clients";
import { getLocations } from "@/app/actions/locations";

interface ClientInfo {
    id: string;
    name: string;
    condition: string;
}

interface QuickScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: ClientInfo | null;
    onComplete: (session: any) => void;
    existingAppointments?: any[];
}

export function QuickScheduleModal({ isOpen, onClose, client, onComplete, existingAppointments = [] }: QuickScheduleModalProps) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("14:00");
    const [location, setLocation] = useState("");
    const [type, setType] = useState("정기 상담");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [locations, setLocations] = useState<string[]>([]);

    // Load locations
    useEffect(() => {
        const loadLocations = async () => {
            const result = await getLocations();
            if (result.success && result.data) {
                // Extract location names from objects
                const locationNames = result.data.map((loc: any) => typeof loc === 'string' ? loc : loc.name);
                setLocations(locationNames);
                if (locationNames.length > 0) {
                    setLocation(locationNames[0]);
                }
            }
        };
        loadLocations();
    }, []);

    // Set default date to tomorrow
    useEffect(() => {
        if (isOpen && !date) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setDate(tomorrow.toISOString().split('T')[0]);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!client || !date || !time || !location) {
            alert("필수 항목을 모두 입력해주세요.");
            return;
        }

        setIsSubmitting(true);

        const result = await addSessionForExistingClient({
            clientId: client.id,
            date: new Date(date),
            time,
            location,
            type: type || undefined,
            notes: notes || undefined
        });

        setIsSubmitting(false);

        if (result.success && result.data) {
            onComplete(result.data);
            onClose();
            // Reset form
            setDate("");
            setTime("14:00");
            setType("정기 상담");
            setNotes("");
        } else {
            alert(result.error || "일정 추가에 실패했습니다.");
        }
    };

    if (!client) return null;

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
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 p-8 max-h-[90vh] overflow-y-auto"
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
                            {client.name}님 일정 추가
                        </h2>
                        <p className="text-sm text-[var(--color-midnight-navy)]/60 mb-8">
                            {client.condition}
                        </p>

                        {/* Form */}
                        <div className="space-y-6">
                            {/* Date & Time */}
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-midnight-navy)] mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    날짜 및 시간
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="h-12 px-4 rounded-xl border border-gray-200 text-[var(--color-midnight-navy)] focus:outline-none focus:border-[var(--color-midnight-navy)] focus:ring-2 focus:ring-[var(--color-midnight-navy)]/10"
                                    />
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="h-12 px-4 rounded-xl border border-gray-200 text-[var(--color-midnight-navy)] focus:outline-none focus:border-[var(--color-midnight-navy)] focus:ring-2 focus:ring-[var(--color-midnight-navy)]/10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--color-midnight-navy)] mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    장소
                                </label>
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 text-[var(--color-midnight-navy)] focus:outline-none focus:border-[var(--color-midnight-navy)] focus:ring-2 focus:ring-[var(--color-midnight-navy)]/10"
                                >
                                    {locations.map((loc, index) => (
                                        <option key={index} value={loc}>
                                            {loc}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-midnight-navy)] mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    상담 유형 (선택)
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['정기 상담', 'MMPI 검사', '기타'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setType(t)}
                                            className={`px-3 py-2 rounded-lg text-sm transition-all ${type === t
                                                ? 'bg-[var(--color-midnight-navy)] text-white'
                                                : 'bg-gray-100 text-[var(--color-midnight-navy)]/70 hover:bg-gray-200'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-midnight-navy)] mb-2">
                                    ✏️ 메모 (선택)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder="추가 메모를 입력하세요..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[var(--color-midnight-navy)] placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-midnight-navy)] focus:ring-2 focus:ring-[var(--color-midnight-navy)]/10 resize-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={onClose}
                                className="flex-1 h-12 rounded-xl border border-gray-200 text-[var(--color-midnight-navy)] hover:bg-gray-50 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !date || !time || !location}
                                className="flex-1 h-12 rounded-xl bg-[var(--color-midnight-navy)] text-white hover:bg-[var(--color-midnight-navy)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        추가 중...
                                    </>
                                ) : (
                                    "일정 추가"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
