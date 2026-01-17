"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9); // 9AM to 7PM
const DAYS = ["월", "화", "수", "목", "금"];
const ROW_HEIGHT = 80; // px per hour
const COL_COUNT = 5;

interface Appointment {
    id: number;
    title: string;
    type: string;
    time: number;
    day: number;
    duration: number;
    color: string;
}

interface CalendarViewProps {
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    onEditAppointment: (id: number) => void;
}

export function CalendarView({ appointments, setAppointments, onEditAppointment }: CalendarViewProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [resizingId, setResizingId] = useState<number | null>(null);

    // Handle Drag Move (Appointment Body)
    const handleDragStart = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setDraggingId(id);
    };

    // Handle Resize Start (Bottom Handle)
    const handleResizeStart = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setResizingId(id);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!gridRef.current) return;

        const rect = gridRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left - 60; // 60px offset for time axis roughly
        const relativeY = e.clientY - rect.top;

        // Calculate Grid Coords
        const colWidth = (rect.width - 60) / COL_COUNT;
        const dayIndex = Math.floor(relativeX / colWidth);
        const timeIndex = 9 + (relativeY / ROW_HEIGHT);

        // Snap logic
        const snappedDay = Math.max(0, Math.min(4, dayIndex));
        // Snap to 15 mins (0.25)
        const snappedTime = Math.round(timeIndex * 4) / 4;

        if (draggingId) {
            setAppointments(prev => prev.map(apt => {
                if (apt.id !== draggingId) return apt;

                // Boundaries
                const newTime = Math.max(9, Math.min(19 - apt.duration, snappedTime));

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
    };

    const handleMouseUp = () => {
        setDraggingId(null);
        setResizingId(null);
    };

    return (
        <div
            className="flex-1 bg-white rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm overflow-hidden flex flex-col select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Week Header */}
            <div className="grid grid-cols-6 border-b border-[var(--color-midnight-navy)]/5">
                <div className="p-4 border-r border-[var(--color-midnight-navy)]/5 bg-[var(--color-warm-white)]" />
                {DAYS.map((day, i) => (
                    <div key={day} className="p-4 text-center border-r border-[var(--color-midnight-navy)]/5 last:border-r-0 bg-[var(--color-warm-white)]">
                        <span className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-wider">{day}</span>
                        <div className="text-lg font-medium text-[var(--color-midnight-navy)] mt-1">{14 + i}</div>
                    </div>
                ))}
            </div>

            {/* Time Grid */}
            <div className="flex-1 overflow-y-auto relative no-scrollbar" ref={gridRef}>
                <div className="grid grid-cols-6 min-h-[880px]"> {/* Increased height to fit 9-19h * 80px */}
                    {/* Time Axis */}
                    <div className="border-r border-[var(--color-midnight-navy)]/5 bg-[var(--color-warm-white)]/30 w-[60px]">
                        {HOURS.map(hour => (
                            <div key={hour} className="border-b border-[var(--color-midnight-navy)]/5 p-2 text-xs text-[var(--color-midnight-navy)]/40 text-right font-medium relative box-border" style={{ height: ROW_HEIGHT }}>
                                <span className="absolute -top-2 right-2">{hour}:00</span>
                            </div>
                        ))}
                    </div>

                    {/* Days Columns Background */}
                    {DAYS.map((_, dayIndex) => (
                        <div key={dayIndex} className="relative border-r border-[var(--color-midnight-navy)]/5 last:border-r-0">
                            {/* Horizontal Grid lines */}
                            {HOURS.map(hour => (
                                <div key={hour} className="border-b border-[var(--color-midnight-navy)]/5 box-border" style={{ height: ROW_HEIGHT }} />
                            ))}

                            {/* Render Appointments for this day */}
                            {appointments.filter(apt => apt.day === dayIndex).map(apt => (
                                <div
                                    key={apt.id}
                                    onMouseDown={(e) => handleDragStart(e, apt.id)}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        onEditAppointment(apt.id);
                                    }}
                                    className={cn(
                                        "absolute left-1 right-1 rounded-lg border p-2 text-sm shadow-sm transition-all flex flex-col justify-between overflow-hidden group z-10",
                                        apt.color,
                                        draggingId === apt.id ? "opacity-80 scale-[1.02] shadow-xl z-50 cursor-grabbing" : "cursor-grab",
                                        resizingId === apt.id ? "cursor-ns-resize" : ""
                                    )}
                                    style={{
                                        top: `${(apt.time - 9) * ROW_HEIGHT}px`,
                                        height: `${apt.duration * ROW_HEIGHT - 4}px` // -4 margin
                                    }}
                                >
                                    <div className="pointer-events-none">
                                        <div className="font-semibold leading-tight">{apt.title}</div>
                                        <div className="text-[10px] opacity-80 uppercase tracking-wide mt-0.5">{apt.type}</div>
                                    </div>

                                    <div className="flex justify-between items-center opacity-60 pointer-events-none">
                                        <span className="text-[10px]">
                                            {Math.floor(apt.time)}:{((apt.time % 1) * 60).toString().padStart(2, '0')} -
                                            {Math.floor(apt.time + apt.duration)}:{(((apt.time + apt.duration) % 1) * 60).toString().padStart(2, '0')}
                                        </span>
                                    </div>

                                    {/* Resize Handle */}
                                    <div
                                        onMouseDown={(e) => handleResizeStart(e, apt.id)}
                                        className="absolute bottom-0 left-0 right-0 h-3 flex items-center justify-center cursor-ns-resize hover:bg-black/10 transition-colors"
                                    >
                                        <div className="w-8 h-1 rounded-full bg-black/10" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
