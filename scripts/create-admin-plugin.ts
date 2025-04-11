import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

console.log('⚠️ This function is still under construction...')
process.exit(1)

const examplePage = `
import type { LoaderFunctionArgs MetaFunction } from 'react-router'
import { Outlet } from 'react-router'

export const meta: MetaFunction<typeof loader> = () => {
    return [
        { title: 'Example plugin page for Admin' },
        { name: 'description', content: 'Example plugin page for Admin' },
    ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    // SEO in admin page is not necessary
    return null
}

export default function ExamplePluginPage() {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center space-y-2">
            <h1>Example Plugin Page</h1>
            <p className="text-center">⬇️⬇️⬇️ Nested child routes ⬇️⬇️⬇️</p>

            <Outlet />
        </div>
    )
}
`

const examplePageSub = `
import { LoaderFunctionArgs, type MetaFunction } from 'react-router'

export const meta: MetaFunction<typeof loader> = () => {
    return [
        { title: 'Sub page of example plugin page' },
        { name: 'description', content: 'Sub page of example plugin page' },
    ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    // SEO in admin page is not necessary
    return null
}

export default function ExamplePluginSubPage() {
    return (
        <div className="p-5 m-3 bg-secondary border border-white grid items-center justify-center">
            <h2>Nested sub page of Example Plugin Page</h2>
            <p className="text-center text-xl">✨🕸️😗🪹🌏</p>
        </div>
    )
}
`

const exampleAdminPapaConfig = `
import type { PapaConfig } from '../utils/get-plugin-configs.server'

const config = (): PapaConfig => {
    return {
        pluginName: 'Example Plugin',
        adminRoutes: [
            {
                title: 'Example Plugin',
                url: '/example',
                iconName: 'rocket',
                sub: [
                    {
                        title: 'Sub Page',
                        url: '/sub',
                    },
                ],
            },
        ],
    }
}

export default config
`

const filePathExample = join(
	process.cwd(),
	'app/routes/plugins/example.plugin/_papa.admin.example/route.tsx',
)

const filePathExampleSub = join(
	process.cwd(),
	'app/routes/plugins/example.plugin/_papa.admin.example.sub/route.tsx',
)

const filePathExampleAdminConfig = join(
	process.cwd(),
	'app/routes/plugins/example.plugin/papa.config.ts',
)

try {
	await mkdir(
		join(
			process.cwd(),
			'app/routes/plugins/example.plugin/_papa.admin.example',
		),
		{ recursive: true },
	)
	await mkdir(
		join(
			process.cwd(),
			'app/routes/plugins/example.plugin/_papa.admin.example.sub',
		),
		{ recursive: true },
	)

	await writeFile(filePathExample, examplePage.trim())
	await writeFile(filePathExampleSub, examplePageSub.trim())
	await writeFile(filePathExampleAdminConfig, exampleAdminPapaConfig.trim())
	console.log(
		`Example admin pages and config created successfully in routes folder ${
			filePathExample.split('app/routes')[1]
		}, ${filePathExampleSub.split('app/routes')[1]} and ${
			filePathExampleAdminConfig.split('app/routes')[1]
		}
        
        Navigate to '/admin/example' and '/admin/example/sub' to see in action
        `.replace(/^ {8}/gm, ''),
	)
} catch (err) {
	console.error('Error creating example admin files:', err)
}
