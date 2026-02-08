import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PublicProfessionalResult, View } from '../types'
import { ProfessionalCard } from '../components/ProfessionalCard'

interface ProfessionalsPageProps {
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>
  apiBaseUrl: string
  setView: (view: View) => void
  onBack?: () => void
}

function extractItems(json: unknown): PublicProfessionalResult[] {
  if (!json || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>

  const rootItems = obj.items
  if (Array.isArray(rootItems)) return rootItems as PublicProfessionalResult[]

  const data = obj.data
  if (data && typeof data === 'object') {
    const dataObj = data as Record<string, unknown>
    const dataItems = dataObj.items
    if (Array.isArray(dataItems)) return dataItems as PublicProfessionalResult[]
  }

  return []
}

export function ProfessionalsPage({ apiFetch, apiBaseUrl, setView, onBack }: ProfessionalsPageProps) {
  const [items, setItems] = useState<PublicProfessionalResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [q, setQ] = useState('')
  const [uf, setUf] = useState('')
  const [city, setCity] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [hasMore, setHasMore] = useState(true)

  const fetchPage = useCallback(async (pageNum: number, opts: { reset?: boolean } = {}) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      params.set('page', String(pageNum))
      params.set('limit', String(limit))
      if (uf.trim()) params.set('uf', uf.trim().toUpperCase())
      if (city.trim()) params.set('city', city.trim())

      const res = await apiFetch(`/api/users/professionals?${params.toString()}`, { method: 'GET' })
      if (!res.ok) {
        setError(`Erro ao carregar profissionais (HTTP ${res.status})`)
        return
      }
      const json: unknown = await res.json()
      const next = extractItems(json)

      setHasMore(next.length === limit)
      setItems(next)
      if (opts.reset) setPage(1)
    } catch {
      setError('Erro de conexão ao carregar profissionais')
    } finally {
      setLoading(false)
    }
  }, [apiFetch, city, limit, uf])

  useEffect(() => {
    void fetchPage(1, { reset: true })
    // Intentionally run only once on mount; filters are applied via the "Aplicar" button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return items
    return items.filter((p) => {
      const name = (p.user.name || '').toLowerCase()
      const desc = (p.user.description || p.profile.bio || '').toLowerCase()
      const skills = (p.profile.skills || []).join(' ').toLowerCase()
      const loc = `${p.profile.city || ''} ${p.profile.uf || ''}`.toLowerCase()
      return name.includes(term) || desc.includes(term) || skills.includes(term) || loc.includes(term)
    })
  }, [items, q])

  const onApplyFilters = async () => {
    await fetchPage(1, { reset: true })
  }

  const onClear = async () => {
    setQ('')
    setUf('')
    setCity('')
    setLimit(20)
    setPage(1)
    await fetchPage(1, { reset: true })
  }

  const onNextPage = async () => {
    const nextPage = page + 1
    setPage(nextPage)
    await fetchPage(nextPage)
  }

  return (
    <div className="professionalsPage">
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <button
            className="btnSecondary"
            onClick={onBack || (() => setView('home'))}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            ← Voltar
          </button>
        </div>
      </div>

      <div className="pageHeader">
        <div>
          <h1>Profissionais</h1>
          <p>Explore freelancers cadastrados. Para entrar em contato, é necessário ter plano ativo.</p>
        </div>
        <button className="btnSecondary" onClick={() => void fetchPage(1, { reset: true })} disabled={loading}>
          Atualizar Lista
        </button>
      </div>

      <div className="servicesLayout">
        <aside className="filtersPanel" aria-label="Filtros de profissionais">
          <h3>Filtros</h3>

          <div className="filterGroup">
            <label>Busca</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nome, skill, cidade..."
            />
          </div>

          <div className="filterGroup">
            <label>UF</label>
            <input
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              placeholder="Ex.: SP"
              maxLength={2}
            />
          </div>

          <div className="filterGroup">
            <label>Cidade</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex.: Sao Paulo"
            />
          </div>

          <div className="filterGroup">
            <label>Itens por pagina</label>
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btnPrimary btnSm" onClick={() => void onApplyFilters()} disabled={loading}>
              Aplicar
            </button>
            <button className="btnSecondary btnSm" onClick={() => void onClear()} disabled={loading}>
              Limpar
            </button>
          </div>
        </aside>

        <section className="servicesResults">
          <div className="resultsHeader">
            <span>{filtered.length} profissional(is) encontrado(s)</span>
          </div>

          {loading ? (
            <div className="loading">Carregando...</div>
          ) : error ? (
            <div className="emptyState">
              <div className="emptyIcon">⚠️</div>
              <h3>Falha ao carregar</h3>
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="emptyState">
              <div className="emptyIcon">🔍</div>
              <h3>Nenhum profissional encontrado</h3>
              <p>Tente ajustar os filtros ou volte mais tarde</p>
            </div>
          ) : (
            <div className="servicesList" aria-label="Lista de profissionais">
              {filtered.map((p) => (
                <ProfessionalCard key={p.user.id} item={p} apiBaseUrl={apiBaseUrl} />
              ))}

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button
                  className="btnSecondary"
                  onClick={() => void onNextPage()}
                  disabled={loading || !hasMore}
                  title={!hasMore ? 'Nao ha mais resultados' : undefined}
                >
                  {hasMore ? 'Proxima pagina' : 'Sem mais resultados'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
