"use client";

import { useAuth } from "./useAuth";
import { hasPermission, Permission } from "@/lib/auth/permissions";
import { MemberRole } from "@prisma/client";

export function usePermission() {
    const { role } = useAuth();

    return {
        can: (permission: Permission) => {
            if (!role) return false;
            return hasPermission(role as MemberRole, permission);
        },
        isOwner: role === "owner",
        isAdmin: role === "admin" || role === "owner",
        isCounselor: role === "counselor",
        isStaff: role === "staff",
    };
}
