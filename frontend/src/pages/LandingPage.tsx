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

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase()
    return t ? categories.filter(c => c.name.toLowerCase().includes(t)) : categories
  }, [categories, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / CATEGORIES_PER_PAGE))
  const cur = Math.min(page, totalPages)
  const visible = useMemo(() => filtered.slice((cur - 1) * CATEGORIES_PER_PAGE, cur * CATEGORIES_PER_PAGE), [filtered, cur])

  useEffect(() => { setPage(1) }, [search])

  return (
    <div className="min-h-screen bg-[#021a0f] text-white selection:bg-[#10b981]/30 selection:text-white">

      {/* ── BACKGROUND ORCHESTRATION ──────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10b981]/10 blur-[120px] rounded-full animate-[glow-pulse_8s_infinite]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[50%] bg-[#10b981]/5 blur-[100px] rounded-full animate-[glow-pulse_12s_infinite_reverse]" />
        <div className="absolute top-[40%] left-[30%] w-[20%] h-[20%] bg-[#10b981]/5 blur-[80px] rounded-full opacity-50" />
      </div>

      <div className="relative z-10 font-sans">

        {/* ══════════════════════════════════════════════════
            HERO SECTION: REDEFINED DENSITY
        ══════════════════════════════════════════════════ */}
        <section className="px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="glass-panel rounded-[40px] overflow-hidden grid lg:grid-cols-[1.1fr_0.9fr] border-[#34d399]/20 shadow-2xl animate-reveal-in">

              {/* Left Content */}
              <div className="p-8 md:p-14 md:pr-4 flex flex-col justify-center gap-6">
                <div className="flex items-center gap-3 stagger-1 opacity-0 animate-[reveal-up_0.8s_forwards]">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] font-display text-[#10b981]/90">
                    Marketplace de Serviços Elite
                  </span>
                </div>

                <div className="space-y-2 stagger-2 opacity-0 animate-[reveal-up_0.8s_0.1s_forwards]">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display leading-[1.1] tracking-tight">
                    Contrate com <span className="text-[#10b981] drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">clareza.</span>
                  </h1>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black font-display leading-[1.1] text-emerald-100/40">
                    Sem enrolação.
                  </h1>
                </div>

                <p className="text-base text-emerald-100/60 leading-relaxed max-w-md stagger-3 opacity-0 animate-[reveal-up_0.8s_0.2s_forwards]">
                  Publique sua demanda gratuitamente e receba propostas diretas
                  de talentos verificados. Negocie com agilidade e pague com segurança.
                </p>

                <div className="flex flex-wrap items-center gap-4 stagger-4 opacity-0 animate-[reveal-up_0.8s_0.3s_forwards]">
                  <button
                    onClick={() => navigate('/cadastrar')}
                    className="inline-flex items-center gap-3 bg-[#10b981] hover:bg-[#059669] text-[#021a0f] px-8 py-4 rounded-2xl text-base font-black transition-all hover:scale-[1.02] active:scale-95 shadow-[0_15px_30px_-10px_rgba(16,185,129,0.4)]"
                  >
                    Publicar Demanda <span className="text-xl">›</span>
                  </button>
                  <button
                    onClick={() => navigate('/servicos-publicos')}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold transition-all text-white/80"
                  >
                    Ver Oportunidades
                  </button>
                </div>
              </div>

              {/* Right Illustration */}
              <div className="relative hidden lg:block overflow-hidden bg-[#042f1c]">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200"
                  alt="Elite Workforce"
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-110 group-hover:scale-100 transition-transform duration-[4s]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d2518] via-transparent to-transparent" />

                {/* Float Card 1 */}
                <div className="absolute top-10 left-10 glass-panel border-white/10 px-6 py-3 rounded-2xl shadow-2xl animate-[reveal-up_1s_0.5s_forwards] opacity-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">FAST TRACK</span>
                  <div className="h-1.5 w-12 bg-[#10b981]/20 rounded-full mt-2" />
                </div>

                {/* Float Card 2 */}
                <div className="absolute bottom-12 right-12 glass-panel border-[#10b981]/30 p-5 rounded-[32px] shadow-2xl flex items-center gap-4 animate-[reveal-in_1s_0.8s_forwards] opacity-0">
                  <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center text-[#021a0f] font-black text-xl shadow-[0_0_20px_#10b981]">✓</div>
                  <div className="space-y-2">
                    <div className="h-2 w-24 bg-white/20 rounded-full" />
                    <div className="h-2 w-16 bg-white/10 rounded-full" />
                  </div>
                </div>

                {/* Floating Status */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
                  <div className="w-px h-64 bg-gradient-to-b from-transparent via-[#10b981]/20 to-transparent rotate-12" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            DISTRIBUTED GRID: CATEGORIES & WORKFLOW
        ══════════════════════════════════════════════════ */}
        <section className="px-4 py-12 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-10 items-stretch">

              {/* Main Column: Discover */}
              <div className="flex-1 glass-panel rounded-[40px] p-8 md:p-12 border-[#34d399]/10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                  <div className="space-y-3">
                    <h2 className="text-3xl md:text-4xl font-black font-display text-white">
                      Habilidades <span className="text-[#10b981]">Premium</span>
                    </h2>
                    <p className="text-base text-emerald-100/40 font-medium">
                      Busque profissionais qualificados em mais de 120 categorias.
                    </p>
                  </div>

                  <div className="relative w-full md:w-80 group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#10b981] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Qual especialista procura?"
                      className="w-full h-14 rounded-2xl border border-white/5 bg-white/5 pl-14 pr-6 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-[#10b981]/40 focus:bg-white/10 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Intelligent Grid */}
                {visible.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {visible.map((cat, i) => (
                      <button
                        key={cat.id}
                        onClick={() => navigate('/servicos-publicos', { state: { categoryId: cat.id, fixedCategory: true } })}
                        className={`group glass-panel glass-panel-hover p-6 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:bg-[#10b981]/5 hover:border-[#10b981]/30 opacity-0 animate-[reveal-up_0.6s_forwards]`}
                        style={{ animationDelay: `${(i % 4) * 0.05}s` }}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-[#064328]/50 border border-white/5 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-3 transition-all">
                          {categoryIcons[cat.name] || '🔧'}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-emerald-100 transition-colors text-center leading-tight max-w-full truncate px-1">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 glass-panel rounded-3xl border-dashed">
                    <div className="text-5xl opacity-20 mb-4">🔍</div>
                    <p className="text-lg font-bold text-white/40">Busca sem resultados para "{search}"</p>
                  </div>
                )}

                {/* Control Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-12 gap-8 pt-8 border-t border-white/5">
                  <button
                    onClick={() => navigate('/servicos-publicos')}
                    className="px-10 py-4 rounded-xl text-sm font-black text-white/80 hover:text-[#10b981] border border-white/5 bg-white/3 hover:border-[#10b981]/20 transition-all"
                  >
                    Explorar Todas as Categorias
                  </button>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-4">
                      <button
                        disabled={cur === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-[#10b981]/50 disabled:opacity-30 transition-all text-xl"
                      >←</button>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-[#10b981]">{cur}</span>
                        <span className="text-sm text-white/20">/</span>
                        <span className="text-sm font-bold text-white/30">{totalPages}</span>
                      </div>
                      <button
                        disabled={cur === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-[#10b981]/50 disabled:opacity-30 transition-all text-xl"
                      >→</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Column: Action */}
              <div className="lg:w-[280px] flex flex-col gap-8 flex-shrink-0">
                <div className="glass-panel rounded-[40px] p-8 border-[#10b981]/20 flex-1 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#10b981]/10 transition-colors" />

                  <h3 className="text-2xl font-black font-display text-white mb-10">Fluxo de <br /><span className="text-[#10b981]">Sucesso</span></h3>

                  <div className="space-y-8 relative z-10">
                    {[
                      { l: 'Publique sua demanda.', d: 'Diga o que você precisa.' },
                      { l: 'Receba e negocie.', d: 'Vários perfis, uma escolha.' },
                      { l: 'Contrate seguro.', d: 'Pagamento 100% garantido.' },
                      { l: 'Avalie o resultado.', d: 'Reputação é poder.' },
                    ].map((step, i) => (
                      <div key={step.l} className="flex items-start gap-4 stagger-1">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[11px] font-black text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white leading-tight">{step.l}</p>
                          <p className="text-[11px] text-white/30 mt-1 font-medium">{step.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/cadastrar')}
                    className="w-full mt-12 py-5 rounded-2xl bg-[#10b981]/10 hover:bg-[#10b981] text-[#10b981] hover:text-[#021a0f] border border-[#10b981]/30 text-xs font-black tracking-widest uppercase transition-all shadow-glow"
                  >
                    Começar Jornada ›
                  </button>
                </div>

                {/* Decorative Visual */}
                <div className="glass-panel rounded-[40px] h-[200px] relative overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faeaa6?q=80&w=800"
                    alt="Atmosphere"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-[6s]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#021a0f] via-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="w-8 h-1 bg-[#10b981] rounded-full mb-3" />
                    <p className="text-xs text-emerald-100/40 italic leading-relaxed">
                      "Excelência é fazer coisas comuns de maneira incomum."
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            VIDEO SHOWCASE: OPTIMIZED SPATIAL
        ══════════════════════════════════════════════════ */}
        <section className="px-4 py-20 border-t border-white/5 bg-gradient-to-b from-transparent to-[#042f1c]/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-reveal-up">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#10b981]/20 bg-[#10b981]/5 text-[#10b981] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                Live Demo
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-display text-white mb-4">
                Assista & <span className="text-[#10b981]">Descubra</span>
              </h2>
              <p className="text-base text-emerald-100/40 max-w-xl mx-auto font-medium">
                Veja a facilidade de gerenciar suas demandas e propostas em tempo real.
                Design pensado para máxima produtividade.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {[
                { src: '/videos/video1.mp4', title: 'Publicação Inteligente', desc: 'Como descrever sua demanda para os melhores especialistas.' },
                { src: '/videos/video2.mp4', title: 'Gestão de Propostas', desc: 'Compare, negocie e contrate em poucos cliques.' },
              ].map((vid, i) => (
                <div
                  key={vid.src}
                  className={`glass-panel rounded-[40px] overflow-hidden group border-white/10 hover:border-[#10b981]/30 transition-all opacity-0 animate-[reveal-up_1s_forwards]`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <div className="relative aspect-video sm:aspect-[18/9] bg-black overflow-hidden">
                    <video
                      src={vid.src}
                      controls
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-8 border-t border-white/5 bg-[#042f1c]/40">
                    <h3 className="text-xl font-black text-white group-hover:text-[#10b981] transition-colors mb-2">{vid.title}</h3>
                    <p className="text-sm text-emerald-100/30 font-medium leading-relaxed">{vid.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
