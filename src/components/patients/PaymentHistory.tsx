"use client";

import { useEffect, useState } from "react";
import { Plus, ArrowDownLeft, ArrowUpRight, Ban, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    createTransaction,
    getClientTransactions,
    getClientBalance,
    deleteTransaction,
} from "@/app/actions/payment";
import { useConfirm } from "@/contexts/ConfirmContext";

type Transaction = {
    id: string;
    type: string;
    amount: number;
    method: string | null;
    date: Date;
    status: string;
    note: string | null;
    sessionId: string | null;
    session?: { title: string } | null;
};

interface PaymentHistoryProps {
    clientId: string;
}

export function PaymentHistory({ clientId }: PaymentHistoryProps) {
    const { confirm } = useConfirm();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form State
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"payment" | "charge">("payment");
    const [method, setMethod] = useState<"cash" | "transfer" | "card">("card");
    const [note, setNote] = useState("");

    const fetchData = async () => {
        try {
            const [txs, bal] = await Promise.all([
                getClientTransactions(clientId),
                getClientBalance(clientId)
            ]);
            setTransactions(txs as unknown as Transaction[]);
            setBalance(bal);
        } catch (error) {
            console.error("Failed to fetch payment data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [clientId]);

    const handleSubmit = async () => {
        if (!amount) return;

        try {
            await createTransaction({
                clientId,
                amount: parseInt(amount.replace(/,/g, "")),
                type,
                method: type === 'payment' ? method : undefined,
                note,
                date: new Date()
            });

            setIsAddOpen(false);
            setAmount("");
            setNote("");
            fetchData(); // Refresh list and balance
        } catch (error) {
            console.error("Failed to create transaction", error);
            alert("거래 생성 실패");
        }
    };

    const handleDelete = async (id: string) => {
        if (await confirm("거래 내역을 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)")) {
            try {
                await deleteTransaction(id);
                fetchData();
            } catch (error) {
                console.error(error);
                alert("삭제 실패");
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white p-6 rounded-2xl border border-[var(--color-midnight-navy)]/10 shadow-sm flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-medium text-[var(--color-midnight-navy)]/60 mb-1">현재 잔액 (Current Balance)</h2>
                    <div className="text-3xl font-bold text-[var(--color-midnight-navy)]">
                        {balance.toLocaleString()} 원
                    </div>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="rounded-xl px-6 bg-[var(--color-midnight-navy)] hover:bg-[var(--color-midnight-navy)]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    입출금 기록
                </Button>
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-2xl border border-[var(--color-midnight-navy)]/10 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[var(--color-midnight-navy)]/5 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-[var(--color-midnight-navy)]">거래 내역</h3>
                    <span className="text-xs text-gray-400">최근 {transactions.length}건</span>
                </div>

                {transactions.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">기록된 거래가 없습니다.</div>
                ) : (
                    <div className="divide-y divide-[var(--color-midnight-navy)]/5">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                                        tx.type === 'charge' ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {tx.type === 'payment' ? <ArrowDownLeft className="w-5 h-5" /> :
                                            tx.type === 'charge' ? <ArrowUpRight className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="font-medium text-[var(--color-midnight-navy)]">
                                            {tx.type === 'payment' ? '입금 (Deposit)' : tx.type === 'charge' ? '차감 (Charge)' : '환불 (Refund)'}
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center gap-2">
                                            <span>{format(new Date(tx.date), 'yyyy. MM. dd HH:mm')}</span>
                                            {tx.method && <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 uppercase">{tx.method}</span>}
                                            {tx.session && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">상담: {tx.session.title}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right flex items-center gap-4">
                                    <div>
                                        <div className={`font-bold ${tx.type === 'payment' ? 'text-emerald-600' : 'text-[var(--color-midnight-navy)]'
                                            }`}>
                                            {tx.type === 'payment' ? '+' : '-'}{tx.amount.toLocaleString()} 원
                                        </div>
                                        {tx.note && <div className="text-xs text-gray-400">{tx.note}</div>}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(tx.id)}
                                        className="p-2 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Transaction Modal */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>새 거래 기록</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant={type === 'payment' ? 'default' : 'outline'}
                                onClick={() => { setType('payment'); }}
                                className={type === 'payment' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                            >
                                입금 (Deposit)
                            </Button>
                            <Button
                                variant={type === 'charge' ? 'default' : 'outline'}
                                onClick={() => { setType('charge'); }}
                                className={type === 'charge' ? 'bg-rose-600 hover:bg-rose-700' : ''}
                            >
                                차감 (Charge)
                            </Button>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="amount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">금액 (Amount)</label>
                            <input
                                id="amount"
                                type="text"
                                value={amount}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setAmount(val ? parseInt(val).toLocaleString() : '');
                                }}
                                placeholder="0"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-right font-mono"
                            />
                        </div>

                        {type === 'payment' && (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none">입금 수단</label>
                                <div className="flex gap-2">
                                    {['cash', 'transfer', 'card'].map((m) => (
                                        <Button
                                            key={m}
                                            type="button"
                                            variant={method === m ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setMethod(m as any)}
                                            className="flex-1"
                                        >
                                            {m === 'cash' ? '현금' : m === 'transfer' ? '계좌이체' : '카드'}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <label htmlFor="note" className="text-sm font-medium leading-none">메모 (Note)</label>
                            <input
                                id="note"
                                value={note}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
                                placeholder="예: 5회기 선입금"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmit}>저장하기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
