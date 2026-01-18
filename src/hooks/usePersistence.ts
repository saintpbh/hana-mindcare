"use client";

import { useState, useEffect } from "react";
// import { Client, MOCK_CLIENTS } from "@/data/mockClients"; // Deprecated
import { getClients, updateClient as updateClientAction, createClient as createClientAction, deleteClient as deleteClientAction, restartClient as restartClientAction } from "@/app/actions/clients";
import { type Client, Prisma } from "@prisma/client";

// Fallback or Initial Data could be MOCK if DB is empty, but better to just use DB
// We need to match the type. Prisma Client has createdAt, updatedAt.
// The UI might expect specific fields.

export function usePersistence() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "error">("synced");

    const fetchClients = async () => {
        const result = await getClients();
        if (result.success && result.data) {
            setClients(result.data);
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        fetchClients();

        // Optional: Polling for freshness
        const interval = setInterval(fetchClients, 10000); // 10s polling
        return () => clearInterval(interval);
    }, []);

    const addClient = async (client: Prisma.ClientCreateInput) => {
        // Optimistic
        setSyncStatus("saving");
        // We don't have ID yet, so we can't easily optimistic update array unless we generate temp ID.
        // For simplicity, wait for server response or generate temp ID.
        // Let's rely on server for creation for now to ensure ID consistency.

        const result = await createClientAction(client);
        if (result.success && result.data) {
            setClients(prev => [result.data!, ...prev]);
            setSyncStatus("synced");
        } else {
            setSyncStatus("error");
        }
    };

    const updateClient = async (updatedClient: Client) => {
        // Optimistic Update
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
        setSyncStatus("saving");

        // Server Action
        // Extract ID and data
        const { id, createdAt, updatedAt, ...data } = updatedClient;
        const result = await updateClientAction(id, data);

        if (result.success) {
            setSyncStatus("synced");
            // Optional: Update with server response to ensure consistency (e.g. updatedAt)
            if (result.data) {
                setClients(prev => prev.map(c => c.id === result.data!.id ? result.data! : c));
            }
        } else {
            setSyncStatus("error");
            // Revert? Complex without history. For now, alert or refetch.
            fetchClients();
        }
    };

    const deleteClient = async (clientId: string) => {
        // Optimistic
        setClients(prev => prev.filter(c => c.id !== clientId));
        setSyncStatus("saving");

        const result = await deleteClientAction(clientId);
        if (result.success) {
            setSyncStatus("synced");
        } else {
            setSyncStatus("error");
            fetchClients();
        }
    };

    const getClient = (clientId: string) => {
        return clients.find((c) => c.id === clientId);
    };

    const terminateClient = async (clientId: string) => {
        // Optimistic Update
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, status: 'terminated', terminatedAt: new Date() } : c));
        setSyncStatus("saving");

        const result = await import("@/app/actions/clients").then(mod => mod.terminateClient(clientId));

        if (result.success) {
            setSyncStatus("synced");
            if (result.data) {
                setClients(prev => prev.map(c => c.id === result.data!.id ? result.data! : c));
            }
        } else {
            setSyncStatus("error");
            fetchClients();
        }
    };

    const restartClient = async (clientId: string) => {
        // Optimistic
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, status: 'stable', terminatedAt: null } : c));
        setSyncStatus("saving");

        const result = await restartClientAction(clientId);
        if (result.success) {
            setSyncStatus("synced");
        } else {
            setSyncStatus("error");
            fetchClients();
        }
    };

    return {
        clients,
        isLoaded,
        addClient,
        updateClient,
        deleteClient,
        terminateClient,
        restartClient,
        getClient,
        syncStatus
    };
}
