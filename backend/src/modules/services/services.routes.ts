import { Router } from 'express'
import { ServicesController } from './services.controller.js'
import { ServicesService } from './services.service.js'
import { ServicesRepository } from './services.repository.js'
import { authMiddleware } from '../../shared/middleware/auth.middleware.js'

const router = Router()
const repository = new ServicesRepository()
const service = new ServicesService(repository)
const controller = new ServicesController(service)

router.post('/', authMiddleware, (req, res) => controller.createRequest(req as any, res))
router.get('/', authMiddleware, (req, res) => controller.getClientRequests(req as any, res))
router.get('/open', authMiddleware, (req, res) => controller.getOpenRequests(req as any, res))

export default router
