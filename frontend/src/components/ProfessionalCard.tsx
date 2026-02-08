import type { PublicProfessionalResult } from '../types'
import './ProfessionalCard.css'

function initials(name: string | null): string {
  const n = (name || '').trim()
  if (!n) return 'P'
  const parts = n.split(/\s+/).slice(0, 2)
  return parts.map(p => p.slice(0, 1).toUpperCase()).join('')
}

function locationLine(p: PublicProfessionalResult['profile']): string {
  if (p.is_remote) return 'Remoto'
  if (p.city && p.uf) return `${p.city}/${p.uf}`
  if (p.uf) return p.uf
  return 'Brasil'
}

export function ProfessionalCard({ item, apiBaseUrl }: { item: PublicProfessionalResult; apiBaseUrl: string }) {
  const name = item.user.name || 'Profissional'
  const desc = item.user.description || item.profile.bio || ''
  const skills = (item.profile.skills || []).slice(0, 6)
  const loc = locationLine(item.profile)
  const avatarUrl = item.user.avatar_url
    ? (item.user.avatar_url.startsWith('/') ? `${apiBaseUrl}${item.user.avatar_url}` : item.user.avatar_url)
    : null

  return (
    <article className="professional-card">
      <div className="professional-card-header">
        <div className="professional-card-user">
          <div className="professional-card-avatar" aria-label="Avatar do profissional">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              <span>{initials(item.user.name)}</span>
            )}
          </div>
          <div className="professional-card-user-info">
            <div className="professional-card-name" title={name}>{name}</div>
            <div className="professional-card-subline" title={loc}>{loc}</div>
          </div>
        </div>

        <div className="professional-card-badges">
          <span className="professional-pill locked" title="Contato bloqueado para visitantes e contas sem plano ativo">
            🔒 Contato
          </span>
        </div>
      </div>

      <div className="professional-card-title">Perfil profissional</div>

      <p className="professional-card-desc">
        {desc ? desc.slice(0, 220) : 'Sem descrição pública.'}
        {desc && desc.length > 220 ? '...' : ''}
      </p>

      <div className="professional-card-footer">
        <div className="professional-card-tags" aria-label="Habilidades">
          {skills.length === 0 ? (
            <span className="professional-tag">Sem skills</span>
          ) : (
            skills.map((s) => (
              <span key={s} className="professional-tag">{s}</span>
            ))
          )}
        </div>
        <div className="professional-card-cta">Assine para entrar em contato</div>
      </div>
    </article>
  )
}
