import { Router } from 'express'
import { RegionsController } from './regions.controller.js'
import { RegionsService } from './regions.service.js'
import { RegionsRepository } from './regions.repository.js'

const router = Router()
const repository = new RegionsRepository()
const service = new RegionsService(repository)
const controller = new RegionsController(service)

router.get('/', (req, res) => controller.getAll(req, res))

export default router
