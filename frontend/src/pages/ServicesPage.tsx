
import type { Service, Category, Region } from '../types'
import { useServiceFilters } from '../hooks/useServiceFilters'
import { FiltersPanel } from '../components/FiltersPanel'
import { ServiceCard } from '../components/ServiceCard'

interface ServicesPageProps {
    services: Service[]
    categories: Category[]
    regions: Region[]
    loading: boolean
    onRefresh: () => void
    openServiceDetail: (id: string) => void
    initialCategory?: string
    fixedCategory?: boolean
    onBack?: () => void
}

export function ServicesPage({
    services,
    categories,
    regions,
    loading,
    onRefresh,
    openServiceDetail,
    initialCategory,
    fixedCategory,
    onBack
}: ServicesPageProps) {

    const {
        filters,
        updateFilter,
        clearFilters,
        states,
        cities,
        filteredServices
    } = useServiceFilters(services, initialCategory, fixedCategory)

    const activeCategoryName = categories.find(c => c.id === filters.category)?.name

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
                <FiltersPanel
                    filters={filters}
                    updateFilter={updateFilter}
                    clearFilters={clearFilters}
                    categories={categories}
                    states={states}
                    cities={cities}
                    fixedCategory={fixedCategory}
                    activeCategoryName={activeCategoryName}
                />

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
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    onClick={openServiceDetail}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
