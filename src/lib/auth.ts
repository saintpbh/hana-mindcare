import { getServerSession } from "next-auth";
import { authOptions } from "./auth/config";
import { hasPermission, Permission } from "./auth/permissions";
import { MemberRole } from "@prisma/client";

export async function requireAuth() {
    const session = await getServerSession(authOptions);

    if (!session) {
        throw new Error("인증이 필요합니다.");
    }

    return session;
}

export async function requirePermission(permission: Permission) {
    const session = await requireAuth();
    const role = session.role as MemberRole;

    if (!hasPermission(role, permission)) {
        throw new Error(`권한이 없습니다: ${permission}`);
    }

    return session;
}

export async function getSession() {
    return await getServerSession(authOptions);
}
