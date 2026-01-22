import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            isSuperAdmin: boolean;
            isApproved: boolean;
        } & DefaultSession["user"];
        accountId: string;
        accountType: "personal" | "organization";
        role: "owner" | "admin" | "counselor" | "staff";
        isSuperAdmin: boolean;
    }

    interface User {
        id: string;
        isSuperAdmin?: boolean;
        isApproved?: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId: string;
        accountId?: string;
        accountType?: "personal" | "organization";
        role?: "owner" | "admin" | "counselor" | "staff";
        isSuperAdmin?: boolean;
        isApproved?: boolean;
    }
}
