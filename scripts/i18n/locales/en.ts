export const en = {
	'language-name': 'English - en',

	// init.ts
	'init-starting': '🔥 Initializing Papa app...',
	'database-url-not-set':
		'\n❌ PostgreSQL DATABASE_URL is not set. Please set this to enable Papa. Path: `./.env`',
	'database-url-how-to-set':
		'How to set: Add DATABASE_URL=your-url to the `.env` file in the root directory of the project.',
	'database-url-set': '✅ DATABASE_URL is set\n',
	'object-storage-not-complete':
		'\n❌ Cloudflare R2 object storage setup is not complete. Please set OBJECT_STORAGE_ACCOUNT_ID, OBJECT_STORAGE_ACCESS_KEY_ID, and OBJECT_STORAGE_SECRET_ACCESS_KEY environment variables to enable object storage functionality',
	'object-storage-how-to-set':
		'How to set: Add these variables to the `.env` file in the root directory of the project. You can create API tokens in Cloudflare dashboard > R2 Object Storage > API > Manage API Tokens',
	/** @param default */
	'bucket-name-not-set':
		'❗️ BUCKET_NAME is not set, using default value "{{default}}"',
	/** @param name */
	'bucket-name-set': '✅ BUCKET_NAME is set to "{{name}}"\n',
	'object-storage-set-correctly':
		'✅ Cloudflare R2 object storage is set correctly\n',
	'email-setup-not-complete':
		'\n❌ Email setup is not complete, you must provide EMAIL_FROM and corresponding email service configuration environment variables to enable email functionality',
	'email-supported-services':
		'\nSupported email services: Resend, Nodemailer, AWS SES.',
	'email-set-correctly': '✅ Email sending system is set correctly\n',

	// init-admin.ts
	'admin-email-prompt': '\n❓ Please enter Admin Email (Press ^+C to exit): ',
	'admin-name-prompt': '\n❓ Please enter your name (Press ^+C to exit): ',
	'invalid-email': '❌ Invalid email, try again.',
	'admin-does-not-exist': '\n🔄 Admin does not exist. Creating...',
	/** @param email */
	'admin-created': `✅ Admin created! Sign in with {{email}}`,
	'admin-already-exists': '✅ Admin already exists.',
	'error-checking-creating-admin': '❌ Error checking/creating admin:',
	'inserting-default-data': '🔄 Inserting default data...',
	'default-data-created': '✅ Default data created',
	/** @param title */
	'default-post-seo-created': '\n✅ Default post SEO created: {{title}}',
	/** @param title */
	'default-post-created': '\n✅ Default post created: {{title}}',
	'default-tags-created': '\n✅ Default tags created:',
	'default-categories-created': '\n✅ Default categories created:',
	'default-post-relations-created':
		'\n✅ Default post to tags and categories created',

	// init-object-storage.ts
	'init-storage-starting': '\n–––––\n\n🔥 Initializing R2 object storage...',
	/** @param varName */
	'missing-required-env':
		'❌ Missing required environment variable: {{varName}}',
	'set-all-required-env':
		'Please set all required environment variables and try again',
	'all-required-env-set': '✅ All required environment variables are set\n',
	'initializing-s3-client': '🔄 Initializing S3 client...',
	/** @param count */
	's3-client-connected':
		'✅ S3 client connected successfully, found {{count}} buckets',
	's3-client-connection-failed': '❌ S3 client connection failed:',
	/** @param name */
	'creating-bucket': '🔄 Creating bucket: {{name}}...',
	/** @param name */
	'bucket-created-successfully': '✅ Bucket created successfully: {{name}}\n',
	/** @param name */
	'bucket-already-owned':
		'✅ Bucket {{name}} already exists and is owned by you\n',
	'error-creating-bucket': '❌ Error creating bucket:',
	/** @param name */
	'setting-cors': '🔄 Setting CORS configuration for bucket: {{name}}...',
	/** @param origins */
	'cors-set-successfully':
		'✅ CORS configuration set successfully, allowed origins: {{origins}}\n',
	'error-setting-cors': '❌ Error setting CORS configuration:',
	/** @param name */
	'bucket-already-exists-skip':
		'✅ Bucket {{name}} already exists, skipping creation step\n',
	/** @param name */
	'bucket-configured': '✅ Bucket {{name}} has been configured successfully\n',
	'error-setting-up-bucket': '❌ Error setting up bucket:',
	/** @param buckets */
	'existing-buckets': 'Existing buckets:\n{{buckets}}\n',
	'storage-init-completed': '✅ R2 object storage initialization completed\n',
	'error-during-initialization': '❌ Error during initialization:',

	// init-fin.ts
	'initialization-complete': '\n* * * \nInitialized ✨\n* * *',

	// add-route.ts
	/** @param default */
	'route-name-prompt': 'Route name (default: {{default}}): ',
	/** @param name @param fileCount */
	'service-created-success':
		'🎉 Service named {{name}} files created successfully!\n\n📁 Created {{fileCount}} files:',
	/** @param index @param path */
	'service-file-item': '{{index}}️ {{path}}',
	/** @param route */
	'navigate-to-service':
		"\n🌐 Navigate to '{{route}}' to see the new service in action",
	'error-creating-service-files': 'Error creating service files:',

	// add-service.ts
	/** @param fileCount */
	'example-service-created-success':
		'🎉 Example service files created successfully!\n\n📁 Created {{fileCount}} files:',
	'navigate-to-example-shop':
		"\n🏄 Navigate to '/example-shop' to see the shop in action",
	'navigate-to-example-dashboard':
		"🎛️ Navigate to '/dashboard/example-service' to see the dashboard",
	'error-creating-example-service-files':
		'Error creating example service files:',

	// add-website.ts
	/** @param fileCount */
	'website-service-created-success':
		'🎉 Website service files created successfully!\n\n📁 Created {{fileCount}} files:',
	'navigate-to-website':
		"\n🌐 Navigate to '/' to see the website service in action",
	'navigate-to-about': "📖 Navigate to '/about' to see the about page",
	'error-creating-website-service-files':
		'Error creating website service files:',
}

export type Translations = typeof en
