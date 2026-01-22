'use server'

import { prisma } from '@/lib/prisma';

/**
 * 내담자 즐겨찾기 토글
 */
export async function toggleClientFavorite(clientId: string, isFavorite: boolean) {
    try {
        await prisma.client.update({
            where: { id: clientId },
            data: { isFavorite },
        });

        return { success: true };
    } catch (error) {
        console.error('즐겨찾기 업데이트 실패:', error);
        return { success: false, error: '즐겨찾기 업데이트에 실패했습니다.' };
    }
}

/**
 * 즐겨찾기 내담자 목록 조회
 */
export async function getFavoriteClients() {
    try {
        const clients = await prisma.client.findMany({
            where: {
                isFavorite: true,
                terminatedAt: null,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return { success: true, data: clients };
    } catch (error) {
        console.error('즐겨찾기 내담자 조회 실패:', error);
        return { success: false, error: '조회에 실패했습니다.', data: [] };
    }
}
