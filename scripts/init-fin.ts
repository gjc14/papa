import { initLocale, t } from './i18n'

async function initFin(locale?: string) {
	await initLocale(locale)
	console.warn(t('initialization-complete'))
}

const locale = process.argv[2]
initFin(locale)
