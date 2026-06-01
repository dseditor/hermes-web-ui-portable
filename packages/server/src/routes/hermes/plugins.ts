import Router from '@koa/router'
import * as ctrl from '../../controllers/hermes/plugins'

export const pluginRoutes = new Router()

pluginRoutes.get('/api/hermes/plugins', ctrl.list)
pluginRoutes.get('/api/hermes/plugins/capability-config', ctrl.getCapabilityConfig)
pluginRoutes.post('/api/hermes/plugins/capability-config', ctrl.setCapabilityConfig)
