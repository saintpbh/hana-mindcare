"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = 'counselor' | 'admin' | 'solo';

interface UserRoleContextType {
    role: UserRole;
    setRole: (role: UserRole) => void;
    isCounselor: boolean;
    isAdmin: boolean;
    isSolo: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<UserRole>('counselor');

    // Persist role simulation
    useEffect(() => {
        const savedRole = localStorage.getItem('demo_user_role') as UserRole;
        if (savedRole) setRole(savedRole);
    }, []);

    const updateRole = (newRole: UserRole) => {
        setRole(newRole);
        localStorage.setItem('demo_user_role', newRole);
    };

    const value = {
        role,
        setRole: updateRole,
        isCounselor: role === 'counselor',
        isAdmin: role === 'admin',
        isSolo: role === 'solo',
    };

    return (
        <UserRoleContext.Provider value={value}>
            {children}
        </UserRoleContext.Provider>
    );
}

export function useUserRole() {
    const context = useContext(UserRoleContext);
    if (context === undefined) {
        throw new Error("useUserRole must be used within a UserRoleProvider");
    }
    return context;
}
