'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export type PaymentMethod = 'cash' | 'transfer' | 'card';
export type TransactionType = 'payment' | 'charge' | 'refund';

interface CreateTransactionData {
    clientId: string;
    amount: number;
    type: TransactionType;
    method?: PaymentMethod;
    sessionId?: string;
    note?: string;
    date?: Date;
}

export async function createTransaction(data: CreateTransactionData) {
    const { user } = await requireAuth();

    if (!user.personalAccountId) {
        throw new Error("User does not have a personal account linked");
    }

    const transaction = await prisma.transaction.create({
        data: {
            accountId: user.personalAccountId,
            clientId: data.clientId,
            amount: data.amount,
            type: data.type,
            method: data.method,
            sessionId: data.sessionId,
            note: data.note,
            date: data.date || new Date(),
            status: 'completed'
        }
    });

    revalidatePath(`/patients/${data.clientId}`);
    return transaction;
}

export async function getClientTransactions(clientId: string) {
    await requireAuth();

    const transactions = await prisma.transaction.findMany({
        where: { clientId },
        orderBy: { date: 'desc' },
        include: { session: true }
    });

    return transactions;
}

/**
 * Calculates the current balance for a client.
 * Balance = Total Payments (Deposits) - Total Charges + Total Refunds (if treated as credit back) OR - Total Refunds (if money given back)
 * 
 * Logic:
 * 'payment' (Deposit): +Amount
 * 'charge' (Usage): -Amount
 * 'refund' (Return money to client): -Amount (decreases the deposit balance holding)
 */
export async function getClientBalance(clientId: string) {
    await requireAuth();

    const transactions = await prisma.transaction.findMany({
        where: { clientId },
        select: { type: true, amount: true }
    });

    let balance = 0;
    for (const t of transactions) {
        if (t.type === 'payment') {
            balance += t.amount;
        } else if (t.type === 'charge') {
            balance -= t.amount;
        } else if (t.type === 'refund') {
            balance -= t.amount;
        }
    }

    return balance;
}

export async function deleteTransaction(transactionId: string) {
    const { user } = await requireAuth();

    if (!user.personalAccountId) throw new Error("Unauthorized");

    // Verify ownership
    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        select: { accountId: true, clientId: true }
    });

    if (!transaction) throw new Error("Transaction not found");
    // Ensure we are comparing strings
    if (transaction.accountId !== user.personalAccountId) throw new Error("Unauthorized");

    await prisma.transaction.delete({
        where: { id: transactionId }
    });

    revalidatePath(`/patients/${transaction.clientId}`);
}
