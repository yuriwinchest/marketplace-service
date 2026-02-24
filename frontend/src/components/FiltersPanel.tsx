
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
        <div className="filtersPanel p-8 space-y-8">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Refinar Busca</h3>
                <span className="text-emerald-500 text-lg">⚖️</span>
            </div>

            <div className="space-y-6">
                {!fixedCategory && (
                    <div className="filterGroup space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoria Principal</label>
                        <select
                            className="w-full bg-forest-900 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none cursor-pointer"
                            value={filters.category}
                            onChange={e => updateFilter('category', e.target.value)}
                        >
                            <option value="">Todas as Categorias</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {fixedCategory && activeCategoryName && (
                    <div className="filterGroup space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoria Selecionada</label>
                        <div className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-4 py-3.5 text-emerald-400 font-bold flex items-center gap-3">
                            <span className="text-lg">🏷️</span> {activeCategoryName}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="filterGroup space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Estado</label>
                        <select
                            className="w-full bg-forest-900 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none cursor-pointer"
                            value={filters.uf}
                            onChange={e => updateFilter('uf', e.target.value)}
                        >
                            <option value="">Brasil</option>
                            {states.map(state => (
                                <option key={state.id} value={state.sigla}>{state.sigla}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filterGroup space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cidade</label>
                        <select
                            className="w-full bg-forest-900 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
                </div>

                <div className="filterGroup space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Prioridade</label>
                    <select
                        className="w-full bg-forest-900 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none cursor-pointer"
                        value={filters.urgency}
                        onChange={e => updateFilter('urgency', e.target.value)}
                    >
                        <option value="">Qualquer Urgência</option>
                        <option value="low">Baixa - Flexível</option>
                        <option value="medium">Média - Padrão</option>
                        <option value="high">Alta - Imediato</option>
                    </select>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Faixa de Orçamento (R$)</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            placeholder="Mín."
                            className="w-full bg-forest-900 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-gray-600"
                            value={filters.budgetMin}
                            onChange={e => updateFilter('budgetMin', e.target.value)}
                        />
                        <span className="text-gray-700 font-bold">-</span>
                        <input
                            type="number"
                            placeholder="Máx."
                            className="w-full bg-forest-900 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-gray-600"
                            value={filters.budgetMax}
                            onChange={e => updateFilter('budgetMax', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <button
                className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/5 active:scale-95"
                onClick={clearFilters}
            >
                Limpar Todos os Filtros
            </button>
        </div>
    )
}
