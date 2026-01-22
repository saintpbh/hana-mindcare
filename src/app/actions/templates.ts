'use server'

import { prisma } from '@/lib/prisma';

type TemplateContent = {
    // SOAP 노트
    S?: string;
    O?: string;
    A?: string;
    P?: string;
    // 처방전
    title?: string;
    description?: string;
    category?: string;
    resources?: string[];
    // Quick Note
    text?: string;
};

/**
 * 템플릿 생성
 */
export async function createTemplate(data: {
    userId: string;
    type: string;
    name: string;
    category?: string;
    content: TemplateContent;
    isPublic?: boolean;
}) {
    try {
        const template = await prisma.template.create({
            data: {
                userId: data.userId,
                type: data.type,
                name: data.name,
                category: data.category,
                content: data.content as any,
                isPublic: data.isPublic || false,
            },
        });

        return { success: true, data: template };
    } catch (error) {
        console.error('템플릿 생성 실패:', error);
        return { success: false, error: '템플릿 생성에 실패했습니다.' };
    }
}

/**
 * 사용자별 템플릿 조회
 */
export async function getTemplates(userId: string, type?: string, category?: string) {
    try {
        const templates = await prisma.template.findMany({
            where: {
                OR: [
                    { userId },
                    { isPublic: true },
                ],
                ...(type && { type }),
                ...(category && category !== 'all' && { category }),
            },
            orderBy: [
                { isFavorite: 'desc' },
                { usageCount: 'desc' },
                { updatedAt: 'desc' },
            ],
        });

        return { success: true, data: templates };
    } catch (error) {
        console.error('템플릿 조회 실패:', error);
        return { success: false, error: '템플릿을 불러오지 못했습니다.', data: [] };
    }
}

/**
 * 템플릿 업데이트
 */
export async function updateTemplate(
    id: string,
    data: {
        name?: string;
        category?: string;
        content?: TemplateContent;
        isPublic?: boolean;
    }
) {
    try {
        const template = await prisma.template.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.category !== undefined && { category: data.category }),
                ...(data.content && { content: data.content as any }),
                ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
            },
        });

        return { success: true, data: template };
    } catch (error) {
        console.error('템플릿 업데이트 실패:', error);
        return { success: false, error: '템플릿 업데이트에 실패했습니다.' };
    }
}

/**
 * 템플릿 삭제
 */
export async function deleteTemplate(id: string) {
    try {
        await prisma.template.delete({
            where: { id },
        });

        return { success: true };
    } catch (error) {
        console.error('템플릿 삭제 실패:', error);
        return { success: false, error: '템플릿 삭제에 실패했습니다.' };
    }
}

/**
 * 사용 횟수 증가
 */
export async function incrementTemplateUsage(id: string) {
    try {
        await prisma.template.update({
            where: { id },
            data: {
                usageCount: { increment: 1 },
            },
        });

        return { success: true };
    } catch (error) {
        console.error('템플릿 사용 횟수 업데이트 실패:', error);
        return { success: false, error: '업데이트에 실패했습니다.' };
    }
}

/**
 * 즐겨찾기 토글
 */
export async function toggleTemplateFavorite(id: string, isFavorite: boolean) {
    try {
        await prisma.template.update({
            where: { id },
            data: { isFavorite },
        });

        return { success: true };
    } catch (error) {
        console.error('즐겨찾기 업데이트 실패:', error);
        return { success: false, error: '즐겨찾기 업데이트에 실패했습니다.' };
    }
}
