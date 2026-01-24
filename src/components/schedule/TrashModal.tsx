"use client";

import { useState, useEffect } from "react";
import { X, Trash2, RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDeletedAppointments, restoreAppointment, permanentlyDeleteAppointment } from "@/app/actions/appointments";

interface TrashModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TrashModal({ isOpen, onClose }: TrashModalProps) {
    const [deletedAppointments, setDeletedAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadDeletedAppointments();
        }
    }, [isOpen]);

    const loadDeletedAppointments = async () => {
        setIsLoading(true);
        const result = await getDeletedAppointments();
        if (result.success) {
            setDeletedAppointments(result.data || []);
        }
        setIsLoading(false);
    };

    const handleRestore = async (id: string) => {
        setActionLoading(id);
        const result = await restoreAppointment(id);
        if (result.success) {
            setDeletedAppointments(prev => prev.filter(a => a.id !== id));
        }
        setActionLoading(null);
    };

    const handlePermanentDelete = async (id: string) => {
        if (!confirm("이 일정을 영구적으로 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.")) {
            return;
        }
        setActionLoading(id);
        const result = await permanentlyDeleteAppointment(id);
        if (result.success) {
            setDeletedAppointments(prev => prev.filter(a => a.id !== id));
        }
        setActionLoading(null);
    };

    const getDaysUntilDeletion = (deletedAt: string) => {
        const deleted = new Date(deletedAt);
        const deletionDate = new Date(deleted);
        deletionDate.setDate(deletionDate.getDate() + 30);
        const now = new Date();
        const daysLeft = Math.ceil((deletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[var(--color-midnight-navy)]">휴지통</h2>
                            <p className="text-sm text-gray-500">삭제된 일정은 30일 후 자동으로 영구 삭제됩니다</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-midnight-navy)]" />
                        </div>
                    ) : deletedAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Trash2 className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">휴지통이 비어있습니다</p>
                            <p className="text-sm">삭제된 일정이 여기에 표시됩니다</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {deletedAppointments.map((apt) => {
                                const daysLeft = getDaysUntilDeletion(apt.deletedAt);
                                const isUrgent = daysLeft <= 7;

                                return (
                                    <div
                                        key={apt.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-bold text-[var(--color-midnight-navy)]">
                                                        {apt.client}
                                                    </h3>
                                                    {isUrgent && (
                                                        <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                                            <AlertCircle className="w-3 h-3" />
                                                            {daysLeft}일 후 삭제
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <p>
                                                        {new Date(apt.date).toLocaleDateString('ko-KR', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        삭제일: {new Date(apt.deletedAt).toLocaleDateString('ko-KR')}
                                                        {!isUrgent && ` • ${daysLeft}일 후 영구 삭제`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleRestore(apt.id)}
                                                    disabled={actionLoading === apt.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[var(--color-midnight-navy)] bg-[var(--color-midnight-navy)]/5 hover:bg-[var(--color-midnight-navy)]/10 rounded-lg transition-colors disabled:opacity-50"
                                                    title="복원"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                    복원
                                                </button>
                                                <button
                                                    onClick={() => handlePermanentDelete(apt.id)}
                                                    disabled={actionLoading === apt.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                    title="영구 삭제"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    영구 삭제
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
