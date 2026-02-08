import { useState } from 'react'
import type { View, Category, Region } from '../types'
import { categoryIcons } from '../data/categoryIcons'

interface LandingPageProps {
    setView: (view: View) => void
    categories: Category[]
    regions: Region[]
    setSelectedCategoryId: (id: string | null) => void
    publicDataLoading: boolean
    publicDataError: string
}

export function LandingPage({ setView, categories, regions, setSelectedCategoryId, publicDataLoading, publicDataError }: LandingPageProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="landingPage">
            <div className="constructionBanner" role="alert" aria-live="polite">
                Aviso: o sistema está em construção. Algumas funcionalidades podem falhar.
            </div>
            <section className="heroSection">
                <div className="heroGlow heroGlowOne" aria-hidden="true" />
                <div className="heroGlow heroGlowTwo" aria-hidden="true" />

                <div className="heroContent">
                    <div className="heroPill">Marketplace de servicos para todo o Brasil</div>
                    <h1 className="heroTitle">
                        Conecte-se com os<br />
                        <span className="heroHighlight">melhores freelancers</span>
                    </h1>
                    <p className="heroDesc">
                        Publique projetos, receba propostas e contrate profissionais qualificados.
                        Ou ofereca seus servicos e encontre novas oportunidades.
                    </p>
                    <div className="heroBtns">
                        <button className="btnPrimary btnLg" onClick={() => setView('register')}>
                            Comecar agora
                        </button>
                        <button
                            className="btnPrimary btnLg"
                            onClick={() => {
                                setSelectedCategoryId(null)
                                setView('professionals')
                            }}
                        >
                            Profissionais
                        </button>
                        <button
                            className="btnPrimary btnLg"
                            onClick={() => {
                                setSelectedCategoryId(null)
                                setView('public-services')
                            }}
                        >
                            Demandas
                        </button>
                        <button className="btnPrimary btnLg" onClick={() => setView('login')}>
                            Ja tenho conta
                        </button>
                    </div>

                    <div className="heroQuickInfo">
                        <span><strong>{categories.length}</strong> categorias ativas</span>
                        <span><strong>{regions.length}</strong> regioes cobertas</span>
                        <span><strong>100%</strong> gratuito para comecar</span>
                    </div>
                </div>

                <div className="heroStats">
                    <div className="statCard">
                        <div className="heroStatIcon">🧩</div>
                        <div className="statNumber">{categories.length}</div>
                        <div className="statLabel">Categorias prontas</div>
                    </div>
                    <div className="statCard">
                        <div className="heroStatIcon">📍</div>
                        <div className="statNumber">{regions.length}</div>
                        <div className="statLabel">Regioes atendidas</div>
                    </div>
                    <div className="statCard">
                        <div className="heroStatIcon">⚡</div>
                        <div className="statNumber">24h</div>
                        <div className="statLabel">Respostas mais rapidas</div>
                    </div>
                </div>
            </section>

            <section className="categoriesSection">
                <div className="landingSectionHead">
                    <span className="sectionTag">Escolha por especialidade</span>
                    <h2 className="sectionTitle">Categorias disponiveis</h2>
                    <p className="sectionSubtitle">Encontre rapidamente profissionais na area certa para o seu projeto.</p>
                </div>

                {categories.length > 0 && (
                    <div className="categorySearchWrap">
                        <input
                            className="categorySearchInput"
                            type="text"
                            placeholder="Busque por uma categoria..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}

                {publicDataLoading ? (
                    <div className="loading">Carregando categorias...</div>
                ) : publicDataError ? (
                    <div className="emptyState">
                        <div className="emptyIcon">⚠️</div>
                        <h3>Não foi possível carregar as categorias</h3>
                        <p>{publicDataError}</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="emptyState">
                        <div className="emptyIcon">📭</div>
                        <h3>Nenhuma categoria encontrada</h3>
                        <p>Verifique se o backend está rodando e se o banco foi populado.</p>
                    </div>
                ) : (
                    <div className="categoriesGrid">
                        {filteredCategories.map(cat => (
                            <div key={cat.id} className="categoryCard" onClick={() => {
                                setSelectedCategoryId(cat.id)
                                setView('public-services')
                            }}>
                                <span className="categoryIcon">{categoryIcons[cat.name] || '🔨'}</span>
                                <span className="categoryName">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="howSection">
                <div className="landingSectionHead">
                    <span className="sectionTag">Fluxo simples e direto</span>
                    <h2 className="sectionTitle">Como funciona</h2>
                </div>
                <div className="stepsGrid">
                    <div className="stepCard">
                        <div className="stepNum">1</div>
                        <h3>Crie sua Conta</h3>
                        <p>Cadastre-se para acessar profissionais qualificados.</p>
                    </div>
                    <div className="stepCard">
                        <div className="stepNum">2</div>
                        <h3>Publique seu Projeto</h3>
                        <p>Escolha entre publicação normal ou <strong>Destaque</strong> para aparecer no topo e contratar mais rápido.</p>
                    </div>
                    <div className="stepCard">
                        <div className="stepNum">3</div>
                        <h3>Receba Propostas</h3>
                        <p>Freelancers enviarão orçamentos. Compare perfis e avaliações.</p>
                    </div>
                    <div className="stepCard">
                        <div className="stepNum">4</div>
                        <h3>Contrate</h3>
                        <p>Escolha o melhor profissional e combine o serviço.</p>
                    </div>
                </div>
            </section>
        </div>
    )
}
