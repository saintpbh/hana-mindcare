
"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Plus, Users, ArrowLeft } from "lucide-react";
import { ClientCard } from "@/components/patients/ClientCard";
import { type Client } from "@prisma/client"; // Keep Client type
import { cn } from "@/lib/utils";
import { usePersistence } from "@/hooks/usePersistence"; // New import

import { NewClientModal } from "@/components/patients/NewClientModal";

export default function PatientsPage() {
    const { clients, isLoaded, addClient } = usePersistence(); // Replaced local state with usePersistence
    const [searchTerm, setSearchTerm] = useState("");

    const [activeFilter, setActiveFilter] = useState<"all" | "attention" | "crisis" | "upcoming">("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS); // Removed

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.englishName && client.englishName.toLowerCase().includes(searchTerm.toLowerCase()));

        if (activeFilter === "upcoming") {
            // Show only clients with valid future dates (simple check for now, can be improved)
            const hasNextSession = client.nextSession && client.nextSession !== "미정" && client.nextSession !== "Completed";
            return matchesSearch && hasNextSession;
        }

        const matchesFilter = activeFilter === "all" || client.status === activeFilter;
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        if (activeFilter === "upcoming") {
            return new Date(a.nextSession).getTime() - new Date(b.nextSession).getTime();
        }
        return 0; // Keep default order
    });

    const handleRegisterClient = (newClient: Omit<Client, "id" | "createdAt" | "updatedAt">) => {
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
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredClients.length > 0 ? (
                    filteredClients.map(client => (
                        <Link key={client.id} href={`/patients/${client.id}`}>
                            <ClientCard
                                name={client.name}
                                status={client.status as "stable" | "attention" | "crisis"}
                                nextSession={client.nextSession}
                                lastSession={client.lastSession}
                                tags={client.tags}
                            />
                        </Link>
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
        </div>
    );
}
