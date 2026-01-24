"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
    rescheduleSessionId?: string; // Explicit ID for rescheduling
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

const toLocalISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export function ScheduleModal({ isOpen, onClose, onSuccess, client, selectedClient, rescheduleMode = false, rescheduleSessionId, initialDate }: ScheduleModalProps) {
    const activeClient = client || selectedClient;
    // const { clients, updateClient } = usePersistence(); // Legacy

    const [locations, setLocations] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(
        (initialDate ? toLocalISO(initialDate) : activeClient?.nextSession) || toLocalISO(new Date())
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

    // Month navigation state
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [sendSms, setSendSms] = useState(true);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

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
            setSelectedDate((initialDate ? toLocalISO(initialDate) : activeClient.nextSession) || toLocalISO(new Date()));
            setSelectedTime(activeClient.sessionTime || "10:00");
            setSelectedLocation(activeClient.location || locations[0] || "");
            setSelectedType(activeClient.sessionType || "in-person");
            setSendSms(true); // Reset to true on open
        }
    }, [isOpen, activeClient, locations, initialDate]);

    const [busySlots, setBusySlots] = useState<{ time: string, name: string }[]>([]);

    useEffect(() => {
        const fetchAvailability = async () => {
            const { checkAvailability } = await import("@/app/actions/appointments");
            // Pass selectedCounselorId to check availability for that specific counselor
            const res = await checkAvailability(selectedDate, selectedCounselorId);
            if (res.success) setBusySlots(res.data || []);
        };
        if (isOpen) fetchAvailability();
    }, [selectedDate, isOpen, selectedCounselorId]); // Added selectedCounselorId dependency

    if (!isOpen || !activeClient || !mounted) return null;

    const timeSlots = [
        "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
    ];

    const getSlotStatus = (time: string) => {
        const busy = busySlots.find(s => s.time === time);
        if (busy) return { status: "busy", name: busy.name };
        return { status: "available", name: null };
    };

    const handleConfirm = async () => {
        if (!activeClient) return;

        try {
            // Check if this is reschedule mode
            if (rescheduleMode && rescheduleSessionId) {
                // Update existing session
                const { updateAppointmentTime } = await import("@/app/actions/appointments");
                const dateTime = new Date(`${selectedDate}T${selectedTime}`);

                const result = await updateAppointmentTime(
                    rescheduleSessionId, // Use explicit prop
                    dateTime,
                    parseInt(selectedDuration),
                    selectedDate,        // Pass date string for Client update
                    selectedTime         // Pass time string for Client update
                );

                if (result.success) {
                    if (sendSms) {
                        alert(`[Simulation] SMS sent to ${activeClient.name}: "Your appointment has been rescheduled to ${selectedDate} at ${selectedTime}."`);
                    }
                    if (onSuccess) onSuccess();
                    onClose();
                } else {
                    alert(`Failed to reschedule appointment. ${result.error || ''}`);
                }
            } else {
                // Create new appointment
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
                    if (onSuccess) onSuccess();
                    onClose();
                } else {
                    alert(`Failed to create appointment. ${result.error || ''}`);
                }
            }
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleDelete = async () => {
        if (!rescheduleSessionId) return;
        if (!confirm("정말로 이 일정을 취소하시겠습니까? (Status: Canceled)")) return;

        try {
            const { updateAppointmentStatus } = await import("@/app/actions/appointments");
            const result = await updateAppointmentStatus(rescheduleSessionId, 'Canceled');

            if (result.success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                alert(`Failed to cancel appointment. ${result.error || ''}`);
            }
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // Simple calendar generation for current/next month

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(currentYear, currentMonth, i + 1);
        return toLocalISO(d);
    });

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    const modalContent = (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl border border-[var(--color-midnight-navy)]/5 overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[850px] pointer-events-auto"
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

                                {/* Month Navigation */}
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        type="button"
                                        onClick={goToPreviousMonth}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div className="text-sm font-bold text-[var(--color-midnight-navy)]">
                                        {currentYear}년 {monthNames[currentMonth]}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={goToNextMonth}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                                        <span key={d} className="text-[10px] font-bold text-gray-400">{d}</span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array(firstDayOfMonth).fill(null).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}
                                    {days.map(date => {
                                        const isSelected = selectedDate === date;
                                        const isToday = date === toLocalISO(new Date());
                                        return (
                                            <button
                                                key={date}
                                                type="button" // Prevent form submission
                                                onClick={() => setSelectedDate(date)}
                                                className={cn(
                                                    "aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all relative font-medium",
                                                    isSelected ? "bg-[var(--color-midnight-navy)] text-white shadow-lg shadow-[var(--color-midnight-navy)]/30 scale-105 z-10" : "hover:bg-gray-50 text-gray-600",
                                                    isToday && !isSelected && "text-[var(--color-midnight-navy)] font-bold bg-indigo-50"
                                                )}
                                            >
                                                <span>{parseInt(date.split('-')[2])}</span>
                                                {isToday && <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1" />}
                                                {isSelected && <motion.div layoutId="day-indicator" className="absolute inset-0 rounded-xl border-2 border-white/20" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Location */}
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest block">상담 장소</label>
                                    {!isAddingLocation && (
                                        <button onClick={() => setIsAddingLocation(true)} className="text-[10px] flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-bold bg-indigo-50 px-2 py-1 rounded-full">
                                            <Plus className="w-3 h-3" /> 새 장소
                                        </button>
                                    )}
                                </div>

                                {isAddingLocation ? (
                                    <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                                        <input
                                            type="text"
                                            value={newQuickLocation}
                                            onChange={(e) => setNewQuickLocation(e.target.value)}
                                            placeholder="새 장소 이름 (예: 강남센터)"
                                            className="flex-1 p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            autoFocus
                                        />
                                        <button
                                            onClick={async () => {
                                                if (newQuickLocation) {
                                                    const res = await addLocation(newQuickLocation);
                                                    if (res.success) {
                                                        setLocations((prev) => [...prev, newQuickLocation]);
                                                        setSelectedLocation(newQuickLocation);
                                                        setNewQuickLocation("");
                                                        setIsAddingLocation(false);
                                                    }
                                                }
                                            }}
                                            className="px-4 bg-[var(--color-midnight-navy)] text-white rounded-xl text-sm font-bold"
                                        >
                                            추가
                                        </button>
                                        <button
                                            onClick={() => setIsAddingLocation(false)}
                                            className="px-3 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <select
                                            value={selectedLocation}
                                            onChange={(e) => setSelectedLocation(e.target.value)}
                                            className="w-full p-4 pl-12 rounded-2xl border border-gray-100 bg-gray-50/50 appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-midnight-navy)]/5 font-medium text-[var(--color-midnight-navy)] transition-all hover:bg-white hover:shadow-sm"
                                        >
                                            {locations.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-[var(--color-midnight-navy)] text-white rounded-lg pointer-events-none">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Counselor Selection */}
                            <section>
                                <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-4 block">담당 상담사</label>
                                <div className="relative">
                                    <select
                                        value={selectedCounselorId}
                                        onChange={(e) => setSelectedCounselorId(e.target.value)}
                                        className="w-full p-4 pl-4 rounded-2xl border border-gray-100 bg-gray-50/50 appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-midnight-navy)]/5 font-medium text-[var(--color-midnight-navy)] transition-all hover:bg-white hover:shadow-sm"
                                    >
                                        <option value="">상담사 선택 (선택 안함)</option>
                                        {counselors.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} {c.nickname ? `(${c.nickname})` : ''}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </section>

                            {/* Duration */}
                            <section>
                                <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-4 block">상담 시간(분)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {DURATIONS.map(d => (
                                        <button
                                            key={d.id}
                                            type="button"
                                            onClick={() => setSelectedDuration(d.id)}
                                            className={cn(
                                                "py-3 rounded-xl text-sm font-bold transition-all border",
                                                selectedDuration === d.id
                                                    ? "bg-white border-[var(--color-midnight-navy)] text-[var(--color-midnight-navy)] shadow-sm"
                                                    : "bg-transparent border-gray-100 text-gray-400 hover:bg-gray-50"
                                            )}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Recurring */}
                            <section>
                                <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-4 block">반복 설정</label>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {RECURRING_OPTIONS.map(opt => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setSelectedRecurring(opt.id)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border",
                                                selectedRecurring === opt.id
                                                    ? "bg-[var(--color-midnight-navy)]/5 border-[var(--color-midnight-navy)] text-[var(--color-midnight-navy)]"
                                                    : "bg-transparent border-transparent text-gray-400 hover:bg-gray-50"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>


                    {/* Right Side: Time Slots & Summary */}
                    <div className="w-full md:w-[320px] bg-gray-50 flex flex-col border-l border-gray-100">
                        <div className="flex-1 p-6 overflow-y-auto">
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-4 block">2. 상세 시간 선택</label>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {timeSlots.map(time => {
                                    const { status, name } = getSlotStatus(time);
                                    const isSelected = selectedTime === time;

                                    return (
                                        <button
                                            key={time}
                                            type="button"
                                            disabled={status === "busy"}
                                            onClick={() => setSelectedTime(time)}
                                            className={cn(
                                                "relative p-4 rounded-2xl border text-center transition-all group",
                                                status === "busy"
                                                    ? "bg-gray-100 border-transparent text-gray-300 cursor-not-allowed"
                                                    : isSelected
                                                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02] z-10"
                                                        : "bg-white border-transparent text-[var(--color-midnight-navy)] hover:border-gray-200 hover:shadow-md"
                                            )}
                                        >
                                            <span className="block text-lg font-bold tracking-tight">{time}</span>
                                            {status === "busy" ? (
                                                <span className="block text-[10px] truncate mt-1 bg-gray-200 rounded-full py-0.5 px-2 mx-auto w-fit max-w-full">{name}</span>
                                            ) : (
                                                <span className={cn("block text-[10px] mt-1 font-medium transition-colors", isSelected ? "text-emerald-100" : "text-emerald-500 group-hover:text-emerald-600")}>
                                                    {isSelected ? <Check className="w-3 h-3 mx-auto" /> : "예약 가능"}
                                                </span>
                                            )}
                                            {isSelected && <motion.div layoutId="time-indicator" className="absolute inset-0 rounded-2xl border-2 border-white/20" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Summary */}
                        <div className="p-6 bg-white border-t border-gray-100">
                            <div className="flex items-center gap-3 mb-6 bg-gray-50 p-4 rounded-2xl">
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-lg text-[var(--color-midnight-navy)]">
                                    {parseInt(selectedDate.split('-')[1])}
                                </div>
                                <div>
                                    <div className="font-bold text-[var(--color-midnight-navy)]">{activeClient.name}</div>
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

                        <div className="flex gap-3 w-full">
                            {rescheduleMode && (
                                <button
                                    onClick={handleDelete}
                                    className="px-6 py-4 bg-red-50 text-red-500 rounded-2xl font-bold text-lg hover:bg-red-100 transition-all font-sans"
                                >
                                    취소
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                className="flex-1 py-4 bg-[var(--color-midnight-navy)] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[var(--color-midnight-navy)]/20 hover:brightness-110 active:scale-[0.98] transition-all"
                            >
                                {rescheduleMode ? "일정 변경 및 알림 발송" : "예약 완료하기"}
                            </button>
                        </div>                    </div>
                </motion.div>
            </div>
        </>
    );

    return createPortal(modalContent, document.body);
}
