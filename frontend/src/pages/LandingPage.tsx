import { useState } from 'react'
import type { View, Category, Region } from '../types'
import { categoryIcons } from '../data/categoryIcons'

interface LandingPageProps {
    setView: (view: View) => void
    categories: Category[]
    regions: Region[]
}

export function LandingPage({ setView, categories, regions }: LandingPageProps) {
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

            {categories.length > 0 && (
                <section className="categoriesSection">
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

                    <h2 className="sectionTitle">Categorias disponiveis</h2>
                    <div className="categoriesGrid">
                        {filteredCategories.map(cat => (
                            <div key={cat.id} className="categoryCard" onClick={() => setView('register')}>
                                <span className="categoryIcon">{categoryIcons[cat.name] || '🔨'}</span>
                                <span className="categoryName">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="howSection">
                <h2 className="sectionTitle">Como funciona</h2>
                <div className="stepsGrid">
                    <div className="stepCard">
                        <div className="stepNum">1</div>
                        <h3>Publique seu projeto</h3>
                        <p>Descreva o que precisa, defina orcamento e prazo.</p>
                    </div>
                    <div className="stepCard">
                        <div className="stepNum">2</div>
                        <h3>Receba propostas</h3>
                        <p>Freelancers qualificados enviarao orcamentos.</p>
                    </div>
                    <div className="stepCard">
                        <div className="stepNum">3</div>
                        <h3>Contrate e pague</h3>
                        <p>Escolha o melhor e realize o pagamento com seguranca.</p>
                    </div>
                </div>
            </section>
        </div>
    )
}
