import { Router } from 'express'
import { SubscriptionsController } from './subscriptions.controller.js'
import { SubscriptionsService } from './subscriptions.service.js'
import { SubscriptionsRepository } from './subscriptions.repository.js'
import { authMiddleware } from '../../shared/middleware/auth.middleware.js'

const router = Router()
const repository = new SubscriptionsRepository()
const service = new SubscriptionsService(repository)
const controller = new SubscriptionsController(service)

router.get('/me', authMiddleware, (req, res) => controller.getMySubscription(req as any, res))
router.post('/', authMiddleware, (req, res) => controller.create(req as any, res))
router.post('/webhook', (req, res) => controller.webhook(req, res))

export default router
