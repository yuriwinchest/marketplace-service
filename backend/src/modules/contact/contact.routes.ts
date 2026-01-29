import { Router } from 'express'
import { ContactController } from './contact.controller.js'
import { ContactService } from './contact.service.js'
import { ContactRepository } from './contact.repository.js'
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js'
import { SubscriptionsRepository } from '../subscriptions/subscriptions.repository.js'
import { authMiddleware } from '../../shared/middleware/auth.middleware.js'

const router = Router()
const contactRepository = new ContactRepository()
const subscriptionsRepository = new SubscriptionsRepository()
const subscriptionsService = new SubscriptionsService(subscriptionsRepository)
const contactService = new ContactService(contactRepository, subscriptionsService)
const controller = new ContactController(contactService)

router.get('/', authMiddleware, (req, res) => controller.getContact(req as any, res))

export default router
