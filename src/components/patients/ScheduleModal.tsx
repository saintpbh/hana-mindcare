"use client";

import { useState, useEffect } from "react";
import { X, Check, Calendar as CalendarIcon, Clock, MapPin, Video, Phone, Timer, Users } from "lucide-react";
import { cn } from "@/lib/utils";
// import { type Client } from "@prisma/client";
type Client = any;
import { usePersistence } from "@/hooks/usePersistence";
import { getLocations, addLocation } from "@/app/actions/locations";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

import { MessageSquare } from "lucide-react";

const RECURRING_OPTIONS = [
    { id: "None", label: "반복 없음" },
    { id: "Weekly", label: "매주" },
    { id: "BiWeekly", label: "격주" },
    { id: "Monthly", label: "매월" },
] as const;

import { createAppointment } from "@/app/actions/appointments";

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void; // New callback
    client?: Client;
    selectedClient?: Client;
    rescheduleMode?: boolean;
    initialDate?: Date;
}

const TYPES = [
    { id: "in-person", label: "대면 상담", icon: MapPin },
    { id: "online", label: "비대면(영상)", icon: Video },
    { id: "phone", label: "전화 상담", icon: Phone },
];
const DURATIONS = [
    { id: "50", label: "50분" },
    { id: "80", label: "80분" },
    { id: "100", label: "100분" },
];

