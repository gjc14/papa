import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

const examplePage = `
/**
 * Navigate to '/plugin-example' to see this route in action
 */
import { data, type LoaderFunctionArgs, type MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'

import { getSEO } from '~/lib/db/seo.server'
import { createMeta } from '~/lib/utils/seo'

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
    if (!data || !data.meta) {
        return []
    }

    return data.meta.metaTags
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { seo } = await getSEO(new URL(request.url).pathname)
    const meta = seo ? createMeta(seo, new URL(request.url)) : null

    try {
        // You could directly return object
        return { meta }
    } catch (error) {
        console.error(error)
        // Only when you want to return response will you need to use \`data\` function
        // Read more: https://reactrouter.com/how-to/headers#1-wrap-your-return-value-in-data
        return data(
            { meta },
            {
                headers: {
                    'Cache-Control': 'no-store',
                },
            }
        )
    }
}

export default function ExamplePluginWebPage() {
    const { meta } = useLoaderData<typeof loader>()

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center space-y-2">
            <h1 className="visually-hidden">{meta?.seo.metaTitle}</h1>
            <h2>Example plugin web page</h2>
            <p className="text-3xl">🔨🔨🔨</p>
        </div>
    )
}
`

const exampleRouteConfig = `
/**
 * This is an example of a plugin route config, you could define your routes with \`prefix\`, \`layout\`, \`index\`, and \`route\`.
 * @see https://reactrouter.com/start/framework/routing
 */
import {
	index,
	layout,
	prefix,
	type RouteConfig,
} from '@react-router/dev/routes'

const systemRoutes = [
	...prefix('/example', [
		layout('./plugins/example/layout.tsx', [index('./plugins/example/index/route.tsx')]),
	]),
] satisfies RouteConfig

export const example = () => {
	return systemRoutes
}
`

const filePathExampleIndex = join(
	process.cwd(),
	'app/plugins/example/index/route.tsx',
)

const filePathExampleLayout = join(
	process.cwd(),
	'app/plugins/example/layout.tsx',
)

const filePathExampleWebRouteConfig = join(
	process.cwd(),
	'app/plugins/example/routes.ts',
)

try {
	await mkdir(join(process.cwd(), 'app/plugins/example'), { recursive: true })
	await mkdir(join(process.cwd(), 'app/plugins/example/index'), {
		recursive: true,
	})
	await mkdir(join(process.cwd(), 'app/plugins/example/components'), {
		recursive: true,
	})
	await mkdir(join(process.cwd(), 'app/plugins/example/libs'), {
		recursive: true,
	})

	await writeFile(filePathExampleIndex, examplePage.trim())
	await writeFile(
		filePathExampleLayout,
		`// This is an example of a plugin layout`,
	)
	await writeFile(filePathExampleWebRouteConfig, exampleRouteConfig.trim())
	console.log(
		`
        * * *

        In \`/app/routes.ts\` please import and add \`...example()\` to \`export default array\`.
        
        * * *
        
        Then navigate to '/example' to see this route in action!
        `.replace(/^ {8}/gm, ''),
	)
} catch (err) {
	console.error('Error creating example web files:', err)
}
