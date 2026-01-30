import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

import { askInput } from './utils'

try {
	const demoRoute = await askInput('Create demo route', 'demo')

	// Create directories
	await mkdir(join(process.cwd(), `app/routes/services/${demoRoute}`), {
		recursive: true,
	})

	const configFilePath = join(
		process.cwd(),
		`app/routes/services/${demoRoute}/service.system-endpoints.ts`,
	)

	const serviceConfigFile = `
import { registerSystemEndpoints } from '~/lib/service/system-endpoints-registry'

registerSystemEndpoints({
    robots: url => ({
        groups: [
            {
                userAgents: ['*'],
                allow: ['/'],
                disallow: ['/dashboard/', '/api/', '/auth/'],
                crawlDelay: 30,
            },
        ],
        sitemaps: [\`\${url.origin}/sitemap.xml\`],
    }),
    sitemap: url => [
        {
            loc: '/demo/sitemap/route',
        },
        {
            loc: url.origin + '/demo/url/origin',
        },
    ],
})

`

	// Write all service files
	await writeFile(configFilePath, serviceConfigFile.trim())

	console.log(
		`🎉 Demo [${demoRoute}] created successfully!

		+ 1 files created: ${configFilePath.split('app/routes')[1]}

        -> Navigate to '/robots.txt' & '/sitemap.xml' to see in action
        `.replace(/^[ \t]+/gm, ''),
	)
} catch (err) {
	console.error('Error creating service files:', err)
}
