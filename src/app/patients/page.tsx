
"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Plus, Users, ArrowLeft, MessageSquare, X } from "lucide-react";
import { ClientCard } from "@/components/patients/ClientCard";
import { MessageModal } from "@/components/patients/MessageModal";
import { type Client, Prisma } from "@prisma/client";
import { cn } from "@/lib/utils";
import { sendSMS } from "@/services/smsService";
import { usePersistence } from "@/hooks/usePersistence"; // New import

import { NewClientModal } from "@/components/patients/NewClientModal";

export default function PatientsPage() {
    const { clients, isLoaded, addClient, restartClient } = usePersistence();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "attention" | "crisis" | "upcoming" | "terminated">("upcoming");
    const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS); // Removed

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.englishName && client.englishName.toLowerCase().includes(searchTerm.toLowerCase()));

        if (activeFilter === "upcoming") {
            const hasNextSession = client.nextSession && client.nextSession !== "미정" && client.nextSession !== "Completed";
            return matchesSearch && hasNextSession && client.status !== "terminated";
        }

        if (activeFilter === "terminated") {
            return matchesSearch && client.status === "terminated";
        }

        const matchesFilter = activeFilter === "all" || client.status === activeFilter;
        // Hide terminated from regular lists unless explicitly selected
        const isNotTerminated = client.status !== "terminated";
        return matchesSearch && matchesFilter && (activeFilter === "all" ? isNotTerminated : true);
    }).sort((a, b) => {
        if (activeFilter === "upcoming") {
            return new Date(a.nextSession).getTime() - new Date(b.nextSession).getTime();
        }
        return 0; // Keep default order
    });

    const handleRegisterClient = (newClient: Prisma.ClientCreateInput) => {
        addClient(newClient); // usePersistence addClient already expects this Partial type
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] p-8 overflow-auto">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full transition-colors text-[var(--color-midnight-navy)]">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)]">내담자 관리</h1>
                        <p className="text-sm text-[var(--color-midnight-navy)]/60">
                            등록된 내담자의 상태와 기록을 관리합니다.
                            {isLoaded && <span className="ml-2 px-2 py-0.5 bg-[var(--color-midnight-navy)]/5 rounded-full text-xs">Total: {clients.length}</span>}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="h-10 px-5 rounded-full bg-[var(--color-midnight-navy)] text-white text-sm font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-colors flex items-center gap-2 shadow-lg shadow-[var(--color-midnight-navy)]/20"
                >
                    <Plus className="w-4 h-4" />
                    신규 등록
                </button>
            </header>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-midnight-navy)]/40" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="이름 검색 (예: 김민준)"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-white focus:outline-none focus:border-[var(--color-midnight-navy)] transition-colors"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 p-1 bg-white rounded-xl border border-[var(--color-midnight-navy)]/5">
                    <button
                        onClick={() => setActiveFilter("upcoming")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            activeFilter === "upcoming"
                                ? "bg-teal-600 text-white shadow-sm"
                                : "text-[var(--color-midnight-navy)]/60 hover:bg-[var(--color-midnight-navy)]/5"
                        )}
                    >
                        예약 임박
                    </button>
                    <button
                        onClick={() => setActiveFilter("attention")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            activeFilter === "attention"
                                ? "bg-[var(--color-champagne-gold)] text-white shadow-sm"
                                : "text-[var(--color-midnight-navy)]/60 hover:bg-[var(--color-midnight-navy)]/5"
                        )}
                    >
                        주의 필요
                    </button>
                    <button
                        onClick={() => setActiveFilter("crisis")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            activeFilter === "crisis"
                                ? "bg-red-500 text-white shadow-sm"
                                : "text-[var(--color-midnight-navy)]/60 hover:bg-[var(--color-midnight-navy)]/5"
                        )}
                    >
                        위기 개입
                    </button>
                    <button
                        onClick={() => setActiveFilter("all")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            activeFilter === "all"
                                ? "bg-[var(--color-midnight-navy)] text-white shadow-sm"
                                : "text-[var(--color-midnight-navy)]/60 hover:bg-[var(--color-midnight-navy)]/5"
                        )}
                    >
                        전체
                    </button>
                    <button
                        onClick={() => setActiveFilter("terminated")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            activeFilter === "terminated"
                                ? "bg-gray-500 text-white shadow-sm"
                                : "text-[var(--color-midnight-navy)]/60 hover:bg-[var(--color-midnight-navy)]/5"
                        )}
                    >
                        종결
                    </button>
                </div>
            </div>

            {/* Bulk Selection Bar */}
            {selectedClientIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--color-midnight-navy)] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-40 animate-in slide-in-from-bottom-4 duration-300">
                    <p className="text-sm">
                        <span className="font-bold text-[var(--color-champagne-gold)]">{selectedClientIds.length}명</span> 선택됨
                    </p>
                    <div className="w-px h-4 bg-white/20" />
                    <button
                        onClick={() => setIsMessageModalOpen(true)}
                        className="flex items-center gap-2 text-sm font-medium hover:text-[var(--color-champagne-gold)] transition-colors"
                    >
                        <MessageSquare className="w-4 h-4" />
                        단체 문자 발송
                    </button>
                    <button
                        onClick={() => setSelectedClientIds([])}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredClients.length > 0 ? (
                    filteredClients.map(client => (
                        <ClientCard
                            key={client.id}
                            id={client.id}
                            name={client.name}
                            status={client.status as any}
                            nextSession={client.nextSession}
                            lastSession={client.lastSession}
                            tags={client.tags}
                            isSelected={selectedClientIds.includes(client.id)}
                            onSelect={(id) => {
                                setSelectedClientIds(prev =>
                                    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                                );
                            }}
                            onRestart={restartClient}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-[var(--color-midnight-navy)]/40">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>검색 결과가 없습니다.</p>
                    </div>
                )}
            </div>

            <NewClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRegister={handleRegisterClient}
            />

            <MessageModal
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
                clients={clients.filter(c => selectedClientIds.includes(c.id))}
            />
        </div>
    );
}
