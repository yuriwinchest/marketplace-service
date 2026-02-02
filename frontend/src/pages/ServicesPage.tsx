import { useState, useMemo } from 'react'
import type { Service, Category, Region } from '../types'
import { formatCurrency, formatTimeAgo, formatLocation, urgencyClass, urgencyLabel } from '../utils/formatters'

interface ServicesPageProps {
    services: Service[]
    categories: Category[]
    regions: Region[]
    loading: boolean
    onRefresh: () => void
    openServiceDetail: (id: string) => void
}

export function ServicesPage({ services, categories, regions, loading, onRefresh, openServiceDetail, initialCategory, fixedCategory, onBack }: ServicesPageProps & { initialCategory?: string, fixedCategory?: boolean, onBack?: () => void }) {
    const [filters, setFilters] = useState({
        category: fixedCategory ? (initialCategory || '') : '', // Only lock category if fixedCategory is true
        uf: '',
        city: '',
        budgetMin: '',
        budgetMax: '',
        urgency: '',
    })

    const [states, setStates] = useState<{ id: number; sigla: string; nome: string }[]>([])
    const [cities, setCities] = useState<{ id: number; nome: string }[]>([])

    // Load states
    useState(() => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(res => res.json())
            .then(data => setStates(data))
            .catch(err => console.error('Failed to fetch states', err))
    })

    // Load cities when UF changes
    useMemo(() => {
        if (!filters.uf) {
            setCities([])
            return
        }
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${filters.uf}/municipios?orderBy=nome`)
            .then(res => res.json())
            .then(data => setCities(data))
            .catch(err => console.error('Failed to fetch cities', err))
    }, [filters.uf])


    const activeCategoryName = categories.find(c => c.id === filters.category)?.name

    const filteredServices = useMemo(() => {
        return services.filter(s => {
            if (filters.category && s.category_id !== filters.category) return false
            if (filters.uf && s.uf !== filters.uf) return false
            if (filters.city && s.city !== filters.city) return false
            if (filters.urgency && s.urgency !== filters.urgency) return false
            if (filters.budgetMin && (s.budget_max || 0) < Number(filters.budgetMin)) return false
            if (filters.budgetMax && (s.budget_min || 0) > Number(filters.budgetMax)) return false
            return true
        })
    }, [services, filters])

    return (
        <div className="servicesPage">
            {onBack && (
                <div style={{ marginBottom: '1rem' }}>
                    <button
                        className="btnSecondary"
                        onClick={onBack}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        ← Voltar
                    </button>
                </div>
            )}
            <div className="pageHeader">
                <div>
                    <h1>{fixedCategory && activeCategoryName ? `Serviços de ${activeCategoryName}` : 'Serviços Disponíveis'}</h1>
                    <p>Encontre projetos que combinam com suas habilidades</p>
                </div>
                <button className="btnSecondary" onClick={onRefresh}>
                    Atualizar Lista
                </button>
            </div>

            <div className="servicesLayout">
                <aside className="filtersPanel">
                    <h3>Filtros</h3>
                    {!fixedCategory && (
                        <div className="filterGroup">
                            <label>Categoria</label>
                            <select
                                value={filters.category}
                                onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                            >
                                <option value="">Todas</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {fixedCategory && activeCategoryName && (
                        <div className="filterGroup">
                            <label>Categoria</label>
                            <div style={{
                                padding: '0.75rem',
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                color: 'var(--text-muted)',
                                fontWeight: 500
                            }}>
                                {activeCategoryName}
                            </div>
                        </div>
                    )}

                    <div className="filterGroup">
                        <label>Estado (UF)</label>
                        <select
                            value={filters.uf}
                            onChange={e => setFilters(f => ({ ...f, uf: e.target.value, city: '' }))}
                        >
                            <option value="">Todos</option>
                            {states.map(state => (
                                <option key={state.id} value={state.sigla}>{state.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filterGroup">
                        <label>Cidade</label>
                        <select
                            value={filters.city}
                            onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
                            disabled={!filters.uf}
                        >
                            <option value="">Todas</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.nome}>{city.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filterGroup">
                        <label>Urgencia</label>
                        <select
                            value={filters.urgency}
                            onChange={e => setFilters(f => ({ ...f, urgency: e.target.value }))}
                        >
                            <option value="">Todas</option>
                            <option value="low">Baixa</option>
                            <option value="medium">Media</option>
                            <option value="high">Urgente</option>
                        </select>
                    </div>
                    <div className="filterGroup">
                        <label>Orcamento minimo</label>
                        <input
                            type="number"
                            placeholder="R$ 0"
                            value={filters.budgetMin}
                            onChange={e => setFilters(f => ({ ...f, budgetMin: e.target.value }))}
                        />
                    </div>
                    <div className="filterGroup">
                        <label>Orcamento maximo</label>
                        <input
                            type="number"
                            placeholder="R$ 10000"
                            value={filters.budgetMax}
                            onChange={e => setFilters(f => ({ ...f, budgetMax: e.target.value }))}
                        />
                    </div>
                    <button
                        className="btnSecondary btnFull"
                        onClick={() => setFilters({
                            category: fixedCategory ? (initialCategory || '') : '',
                            uf: '',
                            city: '',
                            budgetMin: '',
                            budgetMax: '',
                            urgency: ''
                        })}
                    >
                        Limpar filtros
                    </button>
                </aside>

                <div className="servicesResults">
                    <div className="resultsHeader">
                        <span>{filteredServices.length} servicos encontrados</span>
                    </div>
                    {loading ? (
                        <div className="loading">Carregando...</div>
                    ) : filteredServices.length === 0 ? (
                        <div className="emptyState">
                            <div className="emptyIcon">🔍</div>
                            <h3>Nenhum servico encontrado</h3>
                            <p>Tente ajustar os filtros ou volte mais tarde</p>
                        </div>
                    ) : (
                        <div className="servicesList">
                            {filteredServices.map(service => (
                                <div
                                    key={service.id}
                                    className={`serviceCard ${service.urgency === 'high' ? 'highlightedCard' : ''}`}
                                    onClick={() => openServiceDetail(service.id)}
                                >
                                    {service.urgency === 'high' && (
                                        <div className="highlightBadge">
                                            <span className="icon">⚡</span> Destaque
                                        </div>
                                    )}
                                    <div className="serviceCardHeader">
                                        <div className="serviceClient">
                                            <div className="clientAvatar">C</div>
                                            <div>
                                                <div className="clientName">Cliente</div>
                                                <div className="serviceTime">{formatTimeAgo(service.created_at)}</div>
                                            </div>
                                        </div>
                                        {/* Hide urgency badge if already highlighted to avoid redundancy, or keep for clarity */}
                                        <span className={`badge ${urgencyClass(service.urgency)}`}>
                                            {urgencyLabel(service.urgency)}
                                        </span>
                                    </div>
                                    <h3 className="serviceCardTitle">{service.title}</h3>
                                    <p className="serviceCardDesc">
                                        {service.description?.slice(0, 150) || 'Sem descricao'}
                                        {service.description && service.description.length > 150 ? '...' : ''}
                                    </p>
                                    <div className="serviceCardFooter">
                                        <div className="serviceCardTags">
                                            <span className="tag">{service.category_name || 'Geral'}</span>
                                            <span className="tag">{formatLocation(service)}</span>
                                        </div>
                                        <div className="serviceCardBudget">
                                            {service.budget_min && service.budget_max
                                                ? `${formatCurrency(service.budget_min)} - ${formatCurrency(service.budget_max)}`
                                                : 'A combinar'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
