"use client";

import { useState } from "react";
import { Check, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTransaction } from "@/app/actions/payment";
import { useRouter } from "next/navigation";

export function SessionPaymentStatus({ session, clientId }: { session: any, clientId: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Check if there is any 'charge' transaction linked to this session
    // Or if there is a 'payment' linked directly.
    // Let's assume if there is ANY transaction linked, it's handled.
    const isPaid = session.transactions && session.transactions.length > 0;

    const handleMarkAsPaid = async () => {
        if (!confirm("이 세션에 대해 100,000원을 차감(Charge) 하시겠습니까?")) return;

        setIsLoading(true);
        try {
            await createTransaction({
                clientId,
                amount: 100000, // Default fee for now
                type: 'charge',
                sessionId: session.id,
                note: `세션 차감: ${session.title}`
            });
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("처리 실패");
        } finally {
            setIsLoading(false);
        }
    };

    if (isPaid) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium">
                <Check className="w-4 h-4" />
                결제 완료 (Paid)
            </div>
        );
    }

    return (
        <Button
            onClick={handleMarkAsPaid}
            disabled={isLoading}
            className="bg-white text-[var(--color-midnight-navy)] border border-[var(--color-midnight-navy)]/20 hover:bg-[var(--color-midnight-navy)] hover:text-white transition-colors gap-2"
        >
            <DollarSign className="w-4 h-4" />
            결제 처리 (Mark as Paid)
        </Button>
    );
}
