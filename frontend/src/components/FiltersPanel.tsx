
import type { Category } from '../types'

interface Filters {
    category: string
    uf: string
    city: string
    budgetMin: string
    budgetMax: string
    urgency: string
}

interface FiltersPanelProps {
    filters: Filters
    updateFilter: (key: keyof Filters, value: string) => void
    clearFilters: () => void
    categories: Category[]
    states: { id: number; sigla: string; nome: string }[]
    cities: { id: number; nome: string }[]
    fixedCategory?: boolean
    activeCategoryName?: string | null
}

export function FiltersPanel({
    filters,
    updateFilter,
    clearFilters,
    categories,
    states,
    cities,
    fixedCategory,
    activeCategoryName
}: FiltersPanelProps) {
    return (
        <aside className="filtersPanel">
            <h3>Filtros</h3>
            {!fixedCategory && (
                <div className="filterGroup">
                    <label>Categoria</label>
                    <select
                        value={filters.category}
                        onChange={e => updateFilter('category', e.target.value)}
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
                    onChange={e => updateFilter('uf', e.target.value)}
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
                    onChange={e => updateFilter('city', e.target.value)}
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
                    onChange={e => updateFilter('urgency', e.target.value)}
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
                    onChange={e => updateFilter('budgetMin', e.target.value)}
                />
            </div>
            <div className="filterGroup">
                <label>Orcamento maximo</label>
                <input
                    type="number"
                    placeholder="R$ 10000"
                    value={filters.budgetMax}
                    onChange={e => updateFilter('budgetMax', e.target.value)}
                />
            </div>
            <button
                className="btnSecondary btnFull"
                onClick={clearFilters}
            >
                Limpar filtros
            </button>
        </aside>
    )
}
