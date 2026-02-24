import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import { categoryIcons } from '../data/categoryIcons'

const CATEGORIES_PER_PAGE = 12

export function LandingPage() {
  const navigate = useNavigate()
  const { data: categories = [] } = useCategories()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const videoRef1 = useRef<HTMLVideoElement>(null)
  const videoRef2 = useRef<HTMLVideoElement>(null)

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase()
    return t ? categories.filter(c => c.name.toLowerCase().includes(t)) : categories
  }, [categories, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / CATEGORIES_PER_PAGE))
  const cur = Math.min(page, totalPages)
  const visible = useMemo(() => filtered.slice((cur - 1) * CATEGORIES_PER_PAGE, cur * CATEGORIES_PER_PAGE), [filtered, cur])

  useEffect(() => { setPage(1) }, [search])

  return (
    <div style={{ backgroundColor: '#071a0f', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>

      {/* ═══════════════════════════════════
          HERO
      ═══════════════════════════════════ */}
      <div style={{ padding: '24px 16px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{
            backgroundColor: '#0d2518',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            minHeight: 300,
            position: 'relative',
          }}>
            {/* Glow */}
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 300, height: 300,
              background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Left text */}
            <div style={{ flex: 1, padding: '40px 40px 40px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(16,185,129,0.8)' }}>
                  Marketplace de Serviços
                </span>
              </div>

              <div>
                <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, color: '#fff', marginBottom: 4 }}>
                  Contrate com clareza.
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, color: '#10b981' }}>
                  Feche negócio sem enrolação.
                </div>
              </div>

              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 340, margin: 0 }}>
                Publique sua demanda gratuitamente e receba propostas de freelancers qualificadas.
              </p>

              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                Pague com segurança{' '}
                <span style={{ margin: '0 6px', color: 'rgba(255,255,255,0.2)' }}>–</span>
                <button
                  onClick={() => navigate('/servicos-publicos')}
                  style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0 }}
                >
                  Ver Oportunidades
                </button>
              </p>

              <div style={{ marginTop: 4 }}>
                <button
                  onClick={() => navigate('/cadastrar')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    backgroundColor: '#10b981', color: '#021a0f',
                    border: 'none', borderRadius: 12,
                    padding: '12px 24px', fontSize: 14, fontWeight: 900,
                    cursor: 'pointer', boxShadow: '0 8px 24px rgba(16,185,129,0.25)',
                  }}
                >
                  Publicar Demanda <span style={{ fontSize: 16 }}>›</span>
                </button>
              </div>
            </div>

            {/* Right image */}
            <div style={{ width: 380, flexShrink: 0, position: 'relative', display: 'flex' }} className="hidden lg:flex">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.45, mixBlendMode: 'luminosity' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0d2518 0%, transparent 40%, #0d2518 100%)' }} />
              {/* Badge top */}
              <div style={{
                position: 'absolute', top: 24, left: 24,
                backgroundColor: 'rgba(2,26,15,0.85)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '6px 14px', backdropFilter: 'blur(12px)',
              }}>
                <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#10b981' }}>Atendimento Rápido</span>
              </div>
              {/* Badge bottom */}
              <div style={{
                position: 'absolute', bottom: 24, right: 24,
                backgroundColor: '#10b981', color: '#021a0f',
                borderRadius: 999, padding: '6px 16px',
                fontSize: 10, fontWeight: 900, letterSpacing: '0.1em',
                boxShadow: '0 8px 20px rgba(16,185,129,0.3)',
              }}>
                ✅ Negócio Fechado
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
          CATEGORIES + SIDEBAR
      ═══════════════════════════════════ */}
      <div style={{ padding: '0 16px 48px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* LEFT: Categories */}
          <div style={{ flex: '1 1 540px', minWidth: 0 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>
              Encontre o Profissional Certo
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>
              Busque e encontre freelancers para qualquer tipo de serviço.
            </p>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}
                xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="O que você precisa?"
                style={{
                  width: '100%', height: 44, boxSizing: 'border-box',
                  backgroundColor: 'rgba(13,37,24,0.8)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 999, paddingLeft: 40, paddingRight: 20,
                  fontSize: 14, color: '#fff', outline: 'none',
                }}
              />
            </div>

            {/* Grid */}
            {visible.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {visible.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => navigate('/servicos-publicos', { state: { categoryId: cat.id, fixedCategory: true } })}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      padding: '16px 8px', backgroundColor: '#0d2518',
                      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16,185,129,0.4)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      backgroundColor: 'rgba(6,67,40,0.6)', border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22,
                    }}>
                      {categoryIcons[cat.name] || '🔧'}
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
                      letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)',
                      textAlign: 'center', lineHeight: 1.3,
                    }}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                Nenhuma categoria encontrada
              </div>
            )}

            {/* Footer da seção */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20 }}>
              {totalPages > 1 && (
                <>
                  <button
                    disabled={cur === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'transparent',
                      color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14,
                      opacity: cur === 1 ? 0.3 : 1,
                    }}
                  >←</button>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{cur}/{totalPages}</span>
                  <button
                    disabled={cur === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'transparent',
                      color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14,
                      opacity: cur === totalPages ? 0.3 : 1,
                    }}
                  >→</button>
                </>
              )}
              <button
                onClick={() => navigate('/servicos-publicos')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 24px', borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'transparent',
                  color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Ver Todas as Categorias <span style={{ color: '#10b981' }}>›</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Como Funciona */}
          <div style={{ width: 240, flexShrink: 0 }}>
            <div style={{
              backgroundColor: 'rgba(13,37,24,0.6)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '24px 20px',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: '0 0 20px' }}>Como Funciona</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Publique sua demanda.',
                  'Receba propostas e negocie.',
                  'Contrate com segurança.',
                  'Serviço finalizado e avaliado.',
                ].map((step, i) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 24, height: 24, flexShrink: 0, borderRadius: '50%',
                      backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 900, color: '#10b981',
                    }}>{i + 1}</div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600, margin: '2px 0 0', lineHeight: 1.4 }}>{step}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/cadastrar')}
                style={{
                  width: '100%', marginTop: 20, padding: '10px 0',
                  borderRadius: 12, border: 'none',
                  backgroundColor: '#10b981', color: '#021a0f',
                  fontSize: 12, fontWeight: 900, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                Saiba Mais <span>›</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════
          VÍDEOS
      ═══════════════════════════════════ */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 16px 64px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(16,185,129,0.7)' }}>Em Ação</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>
              Veja Como Funciona
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Conheça a plataforma em funcionamento real.
            </p>
          </div>

          {/* Video grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              { src: '/videos/video1.mp4', title: 'Publicando uma Demanda', ref: videoRef1 },
              { src: '/videos/video2.mp4', title: 'Recebendo e Aceitando Propostas', ref: videoRef2 },
            ].map((vid) => (
              <div
                key={vid.src}
                style={{
                  backgroundColor: '#0d2518',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20,
                  overflow: 'hidden',
                }}
              >
                <video
                  ref={vid.ref}
                  src={vid.src}
                  controls
                  playsInline
                  preload="metadata"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    maxHeight: 400,
                    backgroundColor: '#000',
                  }}
                />
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                    {vid.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
