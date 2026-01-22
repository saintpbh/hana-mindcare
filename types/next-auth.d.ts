import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
        };
        accountId: string;
        accountType: "personal" | "organization";
        role: "owner" | "admin" | "counselor" | "staff";
    }

    interface User {
        id: string;
        email: string;
        name: string;
        image?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId: string;
        accountId: string;
        accountType: "personal" | "organization";
        role: "owner" | "admin" | "counselor" | "staff";
    }
}
