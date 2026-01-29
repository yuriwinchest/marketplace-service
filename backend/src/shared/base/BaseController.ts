import { Request, Response } from 'express'

export abstract class BaseController {
  protected success<T>(res: Response, data: T, statusCode = 200): Response {
    return res.status(statusCode).json({
      success: true,
      data,
    })
  }

  protected error(res: Response, message: string, statusCode = 400): Response {
    return res.status(statusCode).json({
      success: false,
      error: message,
    })
  }

  protected created<T>(res: Response, data: T): Response {
    return this.success(res, data, 201)
  }

  protected notFound(res: Response, message = 'Recurso não encontrado'): Response {
    return this.error(res, message, 404)
  }

  protected unauthorized(res: Response, message = 'Não autorizado'): Response {
    return this.error(res, message, 401)
  }

  protected forbidden(res: Response, message = 'Sem permissão'): Response {
    return this.error(res, message, 403)
  }

  protected serverError(res: Response, message = 'Erro interno do servidor'): Response {
    return this.error(res, message, 500)
  }
}
