import type { Translations } from './en'

export const zhTW: Translations = {
	'language-name': '繁體中文 - zhTW',

	// init.ts
	'init-starting': '🔥 初始化 Papa 應用程式...',
	'database-url-not-set':
		'\n❌ PostgreSQL DATABASE_URL 未設定。請設定以啟用 Papa。路徑: `./.env`',
	'database-url-how-to-set':
		'設定方法: 在專案根目錄的 `.env` 檔案中加入 DATABASE_URL=您的URL',
	'database-url-set': '✅ DATABASE_URL 已設定\n',
	'object-storage-not-complete':
		'\n❌ Cloudflare R2 物件存儲設定尚未完成。請設定 OBJECT_STORAGE_ACCOUNT_ID、OBJECT_STORAGE_ACCESS_KEY_ID 以及 OBJECT_STORAGE_SECRET_ACCESS_KEY 環境變數以啟用物件存儲功能',
	'object-storage-how-to-set':
		'設定方法: 在專案根目錄的 `.env` 檔案中加入這些變數。您可以在 Cloudflare Dashboard > R2 Object Storage > {} API > Manage API Tokens 中創建 API Token',
	'bucket-name-not-set': '❗️ BUCKET_NAME 未設定，將使用預設值 "{{default}}"',
	'bucket-name-set': '✅ BUCKET_NAME 已設定為 "{{name}}"\n',
	'object-storage-set-correctly': '✅ Cloudflare R2 物件存儲設定正確\n',
	'email-setup-not-complete':
		'\n❌ Email 設定尚未完成，您必須提供 EMAIL_FROM 以及相應的 Email 服務配置環境變數以啟用 Email 功能',
	'email-supported-services':
		'\n支援的 Email 服務：Resend、Nodemailer、AWS SES。',
	'email-set-correctly': '✅ Email 寄送系統設定正確\n',

	// init-admin.ts
	'admin-email-prompt': '\n❓ 請輸入管理員電子郵件地址 (按下 ^+C 以關閉): ',
	'admin-name-prompt': '\n❓ 設定您的名字 (按下 ^+C 以關閉): ',
	'invalid-email': '❌ 無效的電子郵件格式，請重新輸入。',
	'admin-does-not-exist': '\n🔄 管理員不存在，正在建立...',
	'admin-created': '✅ 管理員已建立！請使用 {{email}} 登入。',
	'admin-already-exists': '✅ 管理員已存在。',
	'error-checking-creating-admin': '❌ 檢查/建立管理員使用者時發生錯誤:',
	'inserting-default-data': '🔄 正在建立預設資料...',
	'default-data-created': '✅ 預設資料已建立',
	'default-post-seo-created': '\n✅ 預設文章 SEO 已建立: {{title}}',
	'default-post-created': '\n✅ 預設文章已建立: {{title}}',
	'default-tags-created': '\n✅ 預設標籤已建立:',
	'default-categories-created': '\n✅ 預設分類已建立:',
	'default-post-relations-created': '\n✅ 預設文章與標籤、分類關聯已建立',

	// init-object-storage.ts
	'init-storage-starting': '\n–––––\n\n🔥 初始化 R2 物件存儲...',
	'missing-required-env': '❌ 缺少必要環境變數: {{varName}}',
	'set-all-required-env': '請設定所有必要的環境變數再重試',
	'all-required-env-set': '✅ 所有必要環境變數已設定\nj',
	'initializing-s3-client': '🔄 正在初始化 S3 客戶端...',
	's3-client-connected': '✅ S3 客戶端連接成功，找到 {{count}} 個儲存貯體',
	's3-client-connection-failed': '❌ S3 客戶端連接失敗:',
	'creating-bucket': '🔄 正在創建儲存貯體: {{name}}...',
	'bucket-created-successfully': '✅ 儲存貯體創建成功: {{name}}\n',
	'bucket-already-owned': '✅ 儲存貯體 {{name}} 已存在且歸您所有\n',
	'error-creating-bucket': '❌ 創建儲存貯體失敗:',
	'setting-cors': '🔄 正在為儲存貯體設置 CORS 設定: {{name}}...',
	'cors-set-successfully': '✅ CORS 設置成功，允許的來源: {{origins}}\n',
	'error-setting-cors': '❌ 設置 CORS 設定失敗:',
	'bucket-already-exists-skip': '✅ 儲存貯體 {{name}} 已存在，跳過創建步驟\n',
	'bucket-configured': '✅ 儲存貯體 {{name}} 已設定完成\n',
	'error-setting-up-bucket': '❌ 設置儲存貯體失敗:',
	'existing-buckets': '現有儲存貯體:\n{{buckets}}\n',
	'storage-init-completed': '✅ R2 物件存儲初始化完成\n',
	'error-during-initialization': '❌ 初始化過程中發生錯誤:',

	// init-fin.ts
	'initialization-complete': '\n* * * \n初始化完成 ✨\n* * *',

	// add-route.ts
	'route-name-prompt': 'Route 名稱（預設：{{default}}）：',
	'service-created-success':
		'🎉 名為 {{name}} 的 Service 檔案已成功建立！\n\n📁 已建立 {{fileCount}} 個檔案:',
	'service-file-item': '{{index}}️ {{path}}',
	'navigate-to-service': "\n🌐 前往 '{{route}}' 查看新的 service",
	'error-creating-service-files': '建立 service 檔案時發生錯誤:',

	// add-service.ts
	'example-service-created-success':
		'🎉 範例 Service 檔案已成功建立！\n\n📁 已建立 {{fileCount}} 個檔案:',
	'navigate-to-example-shop': "\n🏄 前往 '/example-shop' 查看商店",
	'navigate-to-example-dashboard':
		"🎛️ 前往 '/dashboard/example-service' 查看儀表板",
	'error-creating-example-service-files': '建立範例 service 檔案時發生錯誤:',

	// add-website.ts
	'website-service-created-success':
		'🎉 網站 Service 檔案已成功建立！\n\n📁 已建立 {{fileCount}} 個檔案:',
	'navigate-to-website': "\n🌐 前往 '/' 查看網站 service",
	'navigate-to-about': "📖 前往 '/about' 查看關於頁面",
	'error-creating-website-service-files': '建立網站 service 檔案時發生錯誤:',
}
