'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface CreatePostInput {
    title: string
    content: string
    category: string
    tags?: string[]
    isAnonymous?: boolean
    authorId?: string
    authorName?: string
    authorRole?: string
}

export async function createPost(data: CreatePostInput) {
    try {
        console.log('[createPost] Attempting to create post with data:', JSON.stringify(data, null, 2));

        const post = await prisma.post.create({
            data: {
                title: data.title,
                content: data.content,
                category: data.category,
                tags: data.tags || [],
                isAnonymous: data.isAnonymous || false,
                authorId: data.isAnonymous ? null : data.authorId,
                authorName: data.isAnonymous ? null : data.authorName,
                authorRole: data.isAnonymous ? null : data.authorRole,
            },
            include: {
                _count: {
                    select: { comments: true, likes: true }
                }
            }
        })

        console.log('[createPost] Post created successfully:', post.id);
        revalidatePath('/community')
        return { success: true, data: post }
    } catch (error: any) {
        console.error('[createPost] ===== ERROR DETAILS =====');
        console.error('[createPost] Error message:', error?.message);
        console.error('[createPost] Error name:', error?.name);
        console.error('[createPost] Error code:', error?.code);
        console.error('[createPost] Full error:', error);
        console.error('[createPost] Stack trace:', error?.stack);
        return { success: false, error: `Failed to create post: ${error?.message || 'Unknown error'}` }
    }
}

export async function getPosts(params?: {
    category?: string
    searchQuery?: string
    sortBy?: 'latest' | 'popular' | 'comments'
    limit?: number
    cursor?: string
}) {
    try {
        const {
            category,
            searchQuery,
            sortBy = 'latest',
            limit = 10,
            cursor
        } = params || {}

        const where: any = {}

        if (category && category !== '전체') {
            // Match category by 한글 name (e.g., "상담 팁")
            where.category = { contains: category }
        }

        if (searchQuery) {
            where.OR = [
                { title: { contains: searchQuery, mode: 'insensitive' } },
                { content: { contains: searchQuery, mode: 'insensitive' } },
            ]
        }

        let orderBy: any = { createdAt: 'desc' } // default
        if (sortBy === 'popular') {
            // We'll sort by like count client-side for now
            // or you can use a raw query for complex sorting
        }

        const posts = await prisma.post.findMany({
            where,
            orderBy,
            take: limit + 1, // +1 for cursor pagination
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            include: {
                _count: {
                    select: { comments: true, likes: true }
                }
            }
        })

        const hasMore = posts.length > limit
        const postsToReturn = hasMore ? posts.slice(0, -1) : posts

        return {
            success: true,
            data: postsToReturn,
            nextCursor: hasMore ? postsToReturn[postsToReturn.length - 1].id : null
        }
    } catch (error) {
        console.error('Failed to fetch posts:', error)
        return { success: false, error: 'Failed to fetch posts' }
    }
}

export async function getPost(id: string) {
    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                comments: {
                    where: { parentId: null }, // Top-level comments only
                    include: {
                        replies: {
                            orderBy: { createdAt: 'asc' }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: { likes: true, bookmarks: true }
                }
            }
        })

        if (!post) {
            return { success: false, error: 'Post not found' }
        }

        // Increment view count
        await prisma.post.update({
            where: { id },
            data: { viewCount: { increment: 1 } }
        })

        return { success: true, data: post }
    } catch (error) {
        console.error('Failed to fetch post:', error)
        return { success: false, error: 'Failed to fetch post' }
    }
}

export async function updatePost(id: string, data: Partial<CreatePostInput>) {
    try {
        const post = await prisma.post.update({
            where: { id },
            data: {
                title: data.title,
                content: data.content,
                category: data.category,
                tags: data.tags,
            }
        })

        revalidatePath('/community')
        revalidatePath(`/community/${id}`)
        return { success: true, data: post }
    } catch (error) {
        console.error('Failed to update post:', error)
        return { success: false, error: 'Failed to update post' }
    }
}

export async function deletePost(id: string) {
    try {
        await prisma.post.delete({
            where: { id }
        })

        revalidatePath('/community')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete post:', error)
        return { success: false, error: 'Failed to delete post' }
    }
}

// ============================================
// Comments
// ============================================

export async function createComment(data: {
    postId: string
    content: string
    authorId?: string
    authorName?: string
    authorRole?: string
    parentId?: string
}) {
    try {
        const comment = await prisma.comment.create({
            data: {
                postId: data.postId,
                content: data.content,
                authorId: data.authorId,
                authorName: data.authorName,
                authorRole: data.authorRole,
                parentId: data.parentId,
            }
        })

        revalidatePath(`/community/${data.postId}`)
        return { success: true, data: comment }
    } catch (error) {
        console.error('Failed to create comment:', error)
        return { success: false, error: 'Failed to create comment' }
    }
}

export async function deleteComment(id: string, postId: string) {
    try {
        await prisma.comment.delete({
            where: { id }
        })

        revalidatePath(`/community/${postId}`)
        return { success: true }
    } catch (error) {
        console.error('Failed to delete comment:', error)
        return { success: false, error: 'Failed to delete comment' }
    }
}

// ============================================
// Likes
// ============================================

export async function toggleLike(postId: string, userId: string) {
    try {
        const existing = await prisma.postLike.findUnique({
            where: {
                postId_userId: { postId, userId }
            }
        })

        if (existing) {
            await prisma.postLike.delete({
                where: { id: existing.id }
            })
        } else {
            await prisma.postLike.create({
                data: { postId, userId }
            })
        }

        revalidatePath(`/community/${postId}`)
        revalidatePath('/community')
        return { success: true, isLiked: !existing }
    } catch (error) {
        console.error('Failed to toggle like:', error)
        return { success: false, error: 'Failed to toggle like' }
    }
}

export async function toggleBookmark(postId: string, userId: string) {
    try {
        const existing = await prisma.postBookmark.findUnique({
            where: {
                postId_userId: { postId, userId }
            }
        })

        if (existing) {
            await prisma.postBookmark.delete({
                where: { id: existing.id }
            })
        } else {
            await prisma.postBookmark.create({
                data: { postId, userId }
            })
        }

        revalidatePath(`/community/${postId}`)
        return { success: true, isBookmarked: !existing }
    } catch (error) {
        console.error('Failed to toggle bookmark:', error)
        return { success: false, error: 'Failed to toggle bookmark' }
    }
}

export async function checkUserLikeStatus(postId: string, userId: string) {
    try {
        const like = await prisma.postLike.findUnique({
            where: { postId_userId: { postId, userId } }
        })
        return { success: true, isLiked: !!like }
    } catch (error) {
        return { success: false, isLiked: false }
    }
}

export async function checkUserBookmarkStatus(postId: string, userId: string) {
    try {
        const bookmark = await prisma.postBookmark.findUnique({
            where: { postId_userId: { postId, userId } }
        })
        return { success: true, isBookmarked: !!bookmark }
    } catch (error) {
        return { success: false, isBookmarked: false }
    }
}
