
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfessionals } from '../hooks/useProfessionals'
import { ProfessionalCard } from '../components/ProfessionalCard'
import { API_BASE_URL } from '../config'

export function ProfessionalsPage() {
  const navigate = useNavigate()
  const { items, loading, error, hasMore, page, fetchProfessionals } = useProfessionals()

  const [q, setQ] = useState('')
  const [uf, setUf] = useState('')
  const [city, setCity] = useState('')
  const [limit, setLimit] = useState(20)

  useEffect(() => {
    fetchProfessionals(1, limit, { uf, city })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return items
    return items.filter((p) => {
      const name = (p.user.name || '').toLowerCase()
      const bio = (p.user.description || p.profile.bio || '').toLowerCase()
      const skills = (p.profile.skills || []).join(' ').toLowerCase()
      const loc = `${p.profile.city || ''} ${p.profile.uf || ''}`.toLowerCase()
      return name.includes(term) || bio.includes(term) || skills.includes(term) || loc.includes(term)
    })
  }, [items, q])

  const onApplyFilters = () => {
    fetchProfessionals(1, limit, { uf, city })
  }

  const onClear = () => {
    setQ('')
    setUf('')
    setCity('')
    setLimit(20)
    fetchProfessionals(1, 20, { uf: '', city: '' })
  }

  const onNextPage = () => {
    fetchProfessionals(page + 1, limit, { uf, city })
  }

  return (
    <div className="professionalsPage max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Especialistas</h1>
          <p className="text-gray-400 mt-2 font-medium">Encontre os melhores talentos para o seu projeto.</p>
        </div>
        <button
          className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>
      </div>

      <div className="servicesLayout grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 items-start">
        <aside className="filtersPanel sticky top-24 bg-forest-800 border border-white/5 rounded-3xl p-6 shadow-xl space-y-8">
          <h3 className="text-white font-bold text-lg uppercase tracking-wider border-b border-white/5 pb-4">Filtros Avançados</h3>

          <div className="space-y-6">
            <div className="filterGroup space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Busca Rápida</label>
              <input
                className="w-full bg-forest-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ex: Designer, Dev..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="filterGroup space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">UF</label>
                <input
                  className="w-full bg-forest-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all text-sm text-center uppercase"
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  placeholder="EX"
                  maxLength={2}
                />
              </div>
              <div className="filterGroup space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Limite</label>
                <select
                  className="w-full bg-forest-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="filterGroup space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cidade</label>
              <input
                className="w-full bg-forest-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-forest-900 py-3 rounded-xl font-black transition-all shadow-lg shadow-emerald-500/10 text-sm"
              onClick={onApplyFilters}
              disabled={loading}
            >
              Aplicar
            </button>
            <button
              className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-all border border-white/5 text-sm"
              onClick={onClear}
              disabled={loading}
            >
              Limpar
            </button>
          </div>
        </aside>

        <section className="servicesResults space-y-6">
          <div className="resultsHeader flex items-center justify-between bg-forest-800/50 p-4 rounded-2xl border border-white/5">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              {filtered.length} {filtered.length === 1 ? 'profissional especializado' : 'profissionais encontrados'}
            </span>
          </div>

          {loading && page === 1 ? (
            <div className="flex items-center justify-center py-24 bg-forest-800/30 rounded-3xl border border-white/5">
              <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 text-red-400 p-10 rounded-3xl border border-red-500/20 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Falha na Conexão</h3>
              <p className="opacity-70">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-forest-800 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-black text-white mb-3">Nenhum talento encontrado</h3>
              <p className="text-gray-400 max-w-sm mx-auto mb-10 leading-relaxed">
                Tente expandir sua busca removendo filtros de localização ou usando termos mais genéricos.
              </p>
              <button
                className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold transition-all border border-white/10"
                onClick={onClear}
              >
                Redefinir Filtros
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="servicesList grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((p) => (
                  <ProfessionalCard key={p.user.id} item={p} apiBaseUrl={API_BASE_URL} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-10">
                  <button
                    className="bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-2xl font-black transition-all border border-white/10 shadow-xl disabled:opacity-50"
                    onClick={onNextPage}
                    disabled={loading}
                  >
                    {loading ? 'Carregando mais...' : 'Ver Próxima Página'}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
