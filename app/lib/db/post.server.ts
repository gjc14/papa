import { PostStatus } from '~/lib/schema/system'
import { prisma } from '~/lib/db/db.server'

export const getPosts = async (props?: {
    n?: number
    status?: PostStatus
    categoryFilter?: string[]
    subCategoryFilter?: string[]
    tagFilter?: string[]
}): Promise<{
    posts: typeof posts
}> => {
    const { n, status, categoryFilter, subCategoryFilter, tagFilter } =
        props || {}
    const whereCategory = {
        categories: { some: { name: { in: categoryFilter } } },
    }
    const whereSubCategory = {
        subCategories: { some: { name: { in: subCategoryFilter } } },
    }
    const whereTag = { tags: { some: { name: { in: tagFilter } } } }

    const posts = await prisma.post.findMany({
        where: {
            status,
            ...(Array.isArray(categoryFilter) &&
                categoryFilter.length > 0 &&
                whereCategory),
            ...(Array.isArray(subCategoryFilter) &&
                subCategoryFilter.length > 0 &&
                whereSubCategory),
            ...(Array.isArray(tagFilter) && tagFilter.length > 0 && whereTag),
        },
        take: n,
        orderBy: { createdAt: 'desc' },
        include: {
            seo: {
                select: { title: true, description: true },
            },
            author: {
                select: { email: true, name: true },
            },
        },
    })
    return { posts }
}

export const getPost = async (
    id: string
): Promise<{
    post: typeof post
}> => {
    const post = await prisma.post.findFirst({
        where: { id },
        include: {
            seo: {
                select: { title: true, description: true },
            },
        },
    })

    return { post }
}

export const getPostBySlug = async (
    slug: string,
    status: PostStatus = 'PUBLISHED'
): Promise<{
    post: typeof post
    prev: { title: string; slug: string } | null
    next: { title: string; slug: string } | null
}> => {
    const post = await prisma.post.findFirst({
        where: { slug },
        include: {
            seo: {
                select: { title: true, description: true },
            },
            author: {
                select: {
                    name: true,
                    imageUri: true,
                    email: true,
                },
            },
            categories: true,
            tags: true,
        },
    })

    if (!post) {
        return { post: null, prev: null, next: null }
    }

    const prev = await prisma.post.findFirst({
        where: {
            createdAt: { lt: post.createdAt },
            status: status,
        },
        select: { slug: true, title: true },
        orderBy: { createdAt: 'desc' },
    })

    const next = await prisma.post.findFirst({
        where: {
            createdAt: { gt: post.createdAt },
            status: status,
        },
        select: { slug: true, title: true },
        orderBy: { createdAt: 'asc' },
    })

    return { post, prev, next }
}

interface CreatePostProps {
    title: string
    content: string
    excerpt: string
    slug: string
    status: PostStatus
    authorId: string
    tagIDs: string[]
    categoryIDs: string[]
    seo: {
        metaTitle?: string
        metaDescription?: string
    }
}

export const createPost = async (
    props: CreatePostProps
): Promise<{ post: typeof post }> => {
    const {
        title,
        content,
        excerpt,
        slug,
        status,
        authorId,
        seo,
        tagIDs,
        categoryIDs,
    } = props

    const post = await prisma.$transaction(async tx => {
        const seoCreated = await tx.seo.create({
            data: {
                title: seo.metaTitle || title, // Title h1 matches metaTitle is best for SEO, page structure, and accessibility
                description: seo.metaDescription ?? '',
                autoGenerated: true,
            },
            select: { id: true },
        })
        return await tx.post.create({
            data: {
                title,
                content,
                excerpt,
                slug,
                status,

                authorId,
                tagIDs: tagIDs,
                categoryIDs: categoryIDs,
                seoId: seoCreated.id,
            },
        })
    })
    return { post }
}

interface UpdatePostProps extends CreatePostProps {
    id: string
}

export const updatePost = async (
    props: UpdatePostProps
): Promise<{ post: typeof post }> => {
    const {
        id,
        title,
        content,
        excerpt,
        slug,
        status,
        authorId,
        tagIDs,
        categoryIDs,
        seo,
    } = props

    const post = await prisma.$transaction(async tx => {
        return await tx.post.update({
            where: { id },
            data: {
                title,
                content,
                excerpt,
                slug,
                status,

                author: {
                    connect: { id: authorId },
                },
                // About set method: https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#disconnect-all-related-records
                tags: {
                    set: tagIDs.map(id => ({ id })),
                },
                categories: {
                    set: categoryIDs.map(id => ({ id })),
                },
                seo: {
                    update: {
                        title: seo.metaTitle ?? '',
                        description: seo.metaDescription ?? '',
                    },
                },
            },
        })
    })
    return { post }
}

export const deletePost = async (
    id: string
): Promise<{ post: typeof post }> => {
    const post = await prisma.post.delete({
        where: { id },
    })
    return { post }
}
