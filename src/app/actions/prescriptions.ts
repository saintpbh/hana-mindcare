'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createPrescription(data: {
    clientId: string,
    title: string,
    type: string,
    category?: string,
    description?: string,
    contentUrl?: string
}) {
    try {
        const prescription = await prisma.prescription.create({
            data
        });
        revalidatePath(`/patients/${data.clientId}`);
        revalidatePath(`/mobile/${data.clientId}`);
        return { success: true, data: prescription };
    } catch (error) {
        console.error("Failed to create prescription:", error);
        return { success: false, error: "Failed to create prescription" };
    }
}

export async function getClientPrescriptions(clientId: string) {
    try {
        const prescriptions = await prisma.prescription.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: prescriptions };
    } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
        return { success: false, error: "Failed to fetch prescriptions" };
    }
}

export async function togglePrescriptionCompletion(id: string, isCompleted: boolean) {
    try {
        const prescription = await prisma.prescription.update({
            where: { id },
            data: { isCompleted }
        });
        revalidatePath(`/mobile/${prescription.clientId}`);
        return { success: true, data: prescription };
    } catch (error) {
        console.error("Failed to toggle prescription completion:", error);
        return { success: false, error: "Failed to toggle prescription completion" };
    }
}
