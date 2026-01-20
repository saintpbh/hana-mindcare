"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, User, ChevronRight, Loader2 } from "lucide-react";
import { searchClients } from "@/app/actions/clients";

interface ClientSearchResult {
    id: string;
    name: string;
    condition: string;
    status: string;
    _count: {
        sessions: number;
    };
}

interface ExistingClientSearchProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectClient: (client: ClientSearchResult) => void;
}

export function ExistingClientSearch({ isOpen, onClose, onSelectClient }: ExistingClientSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<ClientSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            const response = await searchClients(searchQuery);
            if (response.success && response.data) {
                setResults(response.data as any);
            }
            setIsLoading(false);
        }, 300); // Debounce

        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[80vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100">
                            <button
                                onClick={onClose}
                                className="mb-4 text-sm text-[var(--color-midnight-navy)]/60 hover:text-[var(--color-midnight-navy)] flex items-center gap-2"
                            >
                                ← 뒤로
                            </button>
                            <h2 className="text-2xl font-serif text-[var(--color-midnight-navy)] mb-2">
                                기존 내담자 선택
                            </h2>
                            <p className="text-sm text-[var(--color-midnight-navy)]/60">
                                이름 또는 ID로 검색하세요
                            </p>
                        </div>

                        {/* Search */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="이름 또는 ID로 검색..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 text-[var(--color-midnight-navy)] placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-midnight-navy)] focus:ring-2 focus:ring-[var(--color-midnight-navy)]/10 transition-all"
                                />
                                {isLoading && (
                                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                                )}
                            </div>
                        </div>

                        {/* Results */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {searchQuery.length < 2 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-sm">최소 2글자 이상 입력해주세요</p>
                                </div>
                            ) : results.length === 0 && !isLoading ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-sm">검색 결과가 없습니다</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {results.map((client) => (
                                        <button
                                            key={client.id}
                                            onClick={() => onSelectClient(client)}
                                            className="w-full p-5 rounded-2xl border border-gray-100 hover:border-[var(--color-midnight-navy)]/30 hover:bg-[var(--color-midnight-navy)]/5 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[var(--color-midnight-navy)]/10 transition-colors">
                                                    <User className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-[var(--color-midnight-navy)]">
                                                            {client.name}
                                                        </h3>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${client.status === 'stable' ? 'bg-emerald-50 text-emerald-700' :
                                                                client.status === 'attention' ? 'bg-amber-50 text-amber-700' :
                                                                    'bg-rose-50 text-rose-700'
                                                            }`}>
                                                            {client.status === 'stable' ? '안정' :
                                                                client.status === 'attention' ? '주의' : '위기'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-[var(--color-midnight-navy)]/60">
                                                        #{client.id.slice(0, 8)} · {client.condition} · {client._count.sessions}회차
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-midnight-navy)] transition-colors" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
