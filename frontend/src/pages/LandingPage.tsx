import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import { useServices } from '../hooks/useServices'
import { categoryIcons } from '../data/categoryIcons'
import { formatCurrency, formatTimeAgo, formatLocation, urgencyLabel } from '../utils/formatters'

const CATEGORIES_PER_PAGE = 12
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

  const featuredServices = useMemo(() => {
    return services.slice(0, MAX_LANDING_SERVICES)
  }, [services])

  useEffect(() => {
    setPage(1)
  }, [search])

  return (
    <div className="relative min-h-screen bg-[#021a0f] text-white selection:bg-[#10b981] selection:text-[#021a0f]">
      {/* Background Decorative Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#10b981]/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-[#10b981]/5 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[30%] bg-[#10b981]/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-12 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
              {/* Hero Content */}
              <div className="space-y-10 animate-in fade-in slide-in-from-left duration-1000">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981] text-xs font-black uppercase tracking-[0.2em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                    Marketplace de Serviços
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
                    Contrate com clareza.
                    <br />
                    <span className="text-[#10b981]">Feche negócio sem enrolação.</span>
                  </h1>
                  <p className="text-xl text-emerald-100/70 max-w-xl leading-relaxed">
                    Publique sua demanda gratuitamente e receba propostas diretamente dos freelancers.
                    Pague com segurança e negocie com confiança.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => navigate('/cadastrar')}
                    className="group relative inline-flex items-center gap-3 bg-[#10b981] px-10 py-5 rounded-2xl text-xl font-black text-[#021a0f] transition-all hover:scale-[1.03] active:scale-95 shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)]"
                  >
                    Publicar Demanda
                    <span className="text-2xl transition-transform group-hover:translate-x-1">→</span>
                  </button>
                  <button
                    onClick={() => navigate('/servicos-publicos')}
                    className="inline-flex items-center gap-2 px-8 py-5 rounded-2xl border border-white/10 bg-white/5 text-base font-black text-white hover:bg-white/10 transition-all"
                  >
                    Ver Oportunidades
                  </button>
                </div>
              </div>

              {/* Hero Illustration */}
              <div className="relative animate-in fade-in slide-in-from-right duration-1000 delay-200">
                <div className="absolute -inset-4 bg-[#10b981]/20 blur-3xl rounded-[40px] opacity-50" />
                <div className="relative rounded-[40px] border border-white/10 bg-[#042f1c]/40 backdrop-blur-xl p-6 shadow-2xl">
                  {/* Decorative Elements around image */}
                  <div className="absolute top-10 left-10 z-20 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl shadow-xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]">ATENDIMENTO RÁPIDO</span>
                  </div>

                  <div className="relative aspect-[1.4/1] rounded-3xl overflow-hidden shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop"
                      alt="Profissionais trabalhando"
                      className="w-full h-full object-cover opacity-70 mix-blend-luminosity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#021a0f] via-transparent to-[#021a0f]/20" />

                    {/* Floating check mark like design */}
                    <div className="absolute top-12 right-10 w-48 bg-[#021a0f]/90 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center text-[#021a0f] text-lg font-bold">✓</div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2 w-full bg-white/20 rounded-full" />
                        <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                      </div>
                    </div>

                    <div className="absolute bottom-10 right-10 bg-[#10b981] text-[#021a0f] px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-2xl transform rotate-2">
                      ✅ Negócio Fechado
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <section className="relative z-20 border-y border-white/5 bg-[#042f1c]/30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto py-10 px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { v: '121', l: 'Contratos Fechados' },
                { v: 'R$ 2,99', l: 'Contato Direto' },
                { v: 'R$ 5,99', l: 'Urgência Premium' },
                { v: '4.5 ★★★', l: 'Média das Avaliações' },
              ].map((item, idx) => (
                <div key={item.l} className={`flex flex-col items-center lg:items-start ${idx < 3 ? 'lg:border-r border-white/5' : ''}`}>
                  <div className="text-4xl md:text-5xl font-black text-white">{item.v}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#10b981] mt-2 opacity-80">{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MAIN CONTENT GRID */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-[1fr_360px] gap-12 items-start">

              {/* Left Column: Categories */}
              <div className="space-y-12 rounded-[48px] border border-white/5 bg-[#042f1c]/20 backdrop-blur-md p-10 md:p-14">
                <div className="space-y-8 max-w-2xl mx-auto text-center">
                  <h2 className="text-4xl font-black text-white">Encontre o Profissional Certo</h2>
                  <div className="relative group">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar categoria..."
                      className="w-full h-16 rounded-2xl border border-white/10 bg-[#021a0f]/60 px-8 text-lg text-white placeholder:text-emerald-100/30 focus:outline-none focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/10 transition-all"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-100/30 group-focus-within:text-[#10b981] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                  </div>
                </div>

                {/* Category Grid */}
                {categoryPage.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {categoryPage.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => navigate('/servicos-publicos', { state: { categoryId: cat.id, fixedCategory: true } })}
                        className="flex flex-col items-center group space-y-4"
                      >
                        <div className="w-20 h-20 rounded-3xl bg-[#064328] border border-white/10 flex items-center justify-center text-4xl transition-all group-hover:bg-[#10b981] group-hover:scale-110 shadow-xl group-hover:shadow-[#10b981]/20">
                          <span className="filter grayscale group-hover:grayscale-0 transition-all">
                            {categoryIcons[cat.name] || '🔧'}
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100/40 transition-all group-hover:text-white text-center">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-emerald-100/30">
                    <p className="text-lg font-medium">Nenhuma categoria encontrada para "{search}"</p>
                  </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => navigate('/servicos-publicos')}
                    className="px-10 py-4 rounded-xl bg-[#10b981] text-sm font-black text-[#021a0f] hover:bg-[#059669] transition-all"
                  >
                    Ver Todas as Categorias
                  </button>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-[#10b981] disabled:opacity-30 transition-all text-sm"
                      >
                        ←
                      </button>
                      <span className="text-xs font-black text-emerald-100/40 tracking-widest">
                        {currentPage}/{totalPages}
                      </span>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-[#10b981] disabled:opacity-30 transition-all text-sm"
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Sidebar */}
              <aside className="space-y-10">
                {/* How it works */}
                <div className="rounded-[40px] border border-white/5 bg-[#042f1c]/40 backdrop-blur-md p-10">
                  <h3 className="text-3xl font-black mb-10 text-white">Como Funciona</h3>
                  <div className="space-y-8">
                    {[
                      { step: 'Publique sua demanda.', desc: 'Gratuito e rápido' },
                      { step: 'Receba propostas e negocie.', desc: 'Freelancers qualificados' },
                      { step: 'Contrate com segurança.', desc: 'Pagamento direto' },
                      { step: 'Serviço finalizado e avaliado.', desc: 'Reputação transparente' },
                    ].map((item, index) => (
                      <div key={item.step} className="flex items-start gap-5 group">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-sm font-black text-[#10b981] transition-colors group-hover:bg-[#10b981] group-hover:text-[#021a0f]">
                          {index + 1}
                        </div>
                        <div className="pt-1">
                          <p className="text-base text-white font-bold leading-tight">{item.step}</p>
                          <p className="text-xs text-emerald-100/40 font-medium mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/cadastrar')}
                    className="w-full mt-12 py-4 rounded-2xl bg-[#10b981] text-sm font-black text-[#021a0f] hover:bg-[#059669] transition-all"
                  >
                    Começar Agora
                  </button>
                </div>

                {/* Interior Image Card */}
                <div className="rounded-[40px] overflow-hidden group border border-white/5 aspect-[4/5] relative">
                  <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faeaa6?q=80&w=800&auto=format&fit=crop"
                    alt="Interior design"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40 mix-blend-luminosity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#021a0f] via-transparent" />
                  <div className="absolute bottom-10 left-10 right-10 space-y-3">
                    <div className="h-1 w-12 bg-[#10b981] rounded-full" />
                    <p className="text-sm text-emerald-100/80 leading-relaxed font-medium italic">
                      O melhor lugar para encontrar profissionais qualificados e resolver suas necessidades rapidamente.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* OPEN OPPORTUNITIES */}
        <section className="pb-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between gap-6 mb-12">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#10b981]/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  Ao Vivo
                </div>
                <h2 className="text-4xl font-black text-white">Oportunidades Abertas</h2>
                <p className="text-emerald-100/50 font-medium">Demandas reais prontas para receberem propostas.</p>
              </div>
              <button
                onClick={() => navigate('/servicos-publicos')}
                className="px-8 py-3.5 rounded-xl bg-[#10b981] text-sm font-black text-[#021a0f] hover:bg-[#059669] transition-all shadow-xl shadow-teal-500/10"
              >
                Ver Todas as Demandas
              </button>
            </div>

            {/* Loading State */}
            {servicesLoading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-72 rounded-[32px] border border-white/5 bg-[#042f1c]/20 animate-pulse" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!servicesLoading && featuredServices.length === 0 && (
              <div className="rounded-[40px] border border-white/5 bg-[#042f1c]/10 backdrop-blur-sm p-12 text-center">
                <div className="max-w-sm mx-auto space-y-6 py-8">
                  <div className="text-6xl grayscale opacity-30">📁</div>
                  <div className="space-y-2">
                    <p className="text-2xl font-black text-white">Nenhuma demanda aberta</p>
                    <p className="text-emerald-100/30 text-base leading-relaxed">No momento não existem novas oportunidades. Volte em breve ou publique sua própria demanda!</p>
                  </div>
                  <button
                    onClick={() => navigate('/cadastrar')}
                    className="inline-flex items-center gap-2 text-[#10b981] font-black text-sm hover:gap-3 transition-all"
                  >
                    Publicar minha primeira demanda <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Services Grid */}
            {!servicesLoading && featuredServices.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredServices.map((service) => {
                  const isHighUrgency = service.urgency === 'high'
                  const isHovered = hoveredService === service.id

                  return (
                    <div
                      key={service.id}
                      onClick={() => navigate(`/servico/${service.id}`)}
                      onMouseEnter={() => setHoveredService(service.id)}
                      onMouseLeave={() => setHoveredService(null)}
                      className={`group relative rounded-[32px] border p-8 cursor-pointer transition-all duration-500 flex flex-col overflow-hidden
                        ${isHighUrgency
                          ? 'border-[#10b981]/30 bg-[#042f1c]/40'
                          : 'border-white/5 bg-[#042f1c]/20'
                        }
                        hover:border-[#10b981]/30 hover:shadow-2xl hover:shadow-[#10b981]/5 hover:-translate-y-1
                      `}
                    >
                      {/* Glow */}
                      <div className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-[70px] pointer-events-none transition-transform duration-700 ${isHovered ? 'scale-150' : 'scale-100'} ${isHighUrgency ? 'bg-[#10b981]/15' : 'bg-[#10b981]/8'}`} />

                      {/* Urgency Badge (top-right) */}
                      {isHighUrgency && (
                        <div className="absolute top-6 right-6 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                          🔥 Urgente
                        </div>
                      )}

                      {/* Header: Client */}
                      <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/10 flex items-center justify-center text-base text-[#10b981] font-black">
                          {service.client_name?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm leading-none">
                            {service.client_name || 'Particular'}
                          </div>
                          <div className="text-[10px] text-emerald-100/30 font-medium mt-1">
                            {formatTimeAgo(service.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="flex-grow space-y-3 relative z-10">
                        <h3 className="text-lg font-black text-white group-hover:text-[#10b981] transition-colors line-clamp-2 leading-snug">
                          {service.title}
                        </h3>
                        {service.description && (
                          <p className="text-sm text-emerald-100/40 font-medium line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-6 relative z-10">
                        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-100/40 border border-white/5 bg-white/5 px-3 py-1.5 rounded-lg">
                          📁 {service.category_name || 'Geral'}
                        </span>
                        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-100/40 border border-white/5 bg-white/5 px-3 py-1.5 rounded-lg">
                          📍 {formatLocation(service)}
                        </span>
                        {!isHighUrgency && (
                          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-100/40 border border-white/5 bg-white/5 px-3 py-1.5 rounded-lg">
                            {urgencyLabel(service.urgency)}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-emerald-100/30 mb-1">Orçamento</div>
                          <div className="text-xl font-black text-white">
                            {service.budget_min && service.budget_max
                              ? `${formatCurrency(service.budget_min)} – ${formatCurrency(service.budget_max)}`
                              : 'A combinar'}
                          </div>
                        </div>
                        <div className={`w-10 h-10 rounded-full bg-[#10b981] text-[#021a0f] flex items-center justify-center font-black shadow-lg shadow-[#10b981]/20 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
                          →
                        </div>
                      </div>

                      {/* Proposals count */}
                      {service.proposals_count !== undefined && service.proposals_count > 0 && (
                        <div className="mt-4 text-[10px] font-black text-emerald-100/30 uppercase tracking-widest relative z-10">
                          {service.proposals_count} {service.proposals_count === 1 ? 'proposta recebida' : 'propostas recebidas'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* View More CTA */}
            {!servicesLoading && featuredServices.length > 0 && (
              <div className="mt-14 text-center">
                <button
                  onClick={() => navigate('/servicos-publicos')}
                  className="group inline-flex items-center gap-3 px-12 py-5 rounded-2xl border border-[#10b981]/20 bg-[#10b981]/5 text-[#10b981] font-black text-sm tracking-widest uppercase hover:bg-[#10b981] hover:text-[#021a0f] transition-all"
                >
                  Ver Todas as Demandas
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
