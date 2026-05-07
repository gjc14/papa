import "dotenv/config"

import { defineConfig } from "drizzle-kit"
import { getEnv } from "env"

export default defineConfig({
	dialect: "postgresql",
	schema: [
		"./app/lib/db/schema/**/*",
		"./app/routes/**/lib/db/schema/**/*",
		"./app/routes/services/**/lib/db/schema/**/*",
	],
	schemaFilter: ["public", "papa"],
	dbCredentials: {
		url: getEnv("DATABASE_URL"),
	},
	out: "./database",
})
