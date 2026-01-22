'use server'

import { prisma } from '@/lib/prisma';

type NotificationData = {
    userId: string;
    type: string;
    title: string;
    message: string;
    appointmentId?: string;
    scheduledFor: Date;
};

/**
 * 알림 생성 및 예약
 */
export async function scheduleNotification(data: NotificationData) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                appointmentId: data.appointmentId,
                scheduledFor: data.scheduledFor,
            },
        });

        return { success: true, data: notification };
    } catch (error) {
        console.error('알림 예약 실패:', error);
        return { success: false, error: '알림 예약에 실패했습니다.' };
    }
}

/**
 * 다가오는 알림 조회 (발송 대기 중)
 */
export async function getUpcomingNotifications(userId: string) {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId,
                sentAt: null,
                scheduledFor: { gte: new Date() },
            },
            orderBy: { scheduledFor: 'asc' },
        });

        return { success: true, data: notifications };
    } catch (error) {
        console.error('알림 조회 실패:', error);
        return { success: false, error: '알림을 불러오지 못했습니다.', data: [] };
    }
}

/**
 * 발송된 알림 조회
 */
export async function getSentNotifications(userId: string, limit = 20) {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId,
                sentAt: { not: null },
            },
            orderBy: { sentAt: 'desc' },
            take: limit,
        });

        return { success: true, data: notifications };
    } catch (error) {
        console.error('알림 조회 실패:', error);
        return { success: false, error: '알림을 불러오지 못했습니다.', data: [] };
    }
}

/**
 * 알림 읽음 처리
 */
export async function markNotificationAsRead(notificationId: string) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
        return { success: true };
    } catch (error) {
        console.error('알림 업데이트 실패:', error);
        return { success: false, error: '알림 업데이트에 실패했습니다.' };
    }
}

/**
 * 알림 발송 처리
 */
export async function markNotificationAsSent(notificationId: string) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { sentAt: new Date() },
        });
        return { success: true };
    } catch (error) {
        console.error('알림 발송 처리 실패:', error);
        return { success: false, error: '알림 발송 처리에 실패했습니다.' };
    }
}

/**
 * 알림 설정 조회
 */
export async function getNotificationSettings(userId: string) {
    try {
        let settings = await prisma.notificationSettings.findUnique({
            where: { userId },
        });

        if (!settings) {
            // 기본 설정 생성
            settings = await prisma.notificationSettings.create({
                data: { userId },
            });
        }

        return { success: true, data: settings };
    } catch (error) {
        console.error('설정 조회 실패:', error);
        return { success: false, error: '설정을 불러오지 못했습니다.', data: null };
    }
}

/**
 * 알림 설정 업데이트
 */
export async function updateNotificationSettings(
    userId: string,
    settings: Partial<{
        browserEnabled: boolean;
        reminder30min: boolean;
        reminder1hour: boolean;
        smsEnabled: boolean;
        smsOnScheduleChange: boolean;
        autoStartRecording: boolean;
    }>
) {
    try {
        const updated = await prisma.notificationSettings.upsert({
            where: { userId },
            update: settings,
            create: { userId, ...settings },
        });

        return { success: true, data: updated };
    } catch (error) {
        console.error('설정 업데이트 실패:', error);
        return { success: false, error: '설정 업데이트에 실패했습니다.' };
    }
}

/**
 * 일정 기반 알림 자동 생성
 */
export async function createAppointmentNotifications(
    userId: string,
    appointmentId: string,
    appointmentTime: Date,
    clientName: string
) {
    try {
        const settingsResult = await getNotificationSettings(userId);
        if (!settingsResult.success || !settingsResult.data) {
            return { success: false, error: '설정을 불러올 수 없습니다.' };
        }

        const settings = settingsResult.data;
        const notifications: NotificationData[] = [];

        // 1시간 전 알림
        if (settings.reminder1hour && settings.browserEnabled) {
            const oneHourBefore = new Date(appointmentTime.getTime() - 60 * 60 * 1000);
            if (oneHourBefore > new Date()) {
                notifications.push({
                    userId,
                    type: 'session_reminder_1hour',
                    title: '상담 1시간 전',
                    message: `${clientName}님과의 상담이 1시간 후 시작됩니다.`,
                    appointmentId,
                    scheduledFor: oneHourBefore,
                });
            }
        }

        // 30분 전 알림
        if (settings.reminder30min && settings.browserEnabled) {
            const thirtyMinBefore = new Date(appointmentTime.getTime() - 30 * 60 * 1000);
            if (thirtyMinBefore > new Date()) {
                notifications.push({
                    userId,
                    type: 'session_reminder_30min',
                    title: '상담 30분 전',
                    message: `${clientName}님과의 상담이 곧 시작됩니다. 준비해주세요.`,
                    appointmentId,
                    scheduledFor: thirtyMinBefore,
                });
            }
        }

        // 일괄 생성
        for (const notif of notifications) {
            await scheduleNotification(notif);
        }

        return { success: true, count: notifications.length };
    } catch (error) {
        console.error('알림 생성 실패:', error);
        return { success: false, error: '알림 생성에 실패했습니다.' };
    }
}

/**
 * 일정 삭제 시 관련 알림 삭제
 */
export async function deleteAppointmentNotifications(appointmentId: string) {
    try {
        await prisma.notification.deleteMany({
            where: {
                appointmentId,
                sentAt: null, // 아직 발송되지 않은 알림만 삭제
            },
        });
        return { success: true };
    } catch (error) {
        console.error('알림 삭제 실패:', error);
        return { success: false, error: '알림 삭제에 실패했습니다.' };
    }
}
