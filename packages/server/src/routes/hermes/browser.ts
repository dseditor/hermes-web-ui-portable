import Router from '@koa/router'
import * as ctrl from '../../controllers/hermes/browser'

export const browserRoutes = new Router()

// Trigger the local CDP launcher (probe-first, persistent login profile).
browserRoutes.post('/api/hermes/browser/launch', ctrl.launchBrowser)
