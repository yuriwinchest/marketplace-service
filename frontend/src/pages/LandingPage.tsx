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
            <section className="heroSection">
                <div className="heroContent">
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
                        <button className="btnSecondary btnLg" onClick={() => setView('login')}>
                            Ja tenho conta
                        </button>
                    </div>
                </div>
                <div className="heroStats">
                    <div className="statCard">
                        <div className="statNumber">{categories.length}</div>
                        <div className="statLabel">Categorias</div>
                    </div>
                    <div className="statCard">
                        <div className="statNumber">{regions.length}</div>
                        <div className="statLabel">Regioes</div>
                    </div>
                    <div className="statCard">
                        <div className="statNumber">100%</div>
                        <div className="statLabel">Gratuito</div>
                    </div>
                </div>
            </section>

            <section className="categoriesSection">
                {categories.length > 0 && (
                    <div style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="🔍 Busque por uma categoria..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.5rem',
                                    fontSize: '1.1rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text)',
                                    outline: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                                }}
                            />
                        </div>
                    </div>
                )}

                <h2 className="sectionTitle">Categorias disponiveis</h2>

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
                <h2 className="sectionTitle">Como funciona</h2>
                <div className="stepsGrid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
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
