"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSettings, saveSetting } from "@/app/actions/settings";

interface BrandingState {
    title: string;
    logoStartColor: string;
    logoEndColor: string;
    updateBranding: (updates: Partial<Omit<BrandingState, "updateBranding">>) => Promise<void>;
}

const BrandingContext = createContext<BrandingState | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
    const [title, setTitle] = useState("Serene Care"); // Default
    const [logoStartColor, setLogoStartColor] = useState("from-[var(--color-champagne-gold)]"); // Default class or value
    const [logoEndColor, setLogoEndColor] = useState("to-amber-600"); // Default class or value

    useEffect(() => {
        const loadSettings = async () => {
            const settings = await getSettings(["APP_TITLE", "APP_LOGO_START", "APP_LOGO_END"]);
            if (settings.success && settings.data) {
                if (settings.data.APP_TITLE) setTitle(settings.data.APP_TITLE);
                if (settings.data.APP_LOGO_START) setLogoStartColor(settings.data.APP_LOGO_START);
                if (settings.data.APP_LOGO_END) setLogoEndColor(settings.data.APP_LOGO_END);
            }
        };
        loadSettings();
    }, []);

    const updateBranding = async (updates: Partial<Omit<BrandingState, "updateBranding">>) => {
        // Optimistic update
        if (updates.title) setTitle(updates.title);
        if (updates.logoStartColor) setLogoStartColor(updates.logoStartColor);
        if (updates.logoEndColor) setLogoEndColor(updates.logoEndColor);

        // Persist
        if (updates.title) await saveSetting("APP_TITLE", updates.title);
        if (updates.logoStartColor) await saveSetting("APP_LOGO_START", updates.logoStartColor);
        if (updates.logoEndColor) await saveSetting("APP_LOGO_END", updates.logoEndColor);
    };

    return (
        <BrandingContext.Provider value={{ title, logoStartColor, logoEndColor, updateBranding }}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    const context = useContext(BrandingContext);
    if (context === undefined) {
        throw new Error("useBranding must be used within a BrandingProvider");
    }
    return context;
}
