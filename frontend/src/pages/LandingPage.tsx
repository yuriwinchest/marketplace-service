import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import { useServices } from '../hooks/useServices'
import { categoryIcons } from '../data/categoryIcons'
import { formatCurrency, formatTimeAgo, formatLocation, urgencyLabel } from '../utils/formatters'

const CATEGORIES_PER_PAGE = 8
const MAX_LANDING_SERVICES = 6

export function LandingPage() {
  const navigate = useNavigate()
  const { data: categories = [] } = useCategories()
  const { services, loading: servicesLoading } = useServices()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hoveredService, setHoveredService] = useState<string | null>(null)

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return categories
    return categories.filter((cat) => cat.name.toLowerCase().includes(term))
  }, [categories, search])

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE))
  const currentPage = Math.min(page, totalPages)

  const categoryPage = useMemo(() => {
    const start = (currentPage - 1) * CATEGORIES_PER_PAGE
    return filteredCategories.slice(start, start + CATEGORIES_PER_PAGE)
  }, [filteredCategories, currentPage])

  const featuredServices = useMemo(() => services.slice(0, MAX_LANDING_SERVICES), [services])

  useEffect(() => { setPage(1) }, [search])

  return (
    <div className="relative min-h-screen bg-[#021a0f] text-white overflow-x-hidden">

      {/* ── BACKGROUND GLOWS ─────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#10b981]/8 blur-[140px] rounded-full" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-[#10b981]/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">

        {/* ══════════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════════ */}
        <section className="px-4 sm:px-6 pt-10 pb-14">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">

              {/* Left: Copy */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981] text-xs font-black uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  Marketplace de Serviços
                </div>

                <div>
                  <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                    Contrate com clareza.
                  </h1>
                  <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-[#10b981]">
                    Feche negócio sem enrolação.
                  </h1>
                </div>

                <p className="text-base text-white/60 max-w-md leading-relaxed">
                  Publique sua demanda gratuitamente e receba propostas de freelancers qualificados. Pague com segurança.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/cadastrar')}
                    className="inline-flex items-center gap-2 bg-[#10b981] px-7 py-3.5 rounded-xl text-sm font-black text-[#021a0f] hover:bg-[#059669] transition-all shadow-lg shadow-[#10b981]/20"
                  >
                    Publicar Demanda <span>→</span>
                  </button>
                  <button
                    onClick={() => navigate('/servicos-publicos')}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 bg-white/5 text-sm font-black text-white hover:bg-white/10 transition-all"
                  >
                    Ver Oportunidades
                  </button>
                </div>
              </div>

              {/* Right: Image Card */}
              <div className="relative hidden lg:block">
                <div className="absolute -inset-4 bg-[#10b981]/15 blur-3xl rounded-[40px]" />
                <div className="relative rounded-3xl border border-white/10 bg-[#042f1c]/50 p-5 shadow-2xl">
                  <div className="absolute top-6 left-6 z-10 bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-lg">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#10b981]">Atendimento Rápido</span>
                  </div>
                  <div className="aspect-video rounded-2xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=900&auto=format&fit=crop"
                      alt="Profissionais trabalhando"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#021a0f]/80 via-transparent" />
                  </div>
                  <div className="absolute bottom-8 right-8 bg-[#10b981] text-[#021a0f] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xl">
                    ✅ Negócio Fechado
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            STATS BAR
        ══════════════════════════════════════════════════ */}
        <section className="border-y border-white/5 bg-[#042f1c]/40 backdrop-blur-sm px-4 sm:px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { v: '121', l: 'Contratos Fechados' },
                { v: 'R$ 2,99', l: 'Contato Direto' },
                { v: 'R$ 5,99', l: 'Urgência Premium' },
                { v: '4.5 ★', l: 'Média das Avaliações' },
              ].map((item, idx) => (
                <div key={item.l} className={`text-center sm:text-left ${idx < 3 ? 'sm:border-r border-white/5' : ''} px-4`}>
                  <div className="text-3xl font-black text-white">{item.v}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#10b981]/70 mt-1">{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            CATEGORIAS + SIDEBAR
        ══════════════════════════════════════════════════ */}
        <section className="px-4 sm:px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start">

              {/* LEFT: Categorias */}
              <div className="flex-1 min-w-0 rounded-3xl border border-white/5 bg-[#042f1c]/20 p-8">

                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-black text-white mb-4">Encontre o Profissional Certo</h2>
                  <div className="relative max-w-md mx-auto">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar categoria..."
                      className="w-full h-12 rounded-xl border border-white/10 bg-[#021a0f]/60 px-5 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#10b981]/50 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                  </div>
                </div>

                {/* Grid de Categorias */}
                {categoryPage.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {categoryPage.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => navigate('/servicos-publicos', { state: { categoryId: cat.id, fixedCategory: true } })}
                        className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-white/5 bg-white/3 hover:border-[#10b981]/30 hover:bg-[#064328]/50 transition-all"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-[#064328] border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-[#10b981]/20 transition-all">
                          {categoryIcons[cat.name] || '🔧'}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white/40 group-hover:text-white/70 transition-colors text-center leading-tight">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-white/30">
                    <p className="text-sm">Nenhuma categoria encontrada para "{search}"</p>
                  </div>
                )}

                {/* Paginação + CTA */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                  <button
                    onClick={() => navigate('/servicos-publicos')}
                    className="px-6 py-2.5 rounded-lg bg-[#10b981] text-xs font-black text-[#021a0f] hover:bg-[#059669] transition-all"
                  >
                    Ver Todas as Categorias
                  </button>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-[#10b981]/50 disabled:opacity-30 transition-all text-sm"
                      >←</button>
                      <span className="text-xs text-white/30 font-bold">{currentPage}/{totalPages}</span>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-[#10b981]/50 disabled:opacity-30 transition-all text-sm"
                      >→</button>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Sidebar Como Funciona */}
              <div className="w-full lg:w-72 shrink-0 space-y-6">
                <div className="rounded-3xl border border-white/5 bg-[#042f1c]/40 p-6">
                  <h3 className="text-lg font-black text-white mb-6">Como Funciona</h3>
                  <div className="space-y-5">
                    {[
                      { step: 'Publique sua demanda.', desc: 'Gratuito e rápido' },
                      { step: 'Receba propostas.', desc: 'Freelancers qualificados' },
                      { step: 'Contrate com segurança.', desc: 'Pagamento direto' },
                      { step: 'Serviço avaliado.', desc: 'Reputação transparente' },
                    ].map((item, index) => (
                      <div key={item.step} className="flex items-start gap-4">
                        <div className="w-7 h-7 shrink-0 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-xs font-black text-[#10b981]">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-snug">{item.step}</p>
                          <p className="text-xs text-white/30 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/cadastrar')}
                    className="w-full mt-6 py-3 rounded-xl bg-[#10b981] text-xs font-black text-[#021a0f] hover:bg-[#059669] transition-all"
                  >
                    Começar Agora
                  </button>
                </div>

                {/* Imagem decorativa */}
                <div className="rounded-3xl overflow-hidden border border-white/5 relative aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faeaa6?q=80&w=600&auto=format&fit=crop"
                    alt="Interior design"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#021a0f] via-[#021a0f]/50" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="h-0.5 w-8 bg-[#10b981] rounded-full mb-2" />
                    <p className="text-xs text-white/60 leading-relaxed italic">
                      O melhor lugar para encontrar profissionais qualificados.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            OPORTUNIDADES ABERTAS
        ══════════════════════════════════════════════════ */}
        <section className="px-4 sm:px-6 py-16 border-t border-white/5 bg-[#042f1c]/10">
          <div className="max-w-6xl mx-auto">

            {/* Header da seção */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#10b981]/60 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  Ao Vivo
                </div>
                <h2 className="text-2xl font-black text-white">Oportunidades Abertas</h2>
                <p className="text-sm text-white/40 mt-1">Demandas reais prontas para receberem propostas.</p>
              </div>
              <button
                onClick={() => navigate('/servicos-publicos')}
                className="shrink-0 px-6 py-2.5 rounded-xl bg-[#10b981] text-xs font-black text-[#021a0f] hover:bg-[#059669] transition-all"
              >
                Ver Todas as Demandas
              </button>
            </div>

            {/* Loading */}
            {servicesLoading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-56 rounded-2xl border border-white/5 bg-[#042f1c]/20 animate-pulse" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!servicesLoading && featuredServices.length === 0 && (
              <div className="rounded-2xl border border-white/5 bg-[#042f1c]/20 p-12 text-center">
                <div className="text-4xl opacity-20 mb-4">📁</div>
                <p className="text-base font-black text-white mb-2">Nenhuma demanda aberta</p>
                <p className="text-sm text-white/30 max-w-xs mx-auto mb-6">
                  No momento não existem oportunidades. Volte em breve ou publique a sua!
                </p>
                <button
                  onClick={() => navigate('/cadastrar')}
                  className="inline-flex items-center gap-2 text-[#10b981] font-black text-xs hover:gap-3 transition-all"
                >
                  Publicar minha primeira demanda <span>→</span>
                </button>
              </div>
            )}

            {/* Services Grid */}
            {!servicesLoading && featuredServices.length > 0 && (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {featuredServices.map((service) => {
                    const isHighUrgency = service.urgency === 'high'
                    const isHovered = hoveredService === service.id

                    return (
                      <div
                        key={service.id}
                        onClick={() => navigate(`/servico/${service.id}`)}
                        onMouseEnter={() => setHoveredService(service.id)}
                        onMouseLeave={() => setHoveredService(null)}
                        className={`group relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 flex flex-col overflow-hidden
                          ${isHighUrgency ? 'border-[#10b981]/20 bg-[#042f1c]/40' : 'border-white/5 bg-[#042f1c]/20'}
                          hover:border-[#10b981]/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20`}
                      >
                        {/* Glow */}
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[50px] pointer-events-none transition-opacity ${isHovered ? 'opacity-100' : 'opacity-50'} ${isHighUrgency ? 'bg-[#10b981]/20' : 'bg-[#10b981]/8'}`} />

                        {/* Urgência */}
                        {isHighUrgency && (
                          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20">
                            🔥 Urgente
                          </div>
                        )}

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                          <div className="w-9 h-9 rounded-xl bg-[#10b981]/10 border border-[#10b981]/10 flex items-center justify-center text-sm text-[#10b981] font-black">
                            {service.client_name?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white leading-none">
                              {service.client_name || 'Particular'}
                            </div>
                            <div className="text-[10px] text-white/30 mt-0.5">
                              {formatTimeAgo(service.created_at)}
                            </div>
                          </div>
                        </div>

                        {/* Título */}
                        <div className="flex-grow relative z-10 mb-4">
                          <h3 className="text-base font-black text-white group-hover:text-[#10b981] transition-colors line-clamp-2 leading-snug">
                            {service.title}
                          </h3>
                          {service.description && (
                            <p className="text-xs text-white/35 mt-2 line-clamp-2 leading-relaxed">
                              {service.description}
                            </p>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 relative z-10 mb-4">
                          <span className="text-[9px] font-black uppercase tracking-wider text-white/30 border border-white/5 bg-white/3 px-2 py-1 rounded-md">
                            📁 {service.category_name || 'Geral'}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-white/30 border border-white/5 bg-white/3 px-2 py-1 rounded-md">
                            📍 {formatLocation(service)}
                          </span>
                          {!isHighUrgency && (
                            <span className="text-[9px] font-black uppercase tracking-wider text-white/30 border border-white/5 bg-white/3 px-2 py-1 rounded-md">
                              {urgencyLabel(service.urgency)}
                            </span>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                          <div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-1">Orçamento</div>
                            <div className="text-base font-black text-white">
                              {service.budget_min && service.budget_max
                                ? `${formatCurrency(service.budget_min)} – ${formatCurrency(service.budget_max)}`
                                : 'A combinar'}
                            </div>
                          </div>
                          <div className={`w-8 h-8 rounded-full bg-[#10b981] text-[#021a0f] flex items-center justify-center text-sm font-black shadow-md transition-transform duration-200 ${isHovered ? 'translate-x-0.5' : ''}`}>
                            →
                          </div>
                        </div>

                        {service.proposals_count !== undefined && service.proposals_count > 0 && (
                          <div className="mt-3 text-[9px] font-black text-white/20 uppercase tracking-widest relative z-10">
                            {service.proposals_count} {service.proposals_count === 1 ? 'proposta' : 'propostas'} recebida{service.proposals_count !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-10 text-center">
                  <button
                    onClick={() => navigate('/servicos-publicos')}
                    className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-xl border border-[#10b981]/20 bg-[#10b981]/5 text-[#10b981] font-black text-xs tracking-widest uppercase hover:bg-[#10b981] hover:text-[#021a0f] transition-all"
                  >
                    Ver Todas as Demandas
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>
              </>
            )}

          </div>
        </section>

      </div>
    </div>
  )
}
