import { Router } from 'express'
import { ServicesController } from './services.controller.js'
import { ServicesService } from './services.service.js'
import { ServicesRepository } from './services.repository.js'
import { authMiddleware } from '../../shared/middleware/auth.middleware.js'
import { optionalAuthMiddleware } from '../../shared/middleware/optionalAuth.middleware.js'
import { notificationsService } from '../notifications/notifications.routes.js'

const router = Router()
const repository = new ServicesRepository()
const service = new ServicesService(repository, notificationsService)
const controller = new ServicesController(service)

router.post('/', authMiddleware, (req, res) => controller.createRequest(req as any, res))
router.get('/', authMiddleware, (req, res) => controller.getClientRequests(req as any, res))
router.get('/open', (req, res) => controller.getOpenRequests(req, res))
router.get('/:id', optionalAuthMiddleware, (req, res) => controller.getRequestDetail(req as any, res))
router.get('/:id/stats', optionalAuthMiddleware, (req, res) => controller.getProposalStats(req, res))
router.put('/:id', authMiddleware, (req, res) => controller.updateRequest(req as any, res))
router.post('/:id/promote-urgent', authMiddleware, (req, res) => controller.promoteUrgent(req as any, res))

export default router
