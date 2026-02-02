
import { Router } from 'express'
import { NotificationsController } from './notifications.controller.js'
import { NotificationsService } from './notifications.service.js'
import { NotificationsRepository } from './notifications.repository.js'
import { authMiddleware } from '../../shared/middleware/auth.middleware.js'

const router = Router()

// Dependency Injection
const notificationsRepository = new NotificationsRepository()
const notificationsService = new NotificationsService(notificationsRepository)
const notificationsController = new NotificationsController(notificationsService)

// Routes
router.use(authMiddleware)

router.get('/', (req, res) => notificationsController.list(req as any, res))
router.patch('/read-all', (req, res) => notificationsController.markAllAsRead(req as any, res))
router.patch('/:id/read', (req, res) => notificationsController.markAsRead(req as any, res))

export default router
export { notificationsService } // Export to usage in other modules
