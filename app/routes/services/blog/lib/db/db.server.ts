import { createDB } from '~/lib/db/db.server'

import * as schema from './schema'

export const dbBlog = createDB(schema)
