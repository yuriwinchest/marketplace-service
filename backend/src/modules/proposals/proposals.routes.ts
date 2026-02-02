import { Router } from 'express'
import { ProposalsController } from './proposals.controller.js'
import { ProposalsService } from './proposals.service.js'
import { ProposalsRepository } from './proposals.repository.js'
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js'
import { SubscriptionsRepository } from '../subscriptions/subscriptions.repository.js'
import { authMiddleware } from '../../shared/middleware/auth.middleware.js'

const router = Router()
const proposalsRepository = new ProposalsRepository()
const subscriptionsRepository = new SubscriptionsRepository()
const subscriptionsService = new SubscriptionsService(subscriptionsRepository)
import { notificationsService } from '../notifications/notifications.routes.js'

const proposalsService = new ProposalsService(proposalsRepository, subscriptionsService, notificationsService)
const controller = new ProposalsController(proposalsService)

router.post('/', authMiddleware, (req, res) => controller.create(req as any, res))
router.get('/service-request/:serviceRequestId', authMiddleware, (req, res) =>
  controller.getByServiceRequest(req as any, res),
)
router.get('/me', authMiddleware, (req, res) => controller.getMyProposals(req as any, res))
router.post('/:id/accept', authMiddleware, (req, res) => controller.accept(req as any, res))
router.post('/:id/reject', authMiddleware, (req, res) => controller.reject(req as any, res))
router.post('/:id/cancel', authMiddleware, (req, res) => controller.cancel(req as any, res))

export default router
