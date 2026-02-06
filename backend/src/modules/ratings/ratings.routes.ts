import { Router } from 'express'
import { authMiddleware } from '../../shared/middleware/auth.middleware.js'
import { RatingsController } from './ratings.controller.js'
import { RatingsRepository } from './ratings.repository.js'
import { RatingsService } from './ratings.service.js'

const router = Router()
const repository = new RatingsRepository()
const service = new RatingsService(repository)
const controller = new RatingsController(service)

router.post('/', authMiddleware, (req, res) => controller.create(req as any, res))
router.get('/user/:userId', authMiddleware, (req, res) => controller.listByUser(req as any, res))

export default router
