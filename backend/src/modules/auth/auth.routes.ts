import { Router } from 'express'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { AuthRepository } from './auth.repository.js'
import { authRateLimit } from '../../shared/middleware/rateLimit.middleware.js'
import { upload } from '../../shared/middleware/upload.middleware.js'

const router = Router()
const repository = new AuthRepository()
const service = new AuthService(repository)
const controller = new AuthController(service)

router.post('/register', authRateLimit, upload.single('avatar'), (req, res) => controller.register(req, res))
router.post('/login', authRateLimit, (req, res) => controller.login(req, res))
router.post('/refresh', authRateLimit, (req, res) => controller.refresh(req, res))

export default router
