'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X, Clock } from 'lucide-react';
import { getSentNotifications, markNotificationAsRead } from '@/app/actions/notifications';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationCenterProps {
    userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadNotifications();

        // Poll for new notifications every minute
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, [userId]);

    const loadNotifications = async () => {
        setIsLoading(true);
        const result = await getSentNotifications(userId, 20);
        if (result.success && result.data) {
            setNotifications(result.data);
            setUnreadCount(result.data.filter((n: any) => !n.isRead).length);
        }
        setIsLoading(false);
    };

    const handleMarkAsRead = async (notificationId: string) => {
        const result = await markNotificationAsRead(notificationId);
        if (result.success) {
            loadNotifications();
        }
    };

    const handleMarkAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.isRead);
        for (const notification of unreadNotifications) {
            await markNotificationAsRead(notification.id);
        }
        loadNotifications();
    };

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full transition-colors"
                aria-label="알림"
            >
                <Bell className="w-5 h-5 text-[var(--color-midnight-navy)]" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-[var(--color-midnight-navy)]/10 z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-[var(--color-midnight-navy)]/5 flex justify-between items-center">
                                <h3 className="font-bold text-[var(--color-midnight-navy)]">알림</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        모두 읽음
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-[400px] overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-8 text-center text-[var(--color-midnight-navy)]/40">
                                        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-midnight-navy)]/20 border-t-[var(--color-midnight-navy)] rounded-full mx-auto m b-2" />
                                        로딩 중...
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-8 text-center text-[var(--color-midnight-navy)]/40">
                                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">알림이 없습니다</p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={cn(
                                                "p-4 border-b border-[var(--color-midnight-navy)]/5 hover:bg-[var(--color-midnight-navy)]/[0.02] transition-colors cursor-pointer",
                                                !notification.isRead && "bg-blue-50/50"
                                            )}
                                            onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                                    notification.type.includes('reminder') ? "bg-emerald-50" : "bg-blue-50"
                                                )}>
                                                    <Clock className={cn(
                                                        "w-5 h-5",
                                                        notification.type.includes('reminder') ? "text-emerald-600" : "text-blue-600"
                                                    )} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-semibold text-sm text-[var(--color-midnight-navy)]">
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.isRead && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[var(--color-midnight-navy)]/70 mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-[var(--color-midnight-navy)]/40 mt-2">
                                                        {new Date(notification.scheduledFor).toLocaleString('ko-KR', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-[var(--color-midnight-navy)]/5 text-center">
                                    <button className="text-xs text-[var(--color-midnight-navy)]/60 hover:text-[var(--color-midnight-navy)] font-medium">
                                        모든 알림 보기
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
