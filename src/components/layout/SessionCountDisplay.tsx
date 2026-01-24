"use client";

import { useEffect, useState } from "react";

export function SessionCountDisplay() {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTodaySessionCount() {
            try {
                const response = await fetch('/api/sessions/today-count');
                if (response.ok) {
                    const data = await response.json();
                    setCount(data.count);
                } else {
                    setCount(0);
                }
            } catch (error) {
                console.error('Failed to fetch today session count:', error);
                setCount(0);
            } finally {
                setLoading(false);
            }
        }

        fetchTodaySessionCount();
    }, []);

    if (loading) {
        return <p className="text-sm text-neutral-500">Loading...</p>;
    }

    if (count === null || count === 0) {
        return <p className="text-sm text-neutral-500">No sessions scheduled today</p>;
    }

    return (
        <p className="text-sm text-neutral-500">
            You have {count} session{count !== 1 ? 's' : ''} today
        </p>
    );
}
