"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function getAdminStats() {
    const session = await requireAuth();
    if (!session.user.isSuperAdmin) {
        throw new Error("Unauthorized");
    }

    const totalUsers = await prisma.user.count();
    const pendingUsers = await prisma.user.count({ where: { isApproved: false } });
    const approvedUsers = await prisma.user.count({ where: { isApproved: true } });
    const organizations = await prisma.account.count({ where: { type: "organization" } });

    return {
        success: true,
        data: {
            totalUsers,
            pendingUsers,
            approvedUsers,
            organizations
        }
    };
}

export async function getAllUsers(page = 1, limit = 20, search = "") {
    const session = await requireAuth();
    if (!session.user.isSuperAdmin) {
        throw new Error("Unauthorized");
    }

    const skip = (page - 1) * limit;

    const where = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
        ]
    } : {};

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                isApproved: true,
                isSuperAdmin: true,
                memberships: {
                    select: {
                        account: {
                            select: {
                                name: true,
                                type: true
                            }
                        },
                        role: true
                    }
                }
            }
        }),
        prisma.user.count({ where })
    ]);

    return {
        success: true,
        data: {
            users,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

export async function updateUserStatus(userId: string, isApproved: boolean) {
    const session = await requireAuth();
    if (!session.user.isSuperAdmin) {
        throw new Error("Unauthorized");
    }

    // Prevent blocking yourself
    if (userId === session.user.id && !isApproved) {
        throw new Error("Cannot block your own account");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { isApproved }
    });

    return { success: true };
}

// Temporary helper to promote self (Should be removed purely for dev/demo)
export async function promoteToSuperAdmin(email: string) {
    // In production, this would be a database script or protected endpoint
    const user = await prisma.user.update({
        where: { email },
        data: { isSuperAdmin: true, isApproved: true }
    });
    return { success: true, user };
}
