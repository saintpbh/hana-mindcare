"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sendMessage(clientId: string, content: string, senderName: string) {
    try {
        const message = await prisma.message.create({
            data: {
                clientId,
                content,
                senderName,
            },
        });
        revalidatePath(`/mobile/${clientId}`);
        return { success: true, data: message };
    } catch (error) {
        console.error("Error sending message:", error);
        return { success: false, error: "Failed to send message" };
    }
}

export async function getClientMessages(clientId: string) {
    try {
        const messages = await prisma.message.findMany({
            where: { clientId },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, data: messages };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { success: false, error: "Failed to fetch messages" };
    }
}

export async function markMessageRead(messageId: string) {
    try {
        const message = await prisma.message.update({
            where: { id: messageId },
            data: { isRead: true },
        });
        return { success: true, data: message };
    } catch (error) {
        console.error("Error marking message as read:", error);
        return { success: false, error: "Failed to update message status" };
    }
}
