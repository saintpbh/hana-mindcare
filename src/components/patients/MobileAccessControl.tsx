"use client";

import { useState } from "react";
import {
    Link2,
    Copy,
    RefreshCcw,
    Shield,
    ShieldOff,
    ExternalLink,
    MessageSquare,
    Check,
    Clock,
    Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { togglePortalAccess, refreshPortalToken } from "@/app/actions/portal";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MobileAccessControlProps {
    client: any;
    onMessageClick?: () => void;
}

export function MobileAccessControl({ client, onMessageClick }: MobileAccessControlProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCopying, setIsCopying] = useState(false);

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        open: boolean;
        type: 'toggle' | 'refresh';
        title: string;
        description: string;
    }>({
        open: false,
        type: 'toggle',
        title: '',
        description: ''
    });

    const portalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/mobile/${client.portalToken || client.id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(portalUrl);
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 2000);
    };

    const handleToggle = () => {
        setModalConfig({
            open: true,
            type: 'toggle',
            title: client.isPortalActive ? '접근 차단 확인' : '접근 허용 확인',
            description: client.isPortalActive
                ? '내담자가 더 이상 모바일 포털에 접속할 수 없게 됩니다. 정말 차단하시겠습니까?'
                : '내담자가 개인 페이지에 접속하여 감정 기록과 라이브러리를 이용할 수 있게 됩니다.'
        });
    };

    const handleRefresh = () => {
        setModalConfig({
            open: true,
            type: 'refresh',
            title: '링크 갱신 확인',
            description: '현재 링크가 즉시 무효화됩니다. 내담자에게 새로운 링크를 다시 전달해야 합니다. 계속하시겠습니까?'
        });
    };

    const handleConfirm = async () => {
        const type = modalConfig.type;
        setModalConfig(prev => ({ ...prev, open: false }));

        if (type === 'toggle') {
            await togglePortalAccess(client.id, !client.isPortalActive);
        } else if (type === 'refresh') {
            setIsRefreshing(true);
            await refreshPortalToken(client.id);
            setIsRefreshing(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm overflow-hidden flex flex-col">
            <header className="px-6 py-4 bg-[var(--color-midnight-navy)]/5 border-b border-[var(--color-midnight-navy)]/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[var(--color-midnight-navy)]/60" />
                    <h3 className="text-sm font-bold text-[var(--color-midnight-navy)]">모바일 포털 관리</h3>
                </div>
                <div className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1",
                    client.isPortalActive
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-rose-50 text-rose-600 border-rose-100"
                )}>
                    <div className={cn("w-1 h-1 rounded-full", client.isPortalActive ? "bg-emerald-500" : "bg-rose-500")} />
                    {client.isPortalActive ? "활성" : "비활성"}
                </div>
            </header>

            <main className="p-6 space-y-6">
                {/* Link Preview */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest px-1">접속용 개인 URL</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-[var(--color-warm-white)] px-3 py-2 rounded-xl border border-[var(--color-midnight-navy)]/5 text-xs text-[var(--color-midnight-navy)]/60 font-mono truncate flex items-center">
                            {portalUrl}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="w-10 h-10 rounded-xl bg-white border border-[var(--color-midnight-navy)]/10 flex items-center justify-center hover:bg-[var(--color-midnight-navy)]/5 transition-colors relative"
                        >
                            <AnimatePresence mode="wait">
                                {isCopying ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} key="check">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} key="copy">
                                        <Copy className="w-4 h-4 text-[var(--color-midnight-navy)]/60" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>

                {/* Usage Info */}
                <div className="flex items-center justify-between text-xs p-3 bg-amber-50/50 rounded-xl border border-amber-100/30">
                    <div className="flex items-center gap-2 text-amber-800/60">
                        <Clock className="w-3.5 h-3.5" />
                        <span>마지막 접속</span>
                    </div>
                    <span className="font-medium text-amber-900/40">
                        {client.lastPortalAccessAt
                            ? formatDistanceToNow(new Date(client.lastPortalAccessAt), { addSuffix: true, locale: ko })
                            : "이력 없음"}
                    </span>
                </div>

                {/* Action Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={onMessageClick}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-[var(--color-midnight-navy)] text-white rounded-xl text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm"
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        링크 발송
                    </button>
                    <button
                        onClick={() => window.open(portalUrl, '_blank')}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] rounded-xl text-xs font-bold hover:bg-[var(--color-midnight-navy)]/5 active:scale-95 transition-all"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        미리보기
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] rounded-xl text-xs font-bold hover:bg-[var(--color-midnight-navy)]/5 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <RefreshCcw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
                        링크 갱신
                    </button>
                    <button
                        onClick={handleToggle}
                        className={cn(
                            "flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold active:scale-95 transition-all border",
                            client.isPortalActive
                                ? "bg-white border-rose-100 text-rose-500 hover:bg-rose-50"
                                : "bg-white border-emerald-100 text-emerald-500 hover:bg-emerald-50"
                        )}
                    >
                        {client.isPortalActive ? (
                            <>
                                <ShieldOff className="w-3.5 h-3.5" />
                                차단하기
                            </>
                        ) : (
                            <>
                                <Shield className="w-3.5 h-3.5" />
                                허용하기
                            </>
                        )}
                    </button>
                </div>
            </main>

            {/* Confirmation Modal */}
            <Dialog
                open={modalConfig.open}
                onOpenChange={(open) => setModalConfig(prev => ({ ...prev, open }))}
            >
                <DialogContent className="max-w-md bg-white rounded-3xl p-8 border-none shadow-2xl overflow-hidden">
                    <DialogHeader className="mb-4">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto",
                            modalConfig.type === 'refresh' ? "bg-amber-50" : (client.isPortalActive ? "bg-rose-50" : "bg-emerald-50")
                        )}>
                            {modalConfig.type === 'refresh' ? (
                                <RefreshCcw className="w-8 h-8 text-amber-500" />
                            ) : (
                                client.isPortalActive ? <ShieldOff className="w-8 h-8 text-rose-500" /> : <Shield className="w-8 h-8 text-emerald-500" />
                            )}
                        </div>
                        <DialogTitle className="text-2xl font-serif text-[var(--color-midnight-navy)] text-center">
                            {modalConfig.title}
                        </DialogTitle>
                        <DialogDescription className="text-center text-[var(--color-midnight-navy)]/60 pt-2 leading-relaxed">
                            {modalConfig.description}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex gap-3 mt-4 sm:justify-center">
                        <Button
                            variant="ghost"
                            onClick={() => setModalConfig(prev => ({ ...prev, open: false }))}
                            className="flex-1 h-12 rounded-xl text-[var(--color-midnight-navy)]/60 hover:text-[var(--color-midnight-navy)] hover:bg-[var(--color-warm-white)] font-medium"
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className={cn(
                                "flex-1 h-12 rounded-xl text-white font-medium shadow-lg",
                                modalConfig.type === 'refresh' ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" : (client.isPortalActive ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200" : "bg-[var(--color-midnight-navy)] hover:bg-[var(--color-midnight-navy)]/90 shadow-navy-200")
                            )}
                        >
                            확인
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
