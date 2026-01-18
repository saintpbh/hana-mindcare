"use client";

import { useState, useEffect } from "react";
import { X, Check, Calendar as CalendarIcon, Clock, MapPin, Video, Phone, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
// import { type Client } from "@prisma/client";
type Client = any;
import { usePersistence } from "@/hooks/usePersistence";
import { getLocations, addLocation } from "@/app/actions/locations";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
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

export function ScheduleModal({ isOpen, onClose, client }: ScheduleModalProps) {
    const { clients, updateClient } = usePersistence();

    const [locations, setLocations] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(client?.nextSession || new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState<string>(client?.sessionTime || "10:00");
    const [selectedLocation, setSelectedLocation] = useState<string>(client?.location || "");
    const [selectedType, setSelectedType] = useState<string>(client?.sessionType || "in-person");
    const [selectedDuration, setSelectedDuration] = useState<string>("50");
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [newQuickLocation, setNewQuickLocation] = useState("");

    const fetchLocs = async () => {
        const res = await getLocations();
        if (res.success && res.data && res.data.length > 0) {
            const locNames = res.data.map((l: any) => l.name);
            setLocations(locNames);
            if (!client?.location || !locNames.includes(client.location)) {
                setSelectedLocation(locNames[0]);
            }
        }
    };

    useEffect(() => {
        fetchLocs();
    }, []);

    useEffect(() => {
        if (isOpen && client) {
            setSelectedDate(client.nextSession || new Date().toISOString().split('T')[0]);
            setSelectedTime(client.sessionTime || "10:00");
            setSelectedLocation(client.location || locations[0] || "");
            setSelectedType(client.sessionType || "in-person");
        }
    }, [isOpen, client, locations]);

    if (!isOpen || !client) return null;

    const timeSlots = [
        "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
    ];

    const getSlotStatus = (time: string) => {
        const conflict = clients.find(c =>
            c.nextSession === selectedDate &&
            c.sessionTime === time &&
            c.id !== client.id &&
            !c.isSessionCanceled
        );
        if (conflict) return { status: "busy", name: conflict.name };
        return { status: "available", name: null };
    };

    const handleConfirm = () => {
        updateClient({
            ...client,
            nextSession: selectedDate,
            sessionTime: selectedTime,
            location: selectedLocation,
            sessionType: selectedType,
            isSessionCanceled: false
            // Note: duration could be saved to notes or a new field if schema allowed.
        });
        onClose();
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
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-serif text-[var(--color-midnight-navy)]">상담 예약 설정</h2>
                            <p className="text-sm text-[var(--color-midnight-navy)]/50">{client.name} 내담자님의 다음 일정을 설정합니다.</p>
                        </div>
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
                                    const dayEvents = clients.filter(c => c.nextSession === date && !c.isSessionCanceled);

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

                                            {/* Dots Container */}
                                            <div className="h-1 flex gap-0.5 mt-0.5">
                                                {dayEvents.slice(0, 3).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "w-1 h-1 rounded-full",
                                                            isSelected ? "bg-[var(--color-champagne-gold)]" : "bg-[var(--color-champagne-gold)]"
                                                        )}
                                                    />
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white/40" : "bg-gray-300")} />
                                                )}
                                            </div>

                                            {isToday && !isSelected && (
                                                <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[var(--color-champagne-gold)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={() => {
                                        const input = window.prompt("날짜 직접 입력 (YYYY-MM-DD):", selectedDate);
                                        if (input) setSelectedDate(input);
                                    }}
                                    className="text-xs font-semibold text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)] underline underline-offset-4"
                                >
                                    다른 날짜 선택하기...
                                </button>
                            </div>
                        </section>

                        {/* Location & Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <section>
                                <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-3 block flex items-center justify-between">
                                    <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> 센터 장소</span>
                                    {!isAddingLocation && (
                                        <button
                                            onClick={() => setIsAddingLocation(true)}
                                            className="text-[10px] text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)] flex items-center gap-1"
                                        >
                                            <Plus className="w-2 h-2" /> 직접 추가
                                        </button>
                                    )}
                                </label>
                                {isAddingLocation ? (
                                    <div className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={newQuickLocation}
                                            onChange={(e) => setNewQuickLocation(e.target.value)}
                                            placeholder="장소 이름 입력"
                                            className="flex-1 bg-white border border-[var(--color-midnight-navy)]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-midnight-navy)]"
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter') {
                                                    if (newQuickLocation.trim()) {
                                                        const res = await addLocation(newQuickLocation.trim());
                                                        if (res.success) {
                                                            const name = newQuickLocation.trim();
                                                            setLocations(prev => [...prev, name]);
                                                            setSelectedLocation(name);
                                                            setNewQuickLocation("");
                                                            setIsAddingLocation(false);
                                                        }
                                                    }
                                                } else if (e.key === 'Escape') {
                                                    setIsAddingLocation(false);
                                                    setNewQuickLocation("");
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                setIsAddingLocation(false);
                                                setNewQuickLocation("");
                                            }}
                                            className="p-3 text-[var(--color-midnight-navy)]/40 hover:bg-black/5 rounded-xl"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="w-full bg-[var(--color-warm-white)]/50 border border-[var(--color-midnight-navy)]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-midnight-navy)]"
                                    >
                                        {locations.length > 0 ? (
                                            locations.map(loc => <option key={loc} value={loc}>{loc}</option>)
                                        ) : (
                                            <option value="">장소 정보 없음 (설정에서 추가)</option>
                                        )}
                                    </select>
                                )}
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
                        </div>

                        <section>
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-3 block">상담 방식</label>
                            <div className="grid grid-cols-3 gap-3">
                                {TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                                            selectedType === type.id
                                                ? "bg-white border-[var(--color-midnight-navy)] shadow-md text-[var(--color-midnight-navy)]"
                                                : "bg-[var(--color-warm-white)]/50 border-transparent text-gray-400 hover:border-[var(--color-midnight-navy)]/10"
                                        )}
                                    >
                                        <type.icon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Right Side: Time Picker & Confirm */}
                <div className="w-full md:w-[420px] bg-[var(--color-warm-white)]/30 p-6 flex flex-col overflow-y-auto">
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

                    <div className="bg-white rounded-2xl p-4 border border-[var(--color-midnight-navy)]/5 shadow-sm mb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-midnight-navy)]/5 flex items-center justify-center font-serif text-[var(--color-midnight-navy)]">
                                {client.name[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-[var(--color-midnight-navy)]">{client.name}</h4>
                                <p className="text-[10px] text-[var(--color-midnight-navy)]/40">{client.englishName}</p>
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
                        예약 완료하기
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
