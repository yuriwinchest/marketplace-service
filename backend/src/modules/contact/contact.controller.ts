import type { Response } from 'express'
import { BaseController } from '../../shared/base/BaseController.js'
import { ContactService } from './contact.service.js'
import { getContactSchema, unlockContactSchema } from './contact.schema.js'
import type { AuthedRequest } from '../../shared/types/auth.js'

export class ContactController extends BaseController {
  constructor(private contactService: ContactService) {
    super()
  }

  async getContact(req: AuthedRequest, res: Response): Promise<Response> {
    const parsed = getContactSchema.safeParse({
      userId: req.query.userId,
      serviceRequestId: req.query.serviceRequestId,
    })

    if (!parsed.success) {
      return this.error(res, 'Parâmetros inválidos')
    }

    try {
      const contact = await this.contactService.getContact(
        req.user.id,
        req.user.role,
        parsed.data,
      )

      return this.success(res, { contact })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter contato'
      if (message.includes('permissão') || message.includes('não está disponível')) {
        return this.forbidden(res, message)
      }
      if (message.includes('obrigatório')) {
        return this.error(res, message, 400)
      }
      if (message.includes('não encontrado')) {
        return this.notFound(res, message)
      }
      return this.serverError(res, message)
    }
  }

  async unlockContact(req: AuthedRequest, res: Response): Promise<Response> {
    if (req.user.role !== 'client') {
      return this.forbidden(res, 'Apenas clientes podem desbloquear contato direto')
    }

    const parsed = unlockContactSchema.safeParse(req.body)
    if (!parsed.success) {
      return this.error(res, 'Dados inválidos')
    }

    try {
      const result = await this.contactService.unlockProfessionalContact(
        req.user.id,
        parsed.data,
      )

      return this.success(res, result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao desbloquear contato'
      if (message.includes('permissão')) {
        return this.forbidden(res, message)
      }
      if (message.includes('não encontrado')) {
        return this.notFound(res, message)
      }
      return this.serverError(res, message)
    }
  }
}