export function ScheduleModal({ isOpen, onClose, onSuccess, client, selectedClient, rescheduleMode = false, initialDate }: ScheduleModalProps) {
    const activeClient = client || selectedClient;
    // const { clients, updateClient } = usePersistence(); // Legacy

    const [locations, setLocations] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(
        (initialDate ? initialDate.toISOString().split('T')[0] : activeClient?.nextSession) || new Date().toISOString().split('T')[0]
    );
    const [selectedTime, setSelectedTime] = useState<string>(activeClient?.sessionTime || "10:00");
    const [selectedLocation, setSelectedLocation] = useState<string>(activeClient?.location || "");
    const [selectedType, setSelectedType] = useState<string>(activeClient?.sessionType || "in-person");
    const [selectedDuration, setSelectedDuration] = useState<string>("50");
    const [selectedRecurring, setSelectedRecurring] = useState<typeof RECURRING_OPTIONS[number]["id"]>("None");
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [newQuickLocation, setNewQuickLocation] = useState("");

    const [counselors, setCounselors] = useState<any[]>([]);
    const [selectedCounselorId, setSelectedCounselorId] = useState<string>(activeClient?.counselorId || "");

    useEffect(() => {
        const loadCounselors = async () => {
            const { getCounselors } = await import("@/app/actions/counselors");
            const res = await getCounselors();
            if (res.success) setCounselors(res.data || []);

            // If client has no assigned counselor, maybe default to first one? No, explicit choice is better.
            if (!selectedCounselorId && activeClient?.counselorId) {
                setSelectedCounselorId(activeClient.counselorId);
            }
        };
        loadCounselors();
    }, [activeClient]);

    // SMS State
    const [sendSms, setSendSms] = useState(true);

    const fetchLocs = async () => {
        const res = await getLocations();
        if (res.success && res.data && res.data.length > 0) {
            const locNames = res.data.map((l: any) => l.name);
            setLocations(locNames);
            if (!activeClient?.location || !locNames.includes(activeClient.location)) {
                setSelectedLocation(locNames[0]);
            }
        }
    };

    useEffect(() => {
        fetchLocs();
    }, []);

    useEffect(() => {
        if (isOpen && activeClient) {
            setSelectedDate((initialDate ? initialDate.toISOString().split('T')[0] : activeClient.nextSession) || new Date().toISOString().split('T')[0]);
            setSelectedTime(activeClient.sessionTime || "10:00");
            setSelectedLocation(activeClient.location || locations[0] || "");
            setSelectedType(activeClient.sessionType || "in-person");
            setSendSms(true); // Reset to true on open
        }
    }, [isOpen, activeClient, locations, initialDate]);

    if (!isOpen || !activeClient) return null;

    const timeSlots = [
        "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
    ];

    const getSlotStatus = (time: string) => {
        // Todo: Check availability against DB via Server Action
        // For now, assume available or rely on create failure
        return { status: "available", name: null };
    };

    const handleConfirm = async () => {
        if (!activeClient) return;

        // Call Server Action
        const result = await createAppointment({
            clientId: activeClient.id,
            date: selectedDate,
            time: selectedTime,
            type: selectedType,
            duration: parseInt(selectedDuration),
            notes: `Location: ${selectedLocation}`, // Store location in notes for now
            recurring: selectedRecurring,
            counselorId: selectedCounselorId,
            location: selectedLocation // Pass explicit location field
        });

        if (result.success) {
            if (rescheduleMode && sendSms) {
                alert(`[Simulation] SMS sent to ${activeClient.name}: "Your appointment has been rescheduled to ${selectedDate} at ${selectedTime}."`);
            }
            if (onSuccess) onSuccess();
            onClose();
        } else {
            alert("Failed to create appointment.");
        }
    };

    // Simple calendar generation for current/next month
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(currentYear, currentMonth, i + 1);
        return d.toISOString().split('T')[0];
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--color-midnight-navy)]/20 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl border border-[var(--color-midnight-navy)]/5 overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[850px]"
            >
                {/* Left Side: Date & Options */}
                <div className="flex-1 p-6 border-r border-gray-100 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-serif text-[var(--color-midnight-navy)]">
                                {rescheduleMode ? "일정 변경 (Reschedule)" : "상담 예약 설정"}
                            </h2>
                            <p className="text-sm text-[var(--color-midnight-navy)]/50">
                                {activeClient.name} 내담자님의 {rescheduleMode ? "일정을 변경합니다." : "다음 일정을 설정합니다."}
                            </p>
                        </div>
                        {rescheduleMode && (
                            <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-100 flex items-center gap-1">
                                <Timer className="w-3 h-3" /> 일정 변경 모드
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Date Selection */}
                        <section>
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-4 block">1. 날짜 선택</label>
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                                    <span key={d} className="text-[10px] font-bold text-gray-400">{d}</span>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                                {days.map(date => {
                                    const isSelected = selectedDate === date;
                                    const dayNum = date.split('-')[2];
                                    const isToday = date === today.toISOString().split('T')[0];

                                    // Calculate how many events on this day
                                    // const dayEvents = clients.filter(c => c.nextSession === date && !c.isSessionCanceled); // Use appointments prop if available or mock
                                    // simplified for this modal context which might just pick a date

                                    return (
                                        <button
                                            key={date}
                                            onClick={() => setSelectedDate(date)}
                                            className={cn(
                                                "aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all relative",
                                                isSelected
                                                    ? "bg-[var(--color-midnight-navy)] text-white shadow-lg scale-110 z-10"
                                                    : "hover:bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]"
                                            )}
                                        >
                                            <span className="mt-1">{dayNum}</span>
                                            {isToday && !isSelected && (
                                                <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[var(--color-champagne-gold)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section>
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> 상담 장소
                            </label>
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="flex-1 p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]/50 text-sm font-medium text-[var(--color-midnight-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-midnight-navy)]/20"
                                >
                                    {locations.length > 0 ? (
                                        locations.map(loc => <option key={loc} value={loc}>{loc}</option>)
                                    ) : (
                                        <option value="">장소 정보 없음 (설정에서 추가)</option>
                                    )}
                                </select>
                                <AnimatePresence mode="wait">
                                    {isAddingLocation ? (
                                        <motion.div
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: "auto", opacity: 1 }}
                                            exit={{ width: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center gap-2 overflow-hidden"
                                        >
                                            <input
                                                type="text"
                                                value={newQuickLocation}
                                                onChange={(e) => setNewQuickLocation(e.target.value)}
                                                placeholder="새 장소 이름"
                                                className="p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]/50 text-sm font-medium text-[var(--color-midnight-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-midnight-navy)]/20 w-32"
                                            />
                                            <button
                                                onClick={async () => {
                                                    if (newQuickLocation.trim()) {
                                                        await addLocation(newQuickLocation.trim());
                                                        await fetchLocs();
                                                        setSelectedLocation(newQuickLocation.trim());
                                                        setNewQuickLocation("");
                                                        setIsAddingLocation(false);
                                                    }
                                                }}
                                                className="p-3 bg-[var(--color-midnight-navy)] text-white rounded-xl text-sm font-bold"
                                            >
                                                추가
                                            </button>
                                            <button
                                                onClick={() => setIsAddingLocation(false)}
                                                className="p-3 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold"
                                            >
                                                취소
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.button
                                            key="add-button"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            onClick={() => setIsAddingLocation(true)}
                                            className="p-3 bg-[var(--color-midnight-navy)] text-white rounded-xl flex items-center justify-center"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>

                        <section>
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                <Users className="w-3 h-3" /> 담당 상담사
                            </label>
                            <select
                                value={selectedCounselorId}
                                onChange={(e) => setSelectedCounselorId(e.target.value)}
                                className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)]/50 text-sm font-medium text-[var(--color-midnight-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-midnight-navy)]/20"
                            >
                                <option value="">상담사 선택 (선택 안함)</option>
                                {counselors.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name} {c.nickname ? `(${c.nickname})` : ''}</option>
                                ))}
                            </select>
                        </section>

                        <section>
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                <Timer className="w-3 h-3" /> 상담 시간(분)
                            </label>
                            <div className="flex bg-[var(--color-warm-white)]/50 p-1 rounded-xl border border-[var(--color-midnight-navy)]/10">
                                {DURATIONS.map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => setSelectedDuration(d.id)}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                                            selectedDuration === d.id ? "bg-white text-[var(--color-midnight-navy)] shadow-sm" : "text-gray-400"
                                        )}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* New Recurring Section */}
                        <section>
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                <Clock className="w-3 h-3" /> 반복 설정
                            </label>
                            <div className="flex bg-[var(--color-warm-white)]/50 p-1 rounded-xl border border-[var(--color-midnight-navy)]/10">
                                {RECURRING_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSelectedRecurring(opt.id)}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                                            selectedRecurring === opt.id ? "bg-white text-[var(--color-midnight-navy)] shadow-sm" : "text-gray-400"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    <section>
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-3 block">상담 방식</label>
                        <div className="grid grid-cols-3 gap-3">
                            {TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all relative overflow-hidden",
                                        selectedType === type.id
                                            ? "bg-white border-[var(--color-midnight-navy)] shadow-md text-[var(--color-midnight-navy)]"
                                            : "bg-[var(--color-warm-white)]/50 border-transparent text-gray-400 hover:border-[var(--color-midnight-navy)]/10"
                                    )}
                                >
                                    <type.icon className="w-5 h-5" />
                                    <span className="text-[10px] font-bold">{type.label}</span>
                                    {type.id === 'online' && selectedType === 'online' && (
                                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded-bl-lg font-bold">
                                            Zoom Auto
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>
                </div >

                {/* Right Side: Time Picker & Confirm */}
                < div className="w-full md:w-[420px] bg-[var(--color-warm-white)]/30 p-6 flex flex-col overflow-y-auto" >
                    <button
                        onClick={onClose}
                        className="self-end p-2 rounded-full hover:bg-black/5 text-gray-400 mb-4"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-3 block">2. 상세 시간 선택</label>

                    <div className="flex-1 grid grid-cols-3 gap-2 mb-6">
                        {timeSlots.map(time => {
                            const { status, name } = getSlotStatus(time);
                            const isSelected = selectedTime === time;

                            return (
                                <button
                                    key={time}
                                    disabled={status === "busy"}
                                    onClick={() => setSelectedTime(time)}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all relative overflow-hidden group",
                                        status === "busy"
                                            ? "bg-gray-100/50 border-gray-100 text-gray-300 cursor-not-allowed"
                                            : isSelected
                                                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg scale-[1.02]"
                                                : "bg-white border-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)] hover:border-[var(--color-midnight-navy)] shadow-sm"
                                    )}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="text-base font-serif">{time}</span>
                                        {status === "busy" ? (
                                            <span className="text-[10px] font-medium opacity-60">일정 있음: {name}</span>
                                        ) : (
                                            <span className={cn("text-[10px] font-bold uppercase tracking-wider mt-1", isSelected ? "text-emerald-100" : "text-emerald-500")}>
                                                {isSelected ? "선택됨" : "예약 가능"}
                                            </span>
                                        )}
                                    </div>
                                    {isSelected && <Check className="absolute top-2 right-2 w-3 h-3" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Reschedule SMS Preview */}
                    {
                        rescheduleMode && (
                            <div className="mb-6 animate-in slide-in-from-bottom-2">
                                <label className="flex items-center gap-2 mb-2 cursor-pointer group">
                                    <div className={cn("w-5 h-5 rounded-md flex items-center justify-center transition-colors", sendSms ? "bg-[var(--color-midnight-navy)] text-white" : "bg-gray-200 text-transparent")}>
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <input type="checkbox" checked={sendSms} onChange={(e) => setSendSms(e.target.checked)} className="hidden" />
                                    <span className="text-sm font-bold text-[var(--color-midnight-navy)] group-hover:underline">내담자에게 변경 안내 문자 발송</span>
                                </label>

                                {sendSms && (
                                    <div className="bg-white p-3 rounded-2xl border border-[var(--color-midnight-navy)]/10 text-xs text-gray-500 flex gap-3 relative">
                                        <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-[var(--color-midnight-navy)] mb-1">[하나 마인드케어] 예약 변경 안내</div>
                                            {activeClient.name}님, 상담 일정이 아래와 같이 변경되었습니다.<br />
                                            📅 {selectedDate} {selectedTime} <br />
                                            📍 {selectedLocation}<br />
                                            확인 부탁드립니다.
                                        </div>
                                        <div className="absolute top-2 right-3 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">Preview</div>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    <div className="bg-white rounded-2xl p-4 border border-[var(--color-midnight-navy)]/5 shadow-sm mb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-midnight-navy)]/5 flex items-center justify-center font-serif text-[var(--color-midnight-navy)]">
                                {activeClient.name[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-[var(--color-midnight-navy)]">{activeClient.name}</h4>
                                <p className="text-[10px] text-[var(--color-midnight-navy)]/40">{activeClient.englishName}</p>
                            </div>
                        </div>
                        <div className="space-y-2 pt-3 border-t border-gray-50">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">최종 확인</span>
                                <span className="font-bold text-[var(--color-midnight-navy)]">{selectedDate} {selectedTime}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">장소</span>
                                <span className="font-medium text-[var(--color-midnight-navy)]">{selectedLocation}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full py-4 bg-[var(--color-midnight-navy)] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[var(--color-midnight-navy)]/20 hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                        {rescheduleMode ? "일정 변경 및 알림 발송" : "예약 완료하기"}
                    </button>
                </div >
            </motion.div >
        </div >
    );
}
