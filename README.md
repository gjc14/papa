# Papa

<!-- prettier-ignore -->
> [!NOTE]
> Welcome to Papa, this is an open-source project for building modern web with React and TypeScript.

## Tech Stack

- **Framework**: [React Router v7](https://reactrouter.com/home/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Storage**: [AWS S3](https://aws.amazon.com/s3/) /
  [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/)
- **Style**: [tailwindcss](https://tailwindcss.com/)
- **UI LIbrary**: [shadcn/ui](https://ui.shadcn.com/)
- **Email SDK**:
  [Any SMTP](https://www.cloudflare.com/learning/email-security/what-is-smtp/) /
  [AWS SES](https://aws.amazon.com/ses/) / [Resend](https://resend.com/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Text Editor**: [Tiptap](https://tiptap.dev/)

<!-- prettier-ignore -->
> [!NOTE]
> Optimized for performance, start with **score 100**, tested by [PageSpeed](https://pagespeed.web.dev/).

---

## Before you start

1. Prepare an useful IDE. (e.g.
   [Visual Studio Code](https://code.visualstudio.com/))
2. Get a
   [PostgreSQL Open Source Relational Database](https://www.postgresql.org/). If
   you don't want to host it locally, we recommend using
   [Supabase](https://supabase.com/) or [Neon](https://neon.tech/). They both
   provide 0.5GB storage 0.5G storage, which is capable of more than 15,000 post
   like [What is Papa (30kB)](https://papacloud.vercel.app/blog/what-is-papa).
3. Have a SMTP server provider. It is common to use third-party email service
   such as:
   1. [AWS SES](https://aws.amazon.com/ses/), which is
      [SUPER economic](https://aws.amazon.com/ses/pricing/);
   2. [Mailjet](https://www.mailjet.com/), provides
      [free 6,000 emails/mo](https://www.mailjet.com/pricing/), made for
      front-end users, with features like drag-and-drop email builders;
   3. [MailGun](https://www.mailgun.com), provides
      [free 100 emails/day](https://www.mailgun.com/pricing/), made for
      developers, with
      [additional HIPAA compliance](https://www.mailjet.com/resources/comparisons/mailgun/)
      and robust APIs;
   4. [Resend](https://resend.com/), provides
      [free 3,000 emails/mo](https://resend.com/pricing);
   5. [SendGrid](https://sendgrid.com/en-us/pricing);
   6. [mailchimp](https://mailchimp.com/), provides
      [free 1,000 emails/mo](https://mailchimp.com/pricing/marketing/compare-plans).
4. Setup an object storage either in
   [Cloudflare R2 (10GB free tier)](https://www.cloudflare.com/developer-platform/products/r2/)
   or [AWS S3](https://aws.amazon.com/s3/).
5. (optional) Have either
   [Cloudflare Turnstile](https://www.cloudflare.com/application-services/products/turnstile/),
   [reCAPTCHA v3](https://www.google.com/recaptcha/about/) (coming soon) or
   [hCaptcha](https://www.hcaptcha.com/) (coming soon) to secure your form.

### Set up [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/)

1. Navigate to `Cloudflare dashboard > R2 Object Storage`.
2. `{} API > Manage API Tokens`: Click **Create API Token** button, and set
   Permissions to Admin Read & Write and TTL to Forever.
3. Paste it into `.env` as `OBJECT_STORAGE_ACCESS_KEY_ID`,
   `OBJECT_STORAGE_SECRET_ACCESS_KEY`.
4. As for `OBJECT_STORAGE_ACCOUNT_ID`, you will find it by opening
   `{} API > Use R2 with APIs`.
5. In `.env` please configure your desired `BUCKET_NAME`, papa will create a
   bucket with this given name, default to `papa`.

### Set up [AWS S3](https://aws.amazon.com/s3/)

Coming soon

---

## Usage

### 1. Clone the repository

```sh
# Clone the repo
git clone https://github.com/gjc14/papa.git

# Navigate to project and copy .env.example
cd ./papa && cp .env.example .env
```

### 2. Configure the required environment variables

<!-- prettier-ignore -->
> [!WARNING]
> VITE will expose any environment variable with _VITE_\_ prefix, please use it carefully.

1.  `DATABASE_URL`: We connect to PostgreSQL using node-postgres (pg), so both
    direct and pooled connections are supported.

    - Direct connections provide a one-to-one connection from your app to the
      database. They are ideal for long-lived environments like VMs or
      containers.
    - Pooled connections (e.g., via PgBouncer in transaction or session pooling
      mode) allow sharing a limited number of database connections across many
      stateless requests. This is especially important when running on
      serverless platforms, where each request may create a new database
      connection.

    - **When using stateless/serverless architecture, we recommend using pooled
      connections to avoid hitting connection limits and to ensure
      scalability.**

2.  (optional) Set `VITE_TURNSTILE_SITE_KEY`: This key is used to
    [get Turnstile token](https://developers.cloudflare.com/turnstile/get-started/)
    in client, if you use
    [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) as
    captcha, so should be exposed in the frontend with _VITE_\_ prefix.
3.  (optional) `TURNSTILE_SECRET_KEY`: Used to
    [verify Turnstile token](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
    get in the frontend in the backend
4.  `AUTH_SECRET`: Use
    `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`
    to generate a random secret with node.
5.  `VITE_BASE_URL`: This is the domain where you're hosting this app in
    production environment, e.g. `https://papa.delicioso`.
6.  `APP_NAME`: What you call your app.
7.  `EMAIL_PROVIDER`: Options: `smtp`, `ses`, `resend`, `nodemailer` (same as
    `smtp`). Default `resend`
8.  `EMAIL_FROM`: This email must be verified, with format:
    `Your Name <verified@email.com>`
9.  Email provider credentials:

    1.  **SMTP**

        - `SMTP_HOST`: smtp.provider.com
        - `SMTP_PORT`: Email servers are using `587` as default TLS. Default
          `587`
        - `SMTP_SECURE`: Set to `true` if using port 465 (SSL), `false` for 587
          port (encrypted/TLS). Default `false`
        - `SMTP_USER`: user name
        - `SMTP_PASS`: password correspond to user name

    2.  **AWS SES (Simple Email Service)**

        It is easier to just generate **SMTP Credentials** than generating SDK
        access keys. If you still want to generate credentials for SDK, please
        checkout
        [Sending email through Amazon SES using an AWS SDK](https://docs.aws.amazon.com/ses/latest/dg/send-an-email-using-sdk-programmatically.html)
        and
        [Types of Amazon SES credentials](https://docs.aws.amazon.com/ses/latest/dg/send-email-concepts-credentials.html)

        - `AWS_SES_REGION`: e.g. `ap-northeast-1`
        - `AWS_SES_ACCESS_KEY_ID`: Get this from `IAM`
        - `AWS_SES_SECRET_ACCESS_KEY`: Get this from `IAM`, you should set
          Permissions policies of the user to:
          ```json
          {
          	"Version": "2012-10-17",
          	"Statement": [
          		{
          			"Effect": "Allow",
          			"Action": ["ses:*"], // Allow all ses services
          			"Resource": "*"
          		}
          	]
          }
          ```

    3.  **Resend**
        - `RESEND_API_KEY`: something like `re_blablabla`

10. `EMAIL_FROM`: The email address sending authentication emails.
11. `BUCKET_NAME`,`OBJECT_STORAGE_ACCESS_KEY_ID`,
    `OBJECT_STORAGE_SECRET_ACCESS_KEY`, `OBJECT_STORAGE_ACCOUNT_ID`: Where you
    save your objects, accept S3 compatible services. Using in route
    `/dashboard/assets/resource`

### 3. Install and push database schema

```sh
pnpm install
# or pnpm i
```

### 4. Initialize the project

This command will start the project by adding an admin user with default posts.

You will be asked for **Email** and your **Name**. Enter them in the teminal.

- If you have already init the project:

```sh
pnpm dev
```

- If you're starting a new project:

```sh
pnpm run init
```

🎉 Now your project should be running on
[http://localhost:5173](http://localhost:5173). Go to
[http://localhost:5173/dashboard](http://localhost:5173/dashboard), sign in to
see the dashboard.

---

### 5. Upload your logo and favicon

<!-- prettier-ignore -->
> [!NOTE]
> All the file in `/public` folder will be directly available with relative
> path. For example, `/public/logo.png` will be accessable at
> `localhost:5173/logo.png`.

To use your own logo, please overwrite `logo.png`, `logo-512.png`,
`logo-300.png`, `logo-100.png`, `logo-32.png` & `favicon.ico`.

You can run `convert:logo` and `convert:favicon` to convert your `logo.png` to
other sizes.

> [FFmpeg](https://www.ffmpeg.org/about.html) is a leading multimedia framework,
> able to encode, decode, and many other command to edit media. To use FFmpeg,
> please first [download](https://www.ffmpeg.org/download.html) and install it.

```sh
pnpm run convert:logo
```

```sh
pnpm run convert:favicon
```

or run the following `ffmpeg` command in the folder.

```sh
for size in 512 300 100 32; do
  ffmpeg -i logo.png -vf scale=${size}:-1 logo-${size}.png
done
```

```sh
ffmpeg -i logo.png -vf "scale=32:32:force_original_aspect_ratio=decrease,pad=32:32:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -y favicon.ico
```

# Documentation

## Service

In Papa, you could easily extend routes by adding files in `services` folder.
Please structured as following:

```
routes
└── services
└── └── my-route1
└── └── └── layout.tsx
└── └── └── index.tsx
└── └── └── about.tsx
└── └── └── config.tsx
└── └── my-route2
└── └── └── layout.tsx
└── └── └── index.tsx
└── └── └── about.tsx
└── └── └── config.tsx
```

<!-- prettier-ignore -->
> [!NOTE]
> tip: You may run `pnpm run add:website` to see an easy example of how files
> structures.

**Config files:**

Run `pnpm run add:service` to generate example routes, including independent
routes and those under dashboard.

The following 8 files will be created:

1. /services/example-service/config.tsx
2. /services/example-service/dashboard/index.tsx
3. /services/example-service/dashboard/layout.tsx
4. /services/example-service/dashboard/product/route.tsx
5. /services/example-service/shop/index.tsx
6. /services/example-service/shop/layout.tsx
7. /services/example-service/shop/data.ts
8. /services/example-service/shop/product/route.tsx

In `/app/routes/services` create a new folder to host your new service. Under
each service, there should be one `config.tsx` file to configure **routes**,
**dashboard**, and **sidebar** details.

For example:

```tsx
// /app/routes/services
import { Apple, Command } from 'lucide-react'

import type { Service } from '../../papa/utils/service-configs'

export const config = {
	dashboard: {
		// The name displayed in the dropdown menu in `/dashboard`
		name: 'Example Service',
		description: 'This is an example service for demonstration purposes.',
		logo: 'https://placecats.com/64/64',
		url: '/dashboard/example-service', // dashboard route to your service
		routes: ({ route, index }) => [
			route(
				'/dashboard/example-service', // should be under `/dashboard` route, only given `example-service` as relative route will also work
				'./routes/services/example-service/dashboard/layout.tsx',
				[index('./routes/services/example-service/dashboard/index.tsx')],
			),
		],
	},
	// Routes independent from any route, but should be careful conflix with `/dashboard`
	routes: ({ route, index }) => [
		route(
			'/example-shop',
			'./routes/services/example-service/shop/layout.tsx',
			[
				index('./routes/services/example-service/shop/index.tsx'),
				route(
					':productId',
					'./routes/services/example-service/shop/product/route.tsx',
				),
			],
		),
	],
	// sitemap: url => []
	// blogUrls: ['/blog']
} satisfies Service
```

### Create Database Schema

To facilitate develop process, we utilize
[Drizzle ORM](https://orm.drizzle.team) to design database schema.

Any files under any folder with `lib/db/schema` will be considered as a schema
definition.

For example:

Files under `/app/routes/services/my-service/lib/db/schema` will be used; Files
under `/app/routes/rebellious-route/lib/db/schema` as well will be read.

**Conventional way to generate schema in your service**

1. Create folder `lib/db/schema` in your service e.g.
   `/app/routes/services/my-service/lib/db/schema`
2. Create file `my-schema-name.ts` under the former folder created.
3. Write schema.

   Any schema declared with `pgTable` imported from `drizzle-orm/pg-core` will
   default belongs to **public** schema. To use **papa** schema instead of
   **public**, import `pgTable` from `~/lib/db/schema/helpers`, or define your
   own schema by:

   ```tsx
   const mySchema = pgSchema('my-schema-name')
   const myPgTable = mySchema.table
   const myPgEnum = mySchema.enum
   const myView = mySchema.view
   ```

   For more information about schema definition, refer to
   [table and columns declaration](https://orm.drizzle.team/docs/sql-schema-declaration#tables-and-columns-declaration).

   An example for table declaration:

   ```tsx
   import { check, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core'
   import { sql } from 'drizzle-orm/sql/sql'

   import { user } from '~/lib/db/schema/auth'
   import { timestampAttributes } from '~/lib/db/schema/helpers'

   export const post = pgTable(
   	'post',
   	{
   		id: serial('id').primaryKey(),
   		slug: varchar('slug').notNull().unique(),
   		title: varchar('title').notNull(),
   		content: text('content'),
   		excerpt: varchar('excerpt'),
   		featuredImage: varchar('featured_image'),
   		status: varchar('status', { length: 50 }).notNull(),

   		authorId: text('author_id').references(() => user.id, {
   			onDelete: 'set null',
   		}),

   		...timestampAttributes,
   	},
   	t => [check('prevent_system_slug', sql`${t.slug} != 'new'`)],
   )
   ```

4. Push the schema to your PostgreSQL by `pnpm run db:push`, then follow the
   instructions.

## Action

### Return

Refer to: [Definitions in lib/utils](./app/lib/utils/index.tsx)

```ts
// These will trigger toast automatically when fetcher.state === "loading"
// Success
return { msg: 'Action success 🎉' } satisfies ActionResponse
// Error
return { err: 'Something went wrong 🚨' } satisfies ActionResponse

// To prevent notification, send `preventNotification` to true
return { msg: "I don't want you to be seen", preventNotification: true }
```

### Typed Fetcher Data

```ts
import { type ActionResponse } from '~/lib/utils'
import { handleError } from '~/lib/utils/server'

type UserData = {
	id: number
	name: string
}

export const action = async ({ request }: Route.ActionArgs) => {
	try {
		const user = validateUser()
		return {
			msg: `Welcome to PAPA!`,
			data: { id, name },
		} satisfies ActionResponse
	} catch (error) {
		return handleError(error, request)
	}
}

export default function Component() {
	// This fetcher will be typed
	const fetcher = useFetcher<typeof action>()

	useEffect(() => {
		if (fetcher.data && 'data' in fetcher.data) {
			const {
				data: { id, name },
			} = fetcher.data
		}
	}, [fetcher.data])
}
```

## Auth

### Hierarchy

```
Organization
├── (Team)
└── └── Member
```

### Sign Up

- For new admin user, they should always be invited/added by current admin.

### Sign In

- For safety concern, now only OTP method is available.

## Dashboard

### Data Table

- Reference:
  [Tanstack Table Columns Definitions Guide](https://tanstack.com/table/latest/docs/guide/column-defs)

```tsx
import { type ColumnDef } from '@tanstack/react-table'

import { DataTable } from '~/routes/papa/dashboard/components/data-table'

type TagType = {
    name: string
    id: string
    postIds: string[]
}

const tags: TagType[] = [
    {
        name: 'Travel',
        id: 'unique-id-1',
        postIds: ['post-1', 'post-2', 'post-3'],
    },
    {
        name: 'Education',
        id: 'unique-id-2',
        postIds: ['post-4', 'post-5', 'post-6'],
    },
]

const tagColumns: ColumnDef<TagType>[] = [
    {
        // accessorKey is the key of the data your pass into <DataTable>
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'postIds',
        header: 'Posts',
        cell: ({ row }) => {
            // `row.original` gives you tags data you pass into <DataTable>
            return row.original.postIds.length
        },
    },
    {
        // If header is a function, please pass in id key.
        // Some of the functions refer to "id" to display as column header,
        // when header is not a string
        id: 'Action',
        accessorKey: 'id',
        header: () => <div className="w-full text-right">Action</div>,
        cell: ({ row }) => (
            <div className="w-full flex">
                <DeleteTaxonomyButton
                    id={row.original.id}
                    actionRoute={'/dashboard/blog/taxonomy/resource'}
                    intent={'tag'}
                />
            </div>
        ),
    },
]

// Usage
<DataTable columns={tagColumns} data={tags} />
```

### Data Table with customized conditional row style

```tsx
export function MyComponent() {
	const [rowSelection, setRowSelection] = useState({})
	const [rowsDeleting, setRowsDeleting] = useState<Set<string>>(new Set())

	const tableData = users.map(user => ({
		...user,
		setRowsDeleting,
	}))

	return (
		<DataTable
			columns={columns}
			// Pass in rowsDeleting set state into table
			data={tableData}
			// Configure style if row id matches rowsDeleting
			rowGroupStyle={[
				{
					rowIds: rowsDeleting,
					className: 'opacity-50 pointer-events-none',
				},
			]}
			rowSelection={rowSelection}
			setRowSelection={setRowSelection}
			hideColumnFilter
		>
			{/* DataTable passes a table ref for you to use table api, and this will be rendered above table in toolbox */}
			{table => (
				<Input
					placeholder="Filter email..."
					value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
					onChange={event =>
						table.getColumn('email')?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
			)}
		</DataTable>
	)
}
```

### Dashboard Wrapper

```tsx
export default function DashboardExample() {
	return (
		<DashboardSectionWrapper>
			<DashboardHeader>
				<DashboardTitle title="Your dashboard title"></DashboardTitle>
				<DashboardActions>
					{/* You may put some buttons here */}
				</DashboardActions>
			</DashboardHeader>
			{/* Your main content goes here */}
			<DashboardContent>Main content</DashboardContent>
		</DashboardSectionWrapper>
	)
}
```

### Global Navigating UI

Displaying when navigating using `useNavigation` hook. The UI is written in
[layout](./layout/route.tsx).

#### Prevent Navigating UI

To prevent displaying the UI, utilize `useNavigationMetadata` hook. When
navigating over, `navMetadata.showGlobalLoader` will be set to true.

1. Manually set `showGlobalLoader` to false
   (`setNavMetadata({ showGlobalLoader: false })`)
2. Navigate starts
3. Navigate ends
4. `showGlobalLoader` is set to true automatically

```tsx
const Component = () => {
	const { navMetadata, setNavMetadata } = useNavigationMetadata()
	const navigate = useNavigate()
	const [, setSearchParams] = useSearchParams()

	const isNavigating = navMetadata.showGlobalLoader === false

	const goToSomewhere = () => {
		// Set showGlobalLoader to false first
		setNavMetadata({ showGlobalLoader: false })

		// a. navigate to destination
		navigate('/path/to/destination', { replace: true })

		// or
		// b. Update search params
		setSearchParams(params, { replace: true })
	}

	return <button onClick={goToSomewhere}>Go to Somewhere</button>
}
```
