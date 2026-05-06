import "dotenv/config"

import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { getEnv } from "env"

async function main() {
	const databaseUrl = getEnv("DATABASE_URL")
	const databaseName = databaseUrl.split("/").pop()?.split("?")[0]

	if (!databaseName) {
		throw new Error("Invalid DATABASE_URL, cannot extract database name.")
	}

	// Connect to postgres database to execute CREATE DATABASE command
	const postgresUrl = databaseUrl.replace(`/${databaseName}`, "/postgres")
	const db = drizzle(postgresUrl)

	const result = await db.execute(
		sql`SELECT 1 FROM pg_database WHERE datname = ${databaseName}`,
	)

	if (result.rowCount === 0) {
		console.log(`Database \`${databaseName}\` does not exist. Creating...`)
		await db.execute(sql`CREATE DATABASE ${sql.identifier(databaseName)}`)
		console.log(`✅ Database \`${databaseName}\` created successfully.`)
	} else {
		console.log(
			`✅ Database \`${databaseName}\` already exists. Skipping creation.`,
		)
	}
}

main()
	.catch((error: unknown) => {
		if (error instanceof Error) {
			console.error(`❌ ${error.name}: ${error.message}`)
		} else {
			console.error(
				`❌ Unknown error occurred while initializing database: ${error}`,
			)
		}
		process.exit(1)
	})
	.finally(() => process.exit(0))
