'use client';

import { useEffect, useState, useCallback } from 'react';

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            console.warn('Browser does not support notifications');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (error) {
            console.error('Failed to request notification permission:', error);
            return false;
        }
    }, [isSupported]);

    const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (permission !== 'granted' || !isSupported) {
            console.warn('Notifications not permitted or not supported');
            return null;
        }

        try {
            const notification = new Notification(title, {
                icon: '/icon-192x192.png',
                badge: '/icon-72x72.png',
                timestamp: Date.now(),
                ...options,
            });

            // Auto-close after 10 seconds
            setTimeout(() => notification.close(), 10000);

            return notification;
        } catch (error) {
            console.error('Failed to send notification:', error);
            return null;
        }
    }, [permission, isSupported]);

    return {
        isSupported,
        permission,
        isGranted: permission === 'granted',
        requestPermission,
        sendNotification,
    };
}
