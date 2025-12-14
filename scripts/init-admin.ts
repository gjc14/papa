import 'dotenv/config'

import * as readline from 'node:readline'

import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

import { auth } from '~/lib/auth/auth.server'
import { isValidEmail } from '~/lib/utils'

import * as schema from '../app/lib/db/schema'

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

const askEmail = (): Promise<string> => {
	return new Promise(resolve => {
		rl.question(
			'\n❓ 請輸入管理員電子郵件地址 (Please enter Admin Email) (按下 ^+C 以關閉) (Press ^+C to exit): ',
			email => {
				if (!isValidEmail(email)) {
					console.error(
						'❌ 無效的電子郵件格式，請重新輸入。(Invalid email, try again.)',
					)
					return resolve(askEmail())
				}
				resolve(email)
			},
		)
	})
}

const askName = (): Promise<string> => {
	return new Promise(resolve => {
		rl.question(
			'\n❓ 設定您的名字 (Please enter your name) (按下 ^+C 以關閉) (Press ^+C to exit): ',
			name => resolve(name),
		)
	})
}

async function checkAndCreateAdmin() {
	const db = drizzle(process.env.DATABASE_URL!, { schema })

	try {
		// Check if admin exists
		const admin = await db.query.user.findMany({
			where: (t, { eq }) => eq(t.role, 'admin'),
			orderBy: (t, { asc }) => asc(t.createdAt),
		})

		if (admin.length === 0) {
			const email = await askEmail()
			const name = await askName()

			// Create admin
			console.log(
				'\n🔄 管理員不存在，正在建立... (Admin does not exist. Creating...)',
			)
			const { user } = await auth.api.createUser({
				body: {
					email: email,
					password: '',
					name: name,
					role: 'admin',
				},
			})
			await db
				.update(schema.user)
				.set({
					emailVerified: true,
				})
				.where(eq(schema.user.id, user.id))

			console.log(
				`✅ 管理員已建立！請使用 ${'user.email'} 登入。 (Admin created! Sign in with ${'user.email'})`,
			)

			console.log('🔄 正在建立預設資料 (Inserting default data)...')
			// TODO: Insert default data
			console.log('✅ 預設資料已建立 (Default data created)')
		} else {
			console.log(`⚠️ 管理員已存在。Admin already exists.`)
		}
	} catch (error) {
		console.error(
			'❌ 檢查/建立管理員使用者時發生錯誤 (Error checking/creating admin):',
			error,
		)
		process.exit(1)
	} finally {
		process.exit(0)
	}
}

await checkAndCreateAdmin()
