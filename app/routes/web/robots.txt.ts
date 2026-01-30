/**
 * @see https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt?hl=zh-tw
 */
import type { Route } from './+types/robots.txt'

import { getServiceRobotsConfigs } from '~/lib/service/system-endpoints.server'
import { configsToRobotsTxt, type RobotsConfig } from '~/lib/service/utils'

export const loader = async ({ request }: Route.LoaderArgs) => {
	const url = new URL(request.url)

	const DEFAULT_ROBOTS_CONFIG: RobotsConfig = {
		groups: [
			{
				userAgents: ['*'],
				disallow: ['/dashboard/'],
				crawlDelay: 300,
			},
		],
		sitemaps: [`${url.origin}/sitemap.xml`],
	}

	const robotsConfigs = await getServiceRobotsConfigs(url)
	const plainText = configsToRobotsTxt([
		DEFAULT_ROBOTS_CONFIG,
		...robotsConfigs,
	])

	return new Response(
		`
LOVELOVELOVELOVELOVELOVELOVELOVELOVELOVELOVELOVELOVELOVELOVE
L	     OVELOVELOVELOVELOVELOVELOV	        LOVELOVELOVE
LOV        ELOVELOVELOVELOVELOVELOV		    LOVELOVE
LOVE      VELOVELOVELOVELOVELOVEL		      VELOVE
LOVE      VELOVELOVELOVELOVELOVE            LOVEL      ELOVE
LOVE      VELOVELOVELOVELOVELOV           VELOVELO      LOVE
LOVE      VELOVELOVELOVELOVELOV	         OVELOVELOV     LOVE
LOVE      VELOVELOVELOVELOVELOV	        LOVELOVELOV     LOVE
LOVE      VELOVELOVELOVELOVELOV	       ELOVELOVELO      LOVE
LOVE      VELOVELOVELOVELOVELOV	      VELOVELOVEL       LOVE
LOVE      VELOVELOVELOVELOVELOV	     OVELOVELOVE        LOVE
LOVE      VELOVELOVELOVELOVEL V	    LOVELOVELOV         LOVE
LOVE      VELOVELOVELOVELOVEL V	    LOVELOVELO	        LOVE
LOVE      VELOVELOVELOVELOVE  V	     OVELOVEL	        LOVE
LOVE      VELOVELOVELOVELOV   V	      VELOV	        LOVE
LOVE      VELOVELOVELOVEL     VE		       ELOVE
L			      VELOV		    LOVELOVE
L			      VELOVELOV	        LOVELOVELOVE
L	      VELOV                                        E
L	      VELOV                                        E
LOVE      VELOVELOVELOV   VELOVELOVE      VELOVELOVELO	   E
LOVEL	   ELOVELOVELO   OVELOVELOVE      VELOVELOVELOVE   E
LOVEL	   ELOVELOVELO   OVELOVELOVE      VELOVELOVELOVEL  E
LOVELO	    LOVELOVEL   LOVELOVELOVE      VELOVELOVELOVELO E
LOVELO	    LOVELOVEL   LOVELOVELOVE      VELOVEL VELOVELOVE
LOVELOV	     OVELOVE   ELOVELOVELOVE      VELOVE  VELOVELOVE
LOVELOV	     OVELOVE   ELOVELOVELOVE	          VELOVELOVE
LOVELOVE      VELOV   VELOVELOVELOVE      VELOVE  VELOVELOVE
LOVELOVE      VELOV   VELOVELOVELOVE      VELOVEL VELOVELOVE
LOVELOVEL      ELO   OVELOVELOVELOVE      VELOVELOVELOVELO E
LOVELOVEL      ELO   OVELOVELOVELOVE      VELOVELOVELOVEL  E
LOVELOVELO      L   LOVELOVELOVELOVE      VELOVELOVELOVE   E
LOVELOVELO 	    LOVELOVELOVELOVE      VELOVELOVELO     E
LOVELOVELOV	   ELOVELOVELOVE                           E
LOVELOVELOV	   ELOVELOVELOVE	                   E
LOVELOVELOVELOVELOVELOVELOVELOVELOVELOVELOVELOVELOVELOVELOVE

${plainText}`.trim(),
		{
			status: 200,
			headers: {
				'Content-Type': 'text/plain',
				'X-Content-Type-Options': 'nosniff',
				'Cache-Control': 'public, max-age=3600',
			},
		},
	)
}
