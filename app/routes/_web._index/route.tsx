import { json, LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getPosts } from '~/lib/db/post.server'
import { getSEO } from '~/lib/db/seo.server'
import { Footer } from '~/routes/_web/components/footer'
import { Nav } from '~/routes/_web/components/nav'
import { CTA } from '~/routes/plugins/blog.plugin/_web.blog/components/cta'
import { LatestPosts } from '~/routes/plugins/blog.plugin/_web.blog/components/posts'
import { Hero } from './hero'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return data?.seo
        ? [
              { title: data.seo.title },
              { name: 'description', content: data.seo.description },
          ]
        : []
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { seo } = await getSEO(new URL(request.url).pathname)

    try {
        const { posts } = await getPosts({ n: 10, status: 'PUBLISHED' })
        return json({ seo, posts })
    } catch (error) {
        console.error(error)
        return json({ seo, posts: [] })
    }
}

export default function Index() {
    const { seo, posts } = useLoaderData<typeof loader>()

    return (
        <>
            <Nav />

            <main className="min-h-screen">
                <h1 className="visually-hidden">{seo?.title}</h1>
                <Hero />
                <LatestPosts
                    posts={posts.map(post => {
                        return {
                            ...post,
                            createdAt: new Date(post.createdAt),
                            updatedAt: new Date(post.updatedAt),
                        }
                    })}
                />
                <CTA />
            </main>

            <Footer />
        </>
    )
}
