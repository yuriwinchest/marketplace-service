import { Router } from 'express'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { AuthRepository } from './auth.repository.js'
import { AuthRefreshService } from './auth.refresh.service.js'
import { authRateLimit } from '../../shared/middleware/rateLimit.middleware.js'

const router = Router()
const repository = new AuthRepository()
const refreshService = new AuthRefreshService()
const service = new AuthService(repository, refreshService)
const controller = new AuthController(service)

router.post('/register', authRateLimit, (req, res) => controller.register(req, res))
router.post('/login', authRateLimit, (req, res) => controller.login(req, res))
router.post('/refresh', authRateLimit, (req, res) => controller.refresh(req, res))

export default router
