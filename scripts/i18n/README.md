# Scripts i18n System

## Usage

### Basic Setup

**IMPORTANT:** You must call `initLocale()` at the start of your script before
using `t()`.

```typescript
import { initLocale, t } from './i18n'

async function main() {
	// Initialize locale at the very start
	await initLocale()

	// Now you can use t() synchronously throughout your script
	console.log(t('init-starting'))
	// Output: 🚀 Initializing app... (or 🚀 初始化 應用程式... in zh-TW)
	console.log(t('database-url-set'))
}

main()
```

### With Variable Interpolation

See [en.ts](./locales/en.ts) file for available variables

```typescript
console.log(t('bucket-name-set', { name: 'my-bucket' }))
// Output: ✅ BUCKET_NAME is set to "my-bucket"
```

## Language Selection

### Interactive Selection

When `initLocale()` is called, prompt user with an interactive menu if locale
not selected:

- Use ↑/↓ arrow keys to navigate
- Press Enter to select
- Default is English (first option)

## Adding a New Language

### Step 1: Create Translation File

Create a new file in `locales/` (e.g., `ja.ts` for Japanese):

```typescript
import type { Translations } from './en'

export const ja: Translations = {
	// init.ts
	'init-starting': '🚀 Papaアプリを初期化しています...',
	'database-url-not-set': '\n⚠️ PostgreSQL DATABASE_URLが設定されていません...',
	// ... copy all keys from en.ts and translate
}
```

### Step 2: Export in `locales/index.ts`

```typescript
export { en } from './en'
export { zhTW } from './zh-TW'
export { ja } from './ja' // <- Add this line
```

### Step 3: Register in `i18n/index.ts`

```typescript
import { en, ja, zhTW } from './locales'

const translations = {
	en,
	'zh-TW': zhTW,
	ja: ja, // <- Add this line
}
```

## Translation File Structure

All translations use a flat structure with comments to organize by file:

```typescript
export const en = {
	// configurations
	'language-name': 'English',

	// translations
	'init-starting': '...',
}
```

## Current Languages

- `en` - English (default, fallback)
- `zh-TW` - Traditional Chinese (繁(正)體中文)
