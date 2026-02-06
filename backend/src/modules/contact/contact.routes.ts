import { Router } from 'express'
import { ContactController } from './contact.controller.js'
import { ContactService } from './contact.service.js'
import { ContactRepository } from './contact.repository.js'
import { authMiddleware } from '../../shared/middleware/auth.middleware.js'

const router = Router()
const contactRepository = new ContactRepository()
const contactService = new ContactService(contactRepository)
const controller = new ContactController(contactService)

router.get('/', authMiddleware, (req, res) => controller.getContact(req as any, res))
router.post('/unlock', authMiddleware, (req, res) => controller.unlockContact(req as any, res))

export default router
