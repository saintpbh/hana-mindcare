"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
    const { data: session, status } = useSession();

    return {
        user: session?.user,
        accountId: session?.accountId,
        accountType: session?.accountType,
        role: session?.role,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        session,
    };
}
