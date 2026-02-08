import { describe, expect, it } from 'vitest'
import { toPublicProfessionalResult } from './users.mapper.js'

describe('users.mapper', () => {
  it('does not expose contact fields in public professional listing', () => {
    const row: any = {
      id: 'u1',
      email: 'secret@example.com',
      name: 'John',
      description: 'desc',
      role: 'professional',
      avatar_url: '/uploads/a.png',
      created_at: '2026-02-07T00:00:00.000Z',
      bio: 'bio',
      phone: '+55 11 99999-9999',
      skills: ['a', 'b'],
      location_scope: 'national',
      uf: 'SP',
      city: 'Sao Paulo',
      is_remote: true,
      whatsapp: '+55 11 99999-9999',
    }

    const result = toPublicProfessionalResult(row)

    expect((result as any).user.email).toBeUndefined()
    expect((result as any).profile.phone).toBeUndefined()
    expect((result as any).profile.email).toBeUndefined()
    expect((result as any).profile.whatsapp).toBeUndefined()
    expect(result.user.id).toBe('u1')
    expect(result.profile.skills).toEqual(['a', 'b'])
  })
})

