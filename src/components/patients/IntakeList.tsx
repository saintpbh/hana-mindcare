"use client";

import { motion } from "framer-motion";
import { Check, X, Clock, AlertCircle, FileText, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Intake Data Type
export interface IntakeRequest {
    id: number;
    name: string;
    requestDate: string;
    condition: string;
    urgency: "Normal" | "Urgent" | "Critical";
    phone: string;
    source: "Website" | "Referral" | "Walk-in";
    status: "Pending" | "Approving" | "Rejected";
}

interface IntakeListProps {
    requests: IntakeRequest[];
    onApprove: (request: IntakeRequest) => void;
    onReject: (id: number) => void;
}

export function IntakeList({ requests, onApprove, onReject }: IntakeListProps) {
    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-neutral-100">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-neutral-300" />
                </div>
                <p className="text-neutral-500 font-medium">대기 중인 접수 내역이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((req, index) => (
                <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center gap-6"
                >
                    {/* Status Indicator */}
                    <div className={cn(
                        "w-2 h-16 rounded-full self-stretch md:self-auto hidden md:block",
                        req.urgency === "Critical" ? "bg-red-500" :
                            req.urgency === "Urgent" ? "bg-amber-500" : "bg-emerald-500"
                    )} />

                    {/* Info */}
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "w-2 h-2 rounded-full md:hidden",
                                req.urgency === "Critical" ? "bg-red-500" :
                                    req.urgency === "Urgent" ? "bg-amber-500" : "bg-emerald-500"
                            )} />
                            <h3 className="text-lg font-bold text-[var(--color-midnight-navy)]">{req.name}</h3>
                            <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-md">
                                {req.source}
                            </span>
                            <span className="text-xs text-neutral-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {req.requestDate}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-neutral-400" />
                            {req.condition}
                        </p>
                        <p className="text-sm text-neutral-500">Contact: <span className="font-mono">{req.phone}</span></p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <button
                            onClick={() => onReject(req.id)}
                            className="flex-1 md:flex-none px-4 py-2 border border-neutral-200 text-neutral-500 rounded-xl hover:bg-neutral-50 transition-colors text-sm font-medium"
                        >
                            반려
                        </button>
                        <button
                            onClick={() => onApprove(req)}
                            className="flex-1 md:flex-none px-6 py-2 bg-[var(--color-midnight-navy)] text-white rounded-xl hover:bg-[var(--color-midnight-navy)]/90 transition-colors text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-midnight-navy)]/20"
                        >
                            접수 승인 <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
