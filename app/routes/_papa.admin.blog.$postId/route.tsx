import { ActionFunctionArgs } from '@remix-run/node'
import { Form, Link, useFetcher, useParams } from '@remix-run/react'
import { ExternalLink, Loader2, Save, Trash } from 'lucide-react'
import { useMemo, useState } from 'react'
import { z } from 'zod'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { userIs } from '~/lib/db/auth.server'
import { createCategory, createTag } from '~/lib/db/blog-taxonomy.server'
import { updatePost } from '~/lib/db/post.server'
import { ConventionalActionResponse } from '~/lib/utils'
import { PostContent } from '~/routes/_papa.admin.blog.$postId/components/post-content'
import { taxonomySchema } from '~/routes/_papa.admin.blog.taxonomy.resource/route'
import { useAdminBlogContext } from '~/routes/_papa.admin.blog/route'
import {
    AdminActions,
    AdminHeader,
    AdminSectionWrapper,
    AdminTitle,
} from '~/routes/_papa.admin/components/admin-wrapper'
import { PostStatus } from '~/lib/schema/system'

const PostContentUpdateSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    excerpt: z.string(),
    slug: z.string(),
    status: PostStatus,
    autherId: z.string().optional(),
    tagIDs: z.preprocess(val => {
        return typeof val === 'string' ? val.split(',').filter(Boolean) : []
    }, z.array(z.string()).default([])),
    categoryIDs: z.preprocess(val => {
        return typeof val === 'string' ? val.split(',').filter(Boolean) : []
    }, z.array(z.string()).default([])),
    'seo-title': z.string(),
    'seo-description': z.string(),
    newTags: z.preprocess(val => {
        if (typeof val === 'string') {
            try {
                return JSON.parse(val)
            } catch {
                return []
            }
        }
        return Array.isArray(val) ? val : []
    }, z.array(taxonomySchema).default([])),
    newCategories: z.preprocess(val => {
        if (typeof val === 'string') {
            try {
                return JSON.parse(val)
            } catch {
                return []
            }
        }
        return Array.isArray(val) ? val : []
    }, z.array(taxonomySchema).default([])),
})

export const action = async ({ request }: ActionFunctionArgs) => {
    const { user: admin } = await userIs(request, ['ADMIN'])

    if (request.method !== 'PUT') {
        throw new Response('Method not allowed', { status: 405 })
    }

    const formData = await request.formData()
    const updatePostData = Object.fromEntries(formData)

    const zResult = PostContentUpdateSchema.safeParse(updatePostData)

    if (!zResult.success || !zResult.data) {
        console.log('updatePostData', zResult.error.issues)
        const message = zResult.error.issues
            .map(issue => `${issue.message} ${issue.path[0]}`)
            .join(' & ')
        return Response.json({
            err: message,
        } satisfies ConventionalActionResponse)
    }

    const [newTags, newCategories] = [
        zResult.data.newTags,
        zResult.data.newCategories,
    ]

    if (newCategories.length > 0) {
        await Promise.all(
            newCategories.map(async category => {
                await createCategory({ id: category.id, name: category.name })
            })
        )
    }

    if (newTags.length > 0) {
        await Promise.all(
            newTags.map(async tag => {
                await createTag({ id: tag.id, name: tag.name })
            })
        )
    }

    try {
        const { post } = await updatePost({
            id: zResult.data.id,
            title: zResult.data.title,
            content: zResult.data.content,
            excerpt: zResult.data.excerpt,
            slug: zResult.data.slug,
            status: zResult.data.status,
            authorId: admin.id,
            tagIDs: zResult.data.tagIDs,
            categoryIDs: zResult.data.categoryIDs,
            seo: {
                metaTitle: zResult.data['seo-title'],
                metaDescription: zResult.data['seo-description'],
            },
        })

        return Response.json({
            msg: `Post ${post.title} updated successfully`,
        } satisfies ConventionalActionResponse)
    } catch (error) {
        console.error(error)
        return Response.json({
            data: null,
            err: 'Failed to create post',
        } satisfies ConventionalActionResponse)
    }
}

export default function AdminPost() {
    const fetcher = useFetcher()
    const params = useParams()
    const postId = params.postId
    const { posts, tags, categories } = useAdminBlogContext()
    const post = posts.find(p => p.id === postId)

    if (!post) {
        return (
            <h2 className="grow flex items-center justify-center">Not found</h2>
        )
    }

    const [isDirty, setIsDirty] = useState(false)

    const postContent = useMemo(() => {
        return {
            ...post,
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt),
        }
    }, [post])

    const isSubmitting = fetcher.state === 'submitting'

    return (
        <AdminSectionWrapper>
            <AdminHeader>
                <AdminTitle
                    title="Edit Post"
                    description={'Post id: ' + post.id}
                ></AdminTitle>
                <AdminActions>
                    <Link
                        to={`/blog/${post.slug}?preview=true`}
                        target="_blank"
                    >
                        <Button variant={'link'}>
                            {postContent.status !== 'PUBLISHED'
                                ? 'Preview'
                                : 'See'}{' '}
                            post
                            <ExternalLink size={12} />
                        </Button>
                    </Link>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size={'sm'} variant={'destructive'}>
                                <Trash height={16} width={16} />
                                <p className="text-xs">Discard</p>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Discard Post
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to discard this post
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <Link to="/admin/blog">
                                    <AlertDialogAction
                                        onClick={() => {
                                            window.localStorage.removeItem(
                                                `dirty-post-${postContent.id}`
                                            )
                                        }}
                                    >
                                        Discard
                                    </AlertDialogAction>
                                </Link>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button type="submit" form="update-post" size={'sm'}>
                        {isSubmitting ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        <p className="text-xs">Save</p>
                    </Button>
                </AdminActions>
            </AdminHeader>

            <Form
                id="update-post"
                onSubmit={e => {
                    e.preventDefault()
                    fetcher.submit(e.currentTarget, { method: 'PUT' })
                    setIsDirty(false)
                }}
            >
                <input hidden name="id" defaultValue={post.id} />
                <PostContent
                    post={postContent}
                    tags={tags}
                    categories={categories}
                    onPostChange={(_, dirty) => setIsDirty(dirty)}
                />
            </Form>
        </AdminSectionWrapper>
    )
}
