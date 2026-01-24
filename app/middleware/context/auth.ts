import { createContext } from 'react-router'

import { type Session } from '~/lib/auth/auth.server'

export const authContext = createContext<Session>()
