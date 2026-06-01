import Router from '@koa/router'
import * as ctrl from '../controllers/pairing'

// Public: a device claims a one-time pairing code for a session token.
export const pairingPublicRoutes = new Router()
pairingPublicRoutes.post('/api/pairing/claim', ctrl.claim)

// Protected: owner-only controls for external access + pairing codes.
export const pairingProtectedRoutes = new Router()
pairingProtectedRoutes.get('/api/pairing/status', ctrl.status)
pairingProtectedRoutes.post('/api/pairing/start', ctrl.start)
pairingProtectedRoutes.post('/api/pairing/stop', ctrl.stop)
