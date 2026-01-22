"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfile(data: {
    name?: string;
    phone?: string;
    profileImage?: string;
    specialties?: string[];
    qualifications?: string[];
}) {
    try {
        const session = await requireAuth();

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.phone !== undefined && { phone: data.phone }),
                ...(data.profileImage !== undefined && { profileImage: data.profileImage }),
                ...(data.specialties && { specialties: data.specialties }),
                ...(data.qualifications && { qualifications: data.qualifications }),
            },
        });

        return { success: true, user: updatedUser };
    } catch (error) {
        console.error("Profile update error:", error);
        return { success: false, error: "프로필 업데이트에 실패했습니다." };
    }
}

export async function getProfile() {
    try {
        const session = await requireAuth();

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                profileImage: true,
                specialties: true,
                qualifications: true,
            },
        });

        return { success: true, user };
    } catch (error) {
        console.error("Profile fetch error:", error);
        return { success: false, error: "프로필 조회에 실패했습니다." };
    }
}
