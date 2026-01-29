import { Router } from 'express'
import { UsersController } from './users.controller.js'
import { UsersService } from './users.service.js'
import { UsersRepository } from './users.repository.js'
import { authMiddleware } from '../../shared/middleware/auth.middleware.js'
import { upload } from '../../shared/middleware/upload.middleware.js'

const router = Router()
const repository = new UsersRepository()
const service = new UsersService(repository)
const controller = new UsersController(service)

router.get('/profile', authMiddleware, (req, res) => controller.getProfile(req as any, res))
router.put('/profile', authMiddleware, (req, res) => controller.updateProfile(req as any, res))
router.post(
  '/profile/avatar',
  authMiddleware,
  upload.single('avatar'),
  (req, res) => controller.updateAvatar(req as any, res),
)

export default router
