import { MemberRole } from "@prisma/client";

export type Permission =
    | "client:create"
    | "client:read:all"
    | "client:read:assigned"
    | "client:update:all"
    | "client:update:assigned"
    | "client:delete"
    | "session:create"
    | "session:read:all"
    | "session:read:own"
    | "session:update:own"
    | "member:invite"
    | "member:remove"
    | "member:changeRole"
    | "settings:view"
    | "settings:edit"
    | "billing:manage";

const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
    owner: [
        "client:create",
        "client:read:all",
        "client:update:all",
        "client:delete",
        "session:create",
        "session:read:all",
        "session:update:own",
        "member:invite",
        "member:remove",
        "member:changeRole",
        "settings:view",
        "settings:edit",
        "billing:manage",
    ],
    admin: [
        "client:create",
        "client:read:all",
        "client:update:all",
        "client:delete",
        "session:create",
        "session:read:all",
        "session:update:own",
        "member:invite",
        "member:changeRole",
        "settings:view",
        "settings:edit",
    ],
    counselor: [
        "client:create",
        "client:read:assigned",
        "client:update:assigned",
        "session:create",
        "session:read:own",
        "session:update:own",
        "settings:view",
    ],
    staff: [
        "client:read:assigned",
        "settings:view",
    ],
};

export function hasPermission(
    role: MemberRole,
    permission: Permission
): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

export function hasAnyPermission(
    role: MemberRole,
    permissions: Permission[]
): boolean {
    return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
    role: MemberRole,
    permissions: Permission[]
): boolean {
    return permissions.every((p) => hasPermission(role, p));
}
