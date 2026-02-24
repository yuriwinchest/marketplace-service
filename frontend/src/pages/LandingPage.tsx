import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import { categoryIcons } from '../data/categoryIcons'

const CATEGORIES_PER_PAGE = 12

export function LandingPage() {
  const navigate = useNavigate()
  const { data: categories = [] } = useCategories()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

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

  useEffect(() => { setPage(1) }, [search])

  return (
    <div className="min-h-screen bg-[#071a0f] text-white">

      {/* ══════════════════════════════════════════════════
          HERO CARD
      ══════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 pt-6 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-[#0d2518] border border-white/5 shadow-2xl">

            {/* BG glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#10b981]/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-[#10b981]/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative grid lg:grid-cols-[1fr_420px] min-h-[320px]">

              {/* Left: Text */}
              <div className="p-8 md:p-12 flex flex-col justify-center space-y-5">

                {/* Badge */}
                <div className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#10b981]/80">
                    Marketplace de Serviços
                  </span>
                </div>

                {/* Headline */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white leading-snug">
                    Contrate com clareza.
                  </h1>
                  <h1 className="text-3xl md:text-4xl font-black text-[#10b981] leading-snug">
                    Feche negócio sem enrolação.
                  </h1>
                </div>

                {/* Sub */}
                <p className="text-sm text-white/60 max-w-sm leading-relaxed">
                  Publique sua demanda gratuitamente e receba propostas
                  de freelancers qualificadas.
                </p>

                {/* Inline links */}
                <p className="text-sm text-white/40">
                  Pague com segurança{' '}
                  <span className="text-white/20 mx-1">–</span>
                  <button
                    onClick={() => navigate('/servicos-publicos')}
                    className="text-[#10b981] font-semibold hover:underline"
                  >
                    Ver Oportunidades
                  </button>
                </p>

                {/* CTA */}
                <div>
                  <button
                    onClick={() => navigate('/cadastrar')}
                    className="inline-flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-[#021a0f] px-6 py-3 rounded-xl text-sm font-black transition-all shadow-lg shadow-[#10b981]/20"
                  >
                    Publicar Demanda
                    <span className="text-base">›</span>
                  </button>
                </div>
              </div>

              {/* Right: Illustration */}
              <div className="relative hidden lg:block overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
                  alt="Profissionais usando a plataforma"
                  className="absolute inset-0 w-full h-full object-cover object-center mix-blend-luminosity opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d2518] via-transparent to-[#0d2518]/30" />

                {/* Floating badge top */}
                <div className="absolute top-8 left-8 bg-[#021a0f]/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">Atendimento Rápido</span>
                </div>

                {/* Check card */}
                <div className="absolute top-1/2 -translate-y-1/2 right-8 w-44 bg-[#021a0f]/90 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#10b981] flex items-center justify-center text-[#021a0f] font-black text-base flex-shrink-0">✓</div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-white/20 rounded-full" />
                    <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                  </div>
                </div>

                {/* Bottom badge */}
                <div className="absolute bottom-8 right-8 bg-[#10b981] text-[#021a0f] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xl rotate-1">
                  ✅ Negócio Fechado
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CATEGORIAS + COMO FUNCIONA
      ══════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* ── LEFT: Categorias ─────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Section header */}
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white">Encontre o Profissional Certo</h2>
                <p className="text-sm text-white/40 mt-1">Busque e encontre freelancers para qualquer tipo de serviço.</p>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="O que você precisa?"
                  className="w-full h-11 rounded-2xl border border-white/10 bg-[#0d2518]/80 pl-10 pr-5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#10b981]/40 transition-all"
                />
              </div>

              {/* Category grid — 4 columns */}
              {categoryPage.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                  {categoryPage.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => navigate('/servicos-publicos', { state: { categoryId: cat.id, fixedCategory: true } })}
                      className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#0d2518] border border-white/5 hover:border-[#10b981]/30 hover:bg-[#0d2518]/80 transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#064328]/60 border border-white/8 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {categoryIcons[cat.name] || '🔧'}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-white/40 group-hover:text-white/70 transition-colors text-center leading-tight line-clamp-2">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-white/30">
                  <p className="text-sm">Nenhuma categoria encontrada</p>
                </div>
              )}

              {/* Pagination + Ver Todas */}
              <div className="flex items-center justify-between mt-6">
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-[#10b981]/40 disabled:opacity-30 transition-all text-sm"
                    >←</button>
                    <span className="text-xs text-white/30 font-bold">{currentPage}/{totalPages}</span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-[#10b981]/40 disabled:opacity-30 transition-all text-sm"
                    >→</button>
                  </div>
                )}

                <button
                  onClick={() => navigate('/servicos-publicos')}
                  className="mx-auto flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 bg-transparent text-sm font-bold text-white/70 hover:text-white hover:border-[#10b981]/30 transition-all"
                >
                  Ver Todas as Categorias
                  <span className="text-[#10b981]">›</span>
                </button>
              </div>
            </div>

            {/* ── RIGHT: Como Funciona ─────────────────── */}
            <div className="w-full lg:w-64 shrink-0">
              <div className="rounded-2xl bg-[#f0fdf4]/5 border border-white/8 backdrop-blur-sm p-6">
                <h3 className="text-base font-black text-white mb-5">Como Funciona</h3>

                <div className="space-y-4">
                  {[
                    'Publique sua demanda.',
                    'Receba propostas e negocie.',
                    'Contrate com segurança.',
                    'Serviço finalizado e avaliado.',
                  ].map((step, i) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-6 h-6 shrink-0 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[10px] font-black text-[#10b981]">
                        {i + 1}
                      </div>
                      <p className="text-sm text-white/70 font-medium leading-snug pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/cadastrar')}
                  className="w-full mt-6 py-2.5 rounded-xl bg-[#10b981] text-xs font-black text-[#021a0f] hover:bg-[#059669] transition-all flex items-center justify-center gap-2"
                >
                  Saiba Mais <span>›</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SEÇÃO DE VÍDEOS
      ══════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 py-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto">

          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#10b981]/60 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              Em Ação
            </div>
            <h2 className="text-2xl font-black text-white">Veja Como Funciona</h2>
            <p className="text-sm text-white/40 mt-2">Conheça a plataforma em funcionamento real.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { src: '/videos/video1.mp4', title: 'Publicando uma Demanda' },
              { src: '/videos/video2.mp4', title: 'Recebendo e Aceitando Propostas' },
            ].map((vid) => (
              <div key={vid.src} className="rounded-2xl overflow-hidden border border-white/8 bg-[#0d2518]">
                <video
                  src={vid.src}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full aspect-video object-cover"
                />
                <div className="px-5 py-3 border-t border-white/5">
                  <p className="text-sm font-bold text-white/70">{vid.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
