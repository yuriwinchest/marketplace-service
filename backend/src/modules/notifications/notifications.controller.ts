
import type { Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { NotificationsService } from './notifications.service.js'
import type { AuthedRequest } from '../../shared/types/auth.js'

export class NotificationsController extends BaseController {
    constructor(private notificationsService: NotificationsService) {
        super()
    }

    async list(req: AuthedRequest, res: Response): Promise<Response> {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 20

        try {
            const db = req.db
            if (!db) return this.unauthorized(res, 'Não autenticado')
            const result = await this.notificationsService.getUserNotifications(db, req.user.id, page, limit)
            return this.success(res, result)
        } catch (error) {
            return this.serverError(res, 'Erro ao buscar notificações')
        }
    }

    async markAsRead(req: AuthedRequest, res: Response): Promise<Response> {
        const id = req.params.id as string

        try {
            const db = req.db
            if (!db) return this.unauthorized(res, 'Não autenticado')
            await this.notificationsService.markAsRead(db, id, req.user.id)
            return this.success(res, { message: 'Notificação marcada como lida' })
        } catch (error) {
            return this.serverError(res, 'Erro ao atualizar notificação')
        }
    }

    async markAllAsRead(req: AuthedRequest, res: Response): Promise<Response> {
        try {
            const db = req.db
            if (!db) return this.unauthorized(res, 'Não autenticado')
            await this.notificationsService.markAllAsRead(db, req.user.id)
            return this.success(res, { message: 'Todas as notificações marcadas como lidas' })
        } catch (error) {
            return this.serverError(res, 'Erro ao atualizar notificações')
        }
    }
}
