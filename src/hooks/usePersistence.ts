"use client";

import { useState, useEffect } from "react";
import { Client, MOCK_CLIENTS } from "@/data/mockClients";

const STORAGE_KEY = "hana-clients-v2";

export function usePersistence() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize from localStorage or fallback to MOCK_CLIENTS
    useEffect(() => {
        const loadClients = () => {
            const storedClients = localStorage.getItem(STORAGE_KEY);
            if (storedClients) {
                try {
                    setClients(JSON.parse(storedClients));
                } catch (e) {
                    console.error("Failed to parse stored clients:", e);
                    setClients(MOCK_CLIENTS);
                }
            } else {
                setClients(MOCK_CLIENTS);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CLIENTS));
            }
            setIsLoaded(true);
        };

        loadClients();

        // Listen for changes from other tabs/windows
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadClients();
            }
        };

        // Listen for changes from the same window (custom event)
        const handleCustomEvent = (e: Event) => {
            loadClients();
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("hana-storage-update", handleCustomEvent);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("hana-storage-update", handleCustomEvent);
        };
    }, []);

    // Save clients to localStorage whenever they change
    const saveClients = (newClients: Client[]) => {
        setClients(newClients);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newClients));
        // Dispatch custom event to notify other hooks in the same window
        window.dispatchEvent(new Event("hana-storage-update"));
    };

    const addClient = (client: Client) => {
        const newClients = [client, ...clients];
        saveClients(newClients);
    };

    const updateClient = (updatedClient: Client) => {
        // Optimistic update for the caller
        const newClients = clients.map((c) =>
            c.id === updatedClient.id ? updatedClient : c
        );
        saveClients(newClients);
    };

    const deleteClient = (clientId: string) => {
        const newClients = clients.filter((c) => c.id !== clientId);
        saveClients(newClients);
    };

    const getClient = (clientId: string) => {
        return clients.find((c) => c.id === clientId);
    };

    return {
        clients,
        isLoaded,
        addClient,
        updateClient,
        deleteClient,
        getClient
    };
}
