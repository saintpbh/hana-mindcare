"use client";

import { useState, useEffect } from "react";
import { Search, Menu, Lock, CheckCircle2, ChevronLeft, X, Calendar as CalendarIcon } from "lucide-react";
// import { IncomingCallOverlay } from "@/components/mobile-admin/IncomingCallOverlay";
import { QuickClientProfile } from "@/components/mobile-admin/QuickClientProfile";
import { MobileSchedule } from "@/components/mobile-admin/MobileSchedule";
import { SmartCalendar } from "@/components/calendar/SmartCalendar";
import { usePersistence } from "@/hooks/usePersistence";
import { type Client } from "@prisma/client";

export default function MobileAdminPage() {
    const { clients, isLoaded } = usePersistence();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState("");
    const [view, setView] = useState<"dashboard" | "client" | "calendar">("dashboard");
    // const [showCall, setShowCall] = useState(true); 
    const [isLoading, setIsLoading] = useState(true);

    // Search & Selection State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

    // Derived State for Selection
    // Ensure we always have the latest client data from the persistence hook
    const selectedClient = selectedClientId
        ? clients.find(c => c.id === selectedClientId) || null
        : null;

    // 1. Auth Check on Mount
    useEffect(() => {
        const authExpiry = localStorage.getItem("hana_admin_auth_expiry");
        if (authExpiry && new Date().getTime() < parseInt(authExpiry)) {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    // 2. PIN Login Handler
    const handleLogin = () => {
        if (pin === "1234") { // Simple PIN for demo
            const expiry = new Date().getTime() + (7 * 24 * 60 * 60 * 1000); // 7 days
            localStorage.setItem("hana_admin_auth_expiry", expiry.toString());
            setIsAuthenticated(true);
        } else {
            alert("비밀번호가 올바르지 않습니다. (Hint: 1234)");
            setPin("");
        }
    };

    const handleSelectClient = (client: Client) => {
        setSelectedClientId(client.id);
        setView("client");
        setSearchQuery(""); // Clear search after selection
    };

    const handleBackToDashboard = () => {
        setSelectedClientId(null);
        setView("dashboard");
    };

    // Derived State for Search
    const filteredClients = searchQuery.trim() !== ""
        ? clients.filter(c => c.name.includes(searchQuery) || c.contact.includes(searchQuery))
        : [];

    if (isLoading) return <div className="min-h-screen bg-[var(--color-warm-white)] flex items-center justify-center text-[var(--color-midnight-navy)]">Loading...</div>;

    // 3. Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[var(--color-midnight-navy)] flex flex-col items-center justify-center p-6 text-white max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10 text-[var(--color-champagne-gold)]" />
                </div>
                <h1 className="text-2xl font-serif mb-2">Hana Admin</h1>
                <p className="text-white/60 mb-8 text-sm">모바일 관리자 모드 접속</p>

                <div className="w-full max-w-xs space-y-4">
                    <input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="간편 비밀번호 (PIN)"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] placeholder:text-white/30 placeholder:tracking-normal focus:outline-none focus:border-[var(--color-champagne-gold)] transition-colors"
                        maxLength={4}
                    />
                    <button
                        onClick={handleLogin}
                        className="w-full bg-[var(--color-champagne-gold)] text-[var(--color-midnight-navy)] font-bold py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                        로그인
                    </button>
                    <p className="text-center text-xs text-white/30 pt-4">
                        *로그인 상태는 7일간 유지됩니다.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[var(--color-warm-white)] flex flex-col max-w-md mx-auto relative shadow-2xl font-sans overflow-hidden">

            {/* Fixed Top Section */}
            <div className="flex-none bg-[var(--color-warm-white)] z-50 shadow-sm relative">
                {/* Header */}
                <header className="p-5 flex justify-between items-center bg-white/50 backdrop-blur-md">
                    {view === "client" ? (
                        <button onClick={handleBackToDashboard} className="flex items-center text-[var(--color-midnight-navy)] gap-1">
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-semibold">뒤로</span>
                        </button>
                    ) : (
                        <span className="font-serif font-bold text-lg text-[var(--color-midnight-navy)]">Serene Admin</span>
                    )}

                    <div className="flex gap-2">
                        {/* Calendar Toggle */}
                        {isAuthenticated && (
                            <button
                                onClick={() => setView(view === "calendar" ? "dashboard" : "calendar")}
                                className={`p-2 rounded-full transition-colors ${view === "calendar" ? "bg-blue-600 text-white shadow-md" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                            >
                                <CalendarIcon className="w-5 h-5" />
                            </button>
                        )}

                        {view === "dashboard" && (
                            <button
                                onClick={() => {
                                    localStorage.removeItem("hana_admin_auth_expiry");
                                    setIsAuthenticated(false);
                                    setPin("");
                                }}
                                className="text-xs text-[var(--color-midnight-navy)]/40 hover:text-red-500 flex items-center"
                            >
                                로그아웃
                            </button>
                        )}

                        <button className="p-2 rounded-full hover:bg-[var(--color-midnight-navy)]/5">
                            <Menu className="w-5 h-5 text-[var(--color-midnight-navy)]" />
                        </button>
                    </div>
                </header>

                {/* Search Bar (Only in Dashboard) */}
                {view === "dashboard" && (
                    <div className="px-5 pb-5 relative z-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-midnight-navy)]/40" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="내담자 이름 검색..."
                                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-[var(--color-midnight-navy)]/10 text-sm focus:outline-none focus:border-[var(--color-midnight-navy)] shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-[var(--color-midnight-navy)]/10"
                                >
                                    <X className="w-3 h-3 text-[var(--color-midnight-navy)]/60" />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {searchQuery.trim() !== "" && (
                            <div className="absolute top-full left-5 right-5 mt-2 bg-white rounded-xl shadow-xl border border-[var(--color-midnight-navy)]/10 max-h-60 overflow-y-auto z-[60]">
                                {filteredClients.length > 0 ? (
                                    filteredClients.map(client => (
                                        <button
                                            key={client.id}
                                            onClick={() => handleSelectClient(client)}
                                            className="w-full p-3 text-left hover:bg-[var(--color-warm-white)] border-b border-[var(--color-midnight-navy)]/5 last:border-0"
                                        >
                                            <p className="font-bold text-[var(--color-midnight-navy)]">{client.name}</p>
                                            <p className="text-xs text-[var(--color-midnight-navy)]/50">{client.condition} | {client.contact}</p>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-[var(--color-midnight-navy)]/40 text-sm">
                                        검색 결과가 없습니다.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Scrollable Main Content */}
            <main className="flex-1 overflow-y-auto px-5 pb-10 space-y-6 scrollbar-hide">
                {view === "client" && selectedClient ? (
                    <section className="animate-in slide-in-from-right-5 fade-in duration-300">
                        <QuickClientProfile client={selectedClient} />
                    </section>
                ) : view === "calendar" ? (
                    <section className="animate-in fade-in duration-300">
                        <SmartCalendar
                            className="min-h-[600px]"
                            onEventClick={(event) => {
                                if (event.clientId) {
                                    const client = clients.find(c => c.id === event.clientId);
                                    if (client) {
                                        handleSelectClient(client);
                                    }
                                }
                            }}
                        />
                    </section>
                ) : (
                    <section>
                        <MobileSchedule
                            onSelectClient={handleSelectClient}
                            onViewCalendar={() => setView("calendar")}
                        />
                    </section>
                )}
            </main>
        </div>
    );
}
