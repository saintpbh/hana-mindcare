"use client";

import { UserPlus, ArrowRight, Clock } from "lucide-react";

export function IntakeQueueWidget() {
    // Mock Data
    const intakes = [
        { id: 1, name: "김민준", type: "First Visit", requestTime: "10 mins ago", status: "New" },
        { id: 2, name: "이서연", type: "Re-evaluation", requestTime: "1 hour ago", status: "Pending" },
        { id: 3, name: "박지훈", type: "Crisis Consult", requestTime: "2 hours ago", status: "Urgent" },
    ];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-serif text-lg text-[var(--color-midnight-navy)]">Intake Queue</h3>
                        <p className="text-xs text-neutral-400">3 clients waiting for assignment</p>
                    </div>
                </div>
                <button className="text-xs font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
                    View All
                </button>
            </div>

            <div className="flex-1 space-y-3">
                {intakes.map((intake) => (
                    <div key={intake.id} className="group flex items-center justify-between p-4 rounded-2xl border border-neutral-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${intake.status === 'Urgent' ? 'bg-rose-500 animate-pulse' : 'bg-indigo-500'}`} />
                            <div>
                                <div className="font-medium text-[var(--color-midnight-navy)]">{intake.name}</div>
                                <div className="text-xs text-neutral-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {intake.requestTime} • {intake.type}
                                </div>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-50 flex justify-between items-center text-xs text-neutral-400">
                <span>Auto-assignment active</span>
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                </span>
            </div>
        </div>
    );
}
