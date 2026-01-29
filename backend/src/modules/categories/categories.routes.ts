import { Router } from 'express'
import { CategoriesController } from './categories.controller.js'
import { CategoriesService } from './categories.service.js'
import { CategoriesRepository } from './categories.repository.js'

const router = Router()
const repository = new CategoriesRepository()
const service = new CategoriesService(repository)
const controller = new CategoriesController(service)

router.get('/', (req, res) => controller.getAll(req, res))

export default router
