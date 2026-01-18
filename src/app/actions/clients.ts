'use server'

import { prisma } from '@/lib/prisma'
import { Client } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getClients() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { updatedAt: 'desc' }
        })
        return { success: true, data: clients }
    } catch (error) {
        console.error('Failed to fetch clients:', error)
        return { success: false, error: 'Failed to fetch clients' }
    }
}

export async function updateClient(id: string, data: Partial<Client>) {
    try {
        const client = await prisma.client.update({
            where: { id },
            data,
        })
        revalidatePath('/')
        revalidatePath('/mobile-admin')
        return { success: true, data: client }
    } catch (error) {
        console.error('Failed to update client:', error)
        return { success: false, error: 'Failed to update client' }
    }
}

export async function createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
        const client = await prisma.client.create({
            data,
        })
        revalidatePath('/')
        return { success: true, data: client }
    } catch (error) {
        console.error('Failed to create client:', error)
        return { success: false, error: 'Failed to create client' }
    }
}

export async function deleteClient(id: string) {
    try {
        await prisma.client.delete({
            where: { id }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete client:', error);
        return { success: false, error: 'Failed to delete client' };
    }
}
