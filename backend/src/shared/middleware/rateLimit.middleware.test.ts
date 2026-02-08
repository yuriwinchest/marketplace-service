import { describe, expect, it, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { rateLimitMiddleware } from './rateLimit.middleware.js'

const createRes = () => {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  return { status, json } as any as Response & { status: any; json: any }
}

describe('rateLimit.middleware', () => {
  it('blocks after exceeding maxRequests in window', () => {
    const mw = rateLimitMiddleware(2, 60_000)

    const req = { ip: '1.2.3.4' } as any as Request
    const res1 = createRes()
    const next1 = vi.fn() as unknown as NextFunction
    mw(req, res1, next1)
    expect(next1).toHaveBeenCalledTimes(1)

    const res2 = createRes()
    const next2 = vi.fn() as unknown as NextFunction
    mw(req, res2, next2)
    expect(next2).toHaveBeenCalledTimes(1)

    const res3 = createRes()
    const next3 = vi.fn() as unknown as NextFunction
    mw(req, res3, next3)
    expect(next3).not.toHaveBeenCalled()
    expect((res3 as any).status).toHaveBeenCalledWith(429)
  })
})

