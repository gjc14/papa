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
			'\n❓ Please enter Admin Email (Press Ctrl+C to exit: ',
			email => {
				if (!isValidEmail(email)) {
					console.error('❌ Invalid email, try again.')
					return resolve(askEmail())
				}
				resolve(email)
			},
		)
	})
}

const askName = (): Promise<string> => {
	return new Promise(resolve => {
		rl.question('\n❓ Please enter your name (Press Ctrl+C to exit): ', name =>
			resolve(name),
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
			console.log('\n🔄 Admin does not exist. Creating...')
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

			console.log(`✅ Admin created! Sign in with ${'user.email'}`)

			console.log('🔄 Inserting default data...')
			// TODO: Insert default data
			console.log('✅ Default data created')
		} else {
			console.log(`⚠️ Admin already exists.`)
		}
	} catch (error) {
		console.error('❌ Error checking/creating admin:', error)
		process.exit(1)
	} finally {
		process.exit(0)
	}
}

await checkAndCreateAdmin()
