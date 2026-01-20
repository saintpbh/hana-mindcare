"use client";

import { useState, useMemo } from "react";
import { User, Activity, Calendar as CalendarIcon, Check, ChevronRight, X, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getLocations, addLocation } from "@/app/actions/locations";
import { useEffect } from "react";

interface IntakeWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (data: any) => void;
    existingAppointments: any[];
}

export function IntakeWizard({ isOpen, onClose, onComplete, existingAppointments }: IntakeWizardProps) {
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    // Form State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [concern, setConcern] = useState("불안 (Anxiety)");
    const [notes, setNotes] = useState("");
    const [selectedDay, setSelectedDay] = useState("Mon");
    const [selectedTime, setSelectedTime] = useState("10");
    const [location, setLocation] = useState("");
    const [savedLocations, setSavedLocations] = useState<string[]>([]);

    useEffect(() => {
        const fetchLocs = async () => {
            const res = await getLocations();
            if (res.success && res.data) {
                setSavedLocations(res.data.map((l: any) => l.name));
            }
        };
        fetchLocs();
    }, []);

    const dayMap: Record<string, number> = { "Mon": 0, "Tue": 1, "Wed": 2, "Thu": 3, "Fri": 4 };

    // Check for conflicts
    const isTimeSlotTaken = useMemo(() => {
        const dayIndex = dayMap[selectedDay];
        const timeIndex = parseInt(selectedTime);

        return existingAppointments.some(apt => {
            // Simple overlap check (assuming 1 hour slots for now for simplicity of the check)
            // A real robust check would consider duration, but this suffices for the grid logic
            return apt.day === dayIndex && Math.abs(apt.time - timeIndex) < 1;
        });
    }, [selectedDay, selectedTime, existingAppointments]);

    const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps));

    const handleComplete = () => {
        if (isTimeSlotTaken) return;

        const intakeData = {
            name,
            phone,
            email,
            concern,
            notes,
            selectedDay,
            selectedTime: parseInt(selectedTime),
            location,
            duration: 1
        };

        onComplete(intakeData);
        onClose();
        // Reset form
        setStep(1);
        setName("");
        setPhone("");
        setLocation("");
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
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
                >
                    {/* Header / Progress */}
                    <div className="p-8 border-b border-[var(--color-midnight-navy)]/5 bg-[var(--color-warm-white)]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-serif text-[var(--color-midnight-navy)]">신규 내담자 접수</h2>
                                <p className="text-sm text-[var(--color-midnight-navy)]/60">Concierge Intake</p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/60">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Steps */}
                        <div className="flex items-center gap-4">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center gap-2 flex-1">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                                        s <= step
                                            ? "bg-[var(--color-midnight-navy)] text-white"
                                            : "bg-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)]/40"
                                    )}>
                                        {s < step ? <Check className="w-4 h-4" /> : s}
                                    </div>
                                    <div className={cn(
                                        "h-1 flex-1 rounded-full transition-colors",
                                        s < totalSteps
                                            ? (s < step ? "bg-[var(--color-midnight-navy)]" : "bg-[var(--color-midnight-navy)]/10")
                                            : "hidden" // Hide bar after last step
                                    )} />
                                </div>
                            ))}
                            <div className="hidden last:block ml-2 text-xs font-medium text-[var(--color-midnight-navy)]/60 uppercase tracking-widest">
                                {step === 1 ? "기본 정보" : step === 2 ? "임상 정보" : "일정 예약"}
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8 overflow-y-auto flex-1">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">성명 (Full Name)</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                        placeholder="홍길동"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">전화번호 (Phone)</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                            placeholder="010-1234-5678"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">이메일 (Email)</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                            placeholder="user@example.com"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">호소 문제 (Primary Concern)</label>
                                    <select
                                        value={concern}
                                        onChange={(e) => setConcern(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                    >
                                        <option>불안 (Anxiety)</option>
                                        <option>우울 (Depression)</option>
                                        <option>대인관계 문제 (Relationship Issues)</option>
                                        <option>직무 스트레스 (Career Stress)</option>
                                        <option>트라우마 (Trauma)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full p-3 h-32 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)] resize-none"
                                        placeholder="내담자 특이사항..."
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-[var(--color-champagne-gold)]/10 rounded-full flex items-center justify-center mx-auto text-[var(--color-champagne-gold)] mb-2">
                                        <CalendarIcon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-medium text-[var(--color-midnight-navy)]">첫 세션 예약</h3>
                                    <p className="text-sm text-[var(--color-midnight-navy)]/60">{name || "내담자"}님의 초기 면담 일정을 선택하세요.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">요일 (Day)</label>
                                        <select
                                            value={selectedDay}
                                            onChange={(e) => setSelectedDay(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]"
                                        >
                                            <option value="Mon">월요일</option>
                                            <option value="Tue">화요일</option>
                                            <option value="Wed">수요일</option>
                                            <option value="Thu">목요일</option>
                                            <option value="Fri">금요일</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">시간 (Time)</label>
                                        <CustomTimeSelect
                                            value={selectedTime}
                                            onChange={setSelectedTime}
                                            dayIndex={dayMap[selectedDay]}
                                            existingAppointments={existingAppointments}
                                        />
                                    </div>
                                </div>

                                {/* Location Input */}
                                <div className="space-y-2 relative">
                                    <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">상담 장소 (Location @)</label>
                                    <LocationInput
                                        value={location}
                                        onChange={setLocation}
                                        onSave={async (loc) => {
                                            if (!savedLocations.includes(loc)) {
                                                const res = await addLocation(loc);
                                                if (res.success) {
                                                    setSavedLocations([...savedLocations, loc]);
                                                }
                                            }
                                        }}
                                        suggestions={savedLocations}
                                    />
                                </div>

                                {/* Status Message */}
                                <div className={cn(
                                    "flex items-center gap-2 p-4 rounded-xl text-sm transition-colors",
                                    isTimeSlotTaken
                                        ? "bg-red-50 text-red-600 border border-red-100"
                                        : "bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]"
                                )}>
                                    {isTimeSlotTaken ? (
                                        <>
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span><strong>예약 불가:</strong> 선택하신 시간대는 이미 예약이 있습니다.</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-4 h-4 shrink-0" />
                                            <span>
                                                <strong>{selectedDay} {selectedTime}:00</strong>에 <strong>초기 면담</strong> 일정을 잡습니다.
                                                {location && <span className="block text-xs mt-1 text-[var(--color-midnight-navy)]/60">@ {location}</span>}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-[var(--color-midnight-navy)]/5 bg-white flex justify-end gap-3">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="px-6 py-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] font-medium hover:bg-[var(--color-midnight-navy)]/5 transition-colors"
                            >
                                이전
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-3 rounded-xl bg-[var(--color-midnight-navy)] text-white font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-colors flex items-center gap-2"
                            >
                                다음 <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={isTimeSlotTaken}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-white font-medium transition-colors flex items-center gap-2",
                                    isTimeSlotTaken
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-[var(--color-champagne-gold)] hover:bg-[var(--color-champagne-gold)]/90"
                                )}
                            >
                                예약 확정 <Check className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function LocationInput({ value, onChange, onSave, suggestions }: { value: string, onChange: (v: string) => void, onSave: (v: string) => void, suggestions: string[] }) {
    const [isOpen, setIsOpen] = useState(false);

    // Filter suggestions based on input (excluding the '@' prefix if user typed it)
    const searchTerm = value;
    const filtered = suggestions.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setIsOpen(true);
                }}
                onBlur={() => {
                    // Save on blur if it's a new value and not empty
                    if (value.trim()) {
                        onSave(value.trim());
                    }
                    // Delay hiding suggestions to allow click
                    setTimeout(() => setIsOpen(false), 200);
                }}
                onFocus={() => setIsOpen(true)}
                className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)] focus:outline-none focus:border-[var(--color-midnight-navy)] transition-colors"
                placeholder="상담 장소를 입력하거나 선택하세요"
            />
            {isOpen && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[var(--color-midnight-navy)]/10 max-h-48 overflow-y-auto z-20">
                    {filtered.map(s => (
                        <button
                            key={s}
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur
                                onChange(s);
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-midnight-navy)]/5 transition-colors text-[var(--color-midnight-navy)]"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function CustomTimeSelect({ value, onChange, dayIndex, existingAppointments }: {
    value: string;
    onChange: (val: string) => void;
    dayIndex: number;
    existingAppointments: any[]
}) {
    const [isOpen, setIsOpen] = useState(false);

    // 9AM to 5PM
    const options = [9, 10, 11, 12, 13, 14, 15, 16, 17];

    const isTaken = (hour: number) => {
        return existingAppointments.some(apt => apt.day === dayIndex && Math.abs(apt.time - hour) < 1);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)] text-left flex items-center justify-between"
            >
                <span>{value}:00 {parseInt(value) >= 12 ? 'PM' : 'AM'}</span>
                <ChevronRight className={cn("w-4 h-4 transition-transform", isOpen && "rotate-90")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[var(--color-midnight-navy)]/10 max-h-48 overflow-y-auto z-20"
                        >
                            {options.map(hour => {
                                const busy = isTaken(hour);
                                return (
                                    <button
                                        key={hour}
                                        onClick={() => {
                                            onChange(hour.toString());
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-midnight-navy)]/5 transition-colors flex items-center justify-between",
                                            value === hour.toString() && "bg-[var(--color-midnight-navy)]/5 font-medium",
                                            busy ? "text-red-500" : "text-[var(--color-midnight-navy)]"
                                        )}
                                    >
                                        <span>{hour}:00 {hour >= 12 ? 'PM' : 'AM'}</span>
                                        {busy && <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Busy</span>}
                                    </button>
                                );
                            })}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
