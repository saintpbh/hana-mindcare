"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GripVertical, MapPin, Video, Phone } from "lucide-react";

import { updateAppointmentTime } from "@/app/actions/appointments"; // Import Server Action

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9); // 9AM to 7PM
const DAYS = ["일", "월", "화", "수", "목", "금", "토"]; // Sun-Sat
const ROW_HEIGHT = 80; // px per hour
const COL_COUNT = 7;

interface Appointment {
    id: number;
    title: string;
    type: string;
    time: number;
    day: number;
    duration: number;
    color: string;
    location?: string;
    rawDate?: string;
}

interface CalendarViewProps {
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    onEditAppointment: (id: number) => void;
    view: "day" | "week" | "month";
    currentDate?: Date;
    onDateChange?: (date: Date) => void;
    onSelectAppointment?: (id: number) => void;
    selectedAppointmentId?: number | null;
}

export function CalendarView({
    appointments,
    setAppointments,
    onEditAppointment,
    view,
    currentDate = new Date(), // Default to today
    onDateChange,
    onSelectAppointment,
    selectedAppointmentId
}: CalendarViewProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [resizingId, setResizingId] = useState<number | null>(null);

    const [dragPos, setDragPos] = useState<{ x: number, y: number } | null>(null);

    // Month View Specific State
    const [dragOverDate, setDragOverDate] = useState<string | null>(null); // YYYY-MM-DD

    // Helper: Generate Month Grid
    const generateMonthGrid = (date: Date) => {
        // ... (existing logic same)
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Mon=0, Sun=6
        const totalDays = lastDay.getDate();

        // Simple fixed 35 or 42 grid for now (5 or 6 rows)
        const days = [];
        // Pad start
        for (let i = 0; i < startingDayOfWeek; i++) {
            const d = new Date(year, month, -startingDayOfWeek + i + 1);
            days.push({ date: d, isCurrentMonth: false });
        }
        // Current month
        for (let i = 1; i <= totalDays; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }
        // Pad end
        const remaining = 42 - days.length; // Ensure 6 rows for consistency
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }
        return days;
    };

    const monthDays = generateMonthGrid(currentDate);

    // Handle Drag Start
    const handleDragStart = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setDraggingId(id);
        setDragPos({ x: e.clientX, y: e.clientY }); // Init pos
    };

    // Handle Resize Start (Bottom Handle)
    const handleResizeStart = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setResizingId(id);
    };

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!gridRef.current) return;

        // Update Drag Ghost Position
        if (draggingId) {
            setDragPos({ x: e.clientX, y: e.clientY });
        }

        if (view === "month" && draggingId) {
            // Month View D&D Logic
            // ... (existing target cell calculation logic)
            const rect = gridRef.current.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;

            const colWidth = rect.width / 7;
            const rowHeight = rect.height / 6; // 6 rows fixed

            const col = Math.floor(relX / colWidth);
            const row = Math.floor(relY / rowHeight);

            const index = row * 7 + col;
            if (index >= 0 && index < monthDays.length) {
                const targetDate = formatDate(monthDays[index].date);
                if (dragOverDate !== targetDate) {
                    setDragOverDate(targetDate);
                }
            }
            return;
        }

        // Logic for Week/Day view
        if (view !== "month") {
            // ... (existing week view logic)
            const rect = gridRef.current.getBoundingClientRect();
            const relativeX = e.clientX - rect.left - 60; // 60px offset for time axis roughly
            const relativeY = e.clientY - rect.top;

            // Calculate Grid Coords
            const colWidth = (rect.width - 60) / COL_COUNT;
            const dayIndex = Math.floor(relativeX / colWidth); // 0-6
            const timeIndex = 9 + (relativeY / ROW_HEIGHT);

            // Snap logic
            const snappedDay = Math.max(0, Math.min(6, dayIndex)); // Allow 0-6 (Sun-Sat)
            // Snap to 15 mins (0.25)
            const snappedTime = Math.round(timeIndex * 4) / 4;

            if (draggingId) {
                setAppointments(prev => prev.map(apt => {
                    if (apt.id !== draggingId) return apt;

                    // Boundaries
                    // Allow dragging until later? Max 20:00?
                    const newTime = Math.max(9, Math.min(22 - apt.duration, snappedTime));

                    return {
                        ...apt,
                        day: snappedDay,
                        time: newTime
                    };
                }));
            }

            if (resizingId) {
                setAppointments(prev => prev.map(apt => {
                    if (apt.id !== resizingId) return apt;

                    // Calculate new duration based on mouse Y vs start time
                    const newDuration = Math.max(0.5, snappedTime - apt.time); // Min 30 mins

                    return {
                        ...apt,
                        duration: newDuration
                    };
                }));
            }
        }
    };

    const handleMouseUp = async () => {
        if (view === "month" && draggingId && dragOverDate) {
            // Commit drop in Month view
            // ... (Logic for month view drop -> server update would be good too)
            const appointment = appointments.find(a => a.id === draggingId);
            if (appointment) {
                // Try to keep time, update date
                const newDate = new Date(dragOverDate);
                // Need to get previous time components? 
                // Simple approach: Set to default time 10:00 or keep existing if parsed
                // Optimistic update
                setAppointments(prev => prev.map(apt => {
                    if (apt.id !== draggingId) return apt;
                    return { ...apt, rawDate: dragOverDate };
                }));

                // Server update
                // Mocking time preservation for month view drop is tricky without full Date object in hand
                // Let's assume 10:00 AM for drag-dropped to new day in month view if time is lost, OR preserve hours
                // We need to parse appointment.time (float hours).
                const hours = Math.floor(appointment.time);
                const mins = (appointment.time % 1) * 60;
                newDate.setHours(hours, mins, 0, 0);

                await updateAppointmentTime(appointment.id.toString(), newDate);
            }
            setDragOverDate(null);
        }

        if (view !== "month" && (draggingId || resizingId)) {
            const activeId = draggingId || resizingId;
            const appointment = appointments.find(a => a.id === activeId);

            if (appointment && activeId) {
                // Commit Week/Day View Drop/Resize
                // Calculate new Date object
                // 1. Find the base date of the current view's "week start" (Sunday or Monday?)
                // If view is day, base is currentDate.
                // If view is week, we need to know the Sunday of this week.

                let targetDate = new Date(currentDate);

                if (view === "week") {
                    const currentDay = targetDate.getDay(); // 0-6
                    const diff = -currentDay; // Go back to Sunday (0)
                    targetDate.setDate(targetDate.getDate() + diff); // Set to Sunday
                    targetDate.setDate(targetDate.getDate() + appointment.day); // Add the day index (0-6)
                }

                // Set Time
                const hours = Math.floor(appointment.time);
                const mins = Math.round((appointment.time % 1) * 60);
                targetDate.setHours(hours, mins, 0, 0);

                // Server Update
                await updateAppointmentTime(activeId.toString(), targetDate, appointment.duration);
            }
        }

        setDraggingId(null);
        setResizingId(null);
        setDragPos(null); // Clear drag pos
    };

    const renderAppointments = (dayIndex: number) => {
        // Filter appointments for the current day column
        const filtered = appointments.filter(apt => apt.day === dayIndex);

        return filtered.map(apt => (
            <div
                key={apt.id}
                onMouseDown={(e) => handleDragStart(e, apt.id)}
                onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectAppointment) onSelectAppointment(apt.id);
                }}
                className={cn(
                    "absolute left-1 right-1 rounded-lg border shadow-sm transition-all flex flex-col overflow-hidden group z-10",
                    apt.color,
                    view === "day" ? "flex-row items-center p-0" : "p-2 flex-col",
                    draggingId === apt.id ? "opacity-80 scale-[1.02] shadow-xl z-50 cursor-grabbing" : "cursor-grab",
                    resizingId === apt.id ? "cursor-ns-resize" : "",
                    selectedAppointmentId === apt.id ? "ring-2 ring-[var(--color-midnight-navy)] ring-offset-1 z-40" : ""
                )}
                style={{
                    top: `${(apt.time - 9) * ROW_HEIGHT}px`,
                    height: `${apt.duration * ROW_HEIGHT - 4}px` // -4 margin
                }}
            >
                {view === "day" ? (
                    // Day View Layout: Horizontal Rich Card
                    <>
                        {/* 1. Time Box (Left) */}
                        <div className="w-[80px] shrink-0 flex flex-col justify-center items-center h-full border-r border-black/5 bg-black/5">
                            <div className="text-sm font-bold opacity-80">
                                {Math.floor(apt.time)}:{((apt.time % 1) * 60).toString().padStart(2, '0')}
                            </div>
                            <div className="text-[10px] opacity-50 font-mono">
                                {(apt.duration * 60)}min
                            </div>
                        </div>

                        {/* 2. Main Content (Middle) */}
                        <div className="flex-1 min-w-0 p-3 flex flex-col justify-center gap-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg leading-none">{apt.title}</span>
                                <span className="text-xs opacity-60 font-medium">12/20회</span>
                                <div className="flex gap-1 ml-2">
                                    <span className="text-[10px] uppercase font-bold border border-current px-1.5 py-0.5 rounded-full opacity-70">
                                        {apt.type}
                                    </span>
                                    {apt.type === 'Crisis' && (
                                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                                            CRITICAL
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs opacity-70">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{apt.location || "양재 센터"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-current opacity-50" />
                                    <span>지난 회기: 과제 수행 완료</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Actions / Side Stats (Right) */}
                        <div className="px-4 flex flex-col justify-center items-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEditAppointment(apt.id); }}
                                className="p-1.5 rounded-full bg-white/50 hover:bg-white text-[var(--color-midnight-navy)] shadow-sm"
                            >
                                <GripVertical className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                ) : (
                    // Week View Layout (Vertical Compact)
                    <>
                        {/* Header: Time & Actions */}
                        <div className="flex justify-between items-start mb-1 h-5">
                            <span className="text-[10px] font-bold opacity-70">
                                {Math.floor(apt.time)}:{((apt.time % 1) * 60).toString().padStart(2, '0')}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEditAppointment(apt.id); }}
                                    className="p-0.5 rounded hover:bg-black/10 text-[10px]"
                                    title="예약 변경"
                                >
                                    <GripVertical className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Body: Client Info */}
                        <div className="flex-1 min-h-0 flex items-center justify-center text-center px-1">
                            <div className="font-extrabold text-sm leading-tight text-[var(--color-midnight-navy)] truncate w-full">
                                {apt.title} <span className="text-[10px] font-medium opacity-60 ml-1">@{apt.location || "양재"}</span>
                            </div>
                        </div>

                        {/* Footer - Spacer or Minimal Info */}
                        <div className="h-2" />
                    </>
                )}

                {/* Resize Handle */}
                <div
                    onMouseDown={(e) => handleResizeStart(e, apt.id)}
                    className="absolute bottom-0 left-0 right-0 h-3 flex items-center justify-center cursor-ns-resize hover:bg-black/10 transition-colors z-20"
                >
                    <div className="w-8 h-1 rounded-full bg-black/10" />
                </div>
            </div>
        ));
    };

    if (view === "month") {
        const draggedAppointment = appointments.find(a => a.id === draggingId);

        return (
            <div
                className="flex-1 bg-white rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm overflow-hidden flex flex-col select-none relative"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Month Grid Header */}
                <div className="grid grid-cols-7 border-b border-[var(--color-midnight-navy)]/5 bg-[var(--color-warm-white)]/50">
                    {["월", "화", "수", "목", "금", "토", "일"].map(d => (
                        <div key={d} className="p-3 text-center text-[11px] font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-wider">{d}</div>
                    ))}
                </div>

                {/* Month Grid Body */}
                <div className="flex-1 grid grid-cols-7 grid-rows-6 h-full" ref={gridRef}>
                    {monthDays.map((cell, i) => {
                        const dateKey = formatDate(cell.date);
                        // Filter by rawDate
                        const dayApts = appointments.filter(a => a.rawDate === dateKey);

                        // Strategic Heatmap Calculation
                        const count = dayApts.length;
                        let bgClass = "bg-transparent";
                        if (count > 0) bgClass = "bg-[var(--color-midnight-navy)]/[0.02]";
                        if (count >= 2) bgClass = "bg-[#CCFBF1]/40"; // Light Teal
                        if (count >= 4) bgClass = "bg-[#99F6E4]/50";
                        if (count >= 6) bgClass = "bg-[#5EEAD4]/60";
                        // Amber tint for crisis check?
                        const hasCrisis = dayApts.some(a => a.type === 'Crisis');
                        if (hasCrisis) bgClass = "bg-amber-50/80 border-amber-100";

                        const isTarget = dragOverDate === dateKey;

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "relative border-r border-b border-[var(--color-midnight-navy)]/5 p-2 flex flex-col gap-1 transition-all",
                                    !cell.isCurrentMonth && "bg-gray-50/50 grayscale opacity-40",
                                    bgClass,
                                    isTarget && "ring-2 ring-inset ring-[var(--color-midnight-navy)] bg-[var(--color-midnight-navy)]/10 z-10"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                        formatDate(new Date()) === dateKey ? "bg-[var(--color-midnight-navy)] text-white" : "text-[var(--color-midnight-navy)]/40"
                                    )}>
                                        {cell.date.getDate()}
                                    </span>
                                    {count > 0 && (
                                        <span className="text-[9px] font-bold text-[var(--color-midnight-navy)]/30" title={`${count}건의 상담`}>
                                            {count}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col gap-1 mt-1 overflow-hidden">
                                    {dayApts.slice(0, 3).map(a => (
                                        <div
                                            key={a.id}
                                            onMouseDown={(e) => handleDragStart(e, a.id)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onSelectAppointment) onSelectAppointment(a.id); // Click to show details (User Request)
                                            }}
                                            className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity shadow-sm border border-transparent",
                                                a.color,
                                                draggingId === a.id ? "opacity-50" : "hover:border-[var(--color-midnight-navy)]/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-1 overflow-hidden">
                                                <span className="truncate font-semibold">{a.title}</span>
                                                {a.location && <span className="opacity-70 text-[9px] shrink-0">/ {a.location}</span>}
                                            </div>
                                        </div>
                                    ))}
                                    {dayApts.length > 3 && (
                                        <div className="text-[9px] text-[var(--color-midnight-navy)]/40 px-1.5 hover:underline cursor-pointer">
                                            +{dayApts.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Custom Drag Ghost */}
                {draggingId && dragPos && draggedAppointment && (
                    <div
                        className={cn(
                            "fixed pointer-events-none z-50 px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold border flex items-center gap-2",
                            draggedAppointment.color,
                            "bg-white/90 backdrop-blur-sm ring-2 ring-[var(--color-midnight-navy)]/20"
                        )}
                        style={{
                            left: dragPos.x + 10, // Offset a bit from cursor
                            top: dragPos.y + 10,
                            width: "auto",
                            maxWidth: "200px"
                        }}
                    >
                        <GripVertical className="w-3 h-3 opacity-50" />
                        <span className="truncate">{draggedAppointment.title}</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className="flex-1 bg-white rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm overflow-hidden flex flex-col select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Week View Drag Ghost (Optional, but might as well add consistency if needed later) */}
            {/* For now, Week View uses direct absolute positioning updates, so ghost isn't strictly needed unless requested. */}

            {/* Week/Day Header */}
            <div className={cn("grid border-b border-[var(--color-midnight-navy)]/5", view === "day" ? "grid-cols-[60px_1fr]" : "grid-cols-[60px_repeat(7,1fr)]")}>
                {/* ... (existing header) ... */}
                <div className="p-4 border-r border-[var(--color-midnight-navy)]/5 bg-[var(--color-warm-white)]" />
                {DAYS.filter((_, i) => view === "week" || i === 0).map((day, i) => {
                    // Calculate the actual date for this column
                    let displayDate: Date;
                    if (view === "day") {
                        displayDate = new Date(currentDate);
                    } else {
                        // Week view: get Sunday of the current week (Start of Week)
                        const sunday = new Date(currentDate);
                        const dayOfWeek = sunday.getDay(); // 0(Sun) - 6(Sat)
                        const diffToSunday = -dayOfWeek; // Always subtract current day index to get to 0 (Sun)
                        sunday.setDate(sunday.getDate() + diffToSunday);

                        // Add i days from Sunday
                        displayDate = new Date(sunday);
                        displayDate.setDate(sunday.getDate() + i);
                    }

                    const isToday = formatDate(new Date()) === formatDate(displayDate);

                    return (
                        <div key={day} className="p-4 text-center border-r border-[var(--color-midnight-navy)]/5 last:border-r-0 bg-[var(--color-warm-white)]">
                            <span className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-wider">{day}</span>
                            <div className={cn(
                                "text-lg font-medium mt-1",
                                isToday ? "bg-[var(--color-midnight-navy)] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto" : "text-[var(--color-midnight-navy)]"
                            )}>
                                {displayDate.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Time Grid */}
            <div className="flex-1 overflow-y-auto relative no-scrollbar" ref={gridRef}>
                <div className={cn("grid min-h-[880px]", view === "day" ? "grid-cols-[60px_1fr]" : "grid-cols-[60px_repeat(7,1fr)]")}>
                    {/* Time Axis */}
                    <div className="border-r border-[var(--color-midnight-navy)]/5 bg-[var(--color-warm-white)]/30 w-full">
                        {HOURS.map(hour => (
                            <div key={hour} className="border-b border-[var(--color-midnight-navy)]/5 p-2 text-xs text-[var(--color-midnight-navy)]/40 text-right font-medium relative box-border" style={{ height: ROW_HEIGHT }}>
                                <span className="absolute -top-2 right-2">{hour}:00</span>
                            </div>
                        ))}
                    </div>

                    {/* Days Columns Background */}
                    {DAYS.filter((_, i) => view === "week" || i === 0).map((_, dayIndex) => (
                        <div key={dayIndex} className="relative border-r border-[var(--color-midnight-navy)]/5 last:border-r-0">
                            {/* Horizontal Grid lines */}
                            {HOURS.map(hour => (
                                <div key={hour} className="border-b border-[var(--color-midnight-navy)]/5 box-border" style={{ height: ROW_HEIGHT }} />
                            ))}

                            {/* Render Appointments for this day */}
                            {renderAppointments(dayIndex)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
