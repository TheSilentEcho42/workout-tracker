import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// This configures a request mocking server for the browser (Playwright)
export const worker = setupWorker(...handlers)


