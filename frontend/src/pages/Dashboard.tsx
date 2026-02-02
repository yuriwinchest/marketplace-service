
import type { AuthState, Service, Category, Region, View } from '../types'
import { DashboardHeader } from '../components/DashboardHeader'
import { DashboardStats } from '../components/DashboardStats'
import { DashboardSidebar } from '../components/DashboardSidebar'
import { ServiceListItem } from '../components/ServiceListItem'

interface DashboardProps {
    auth: Extract<AuthState, { state: 'authenticated' }>
    services: Service[]
    myServices: Service[]
    categories: Category[]
    regions: Region[]
    setView: (view: View) => void
    loadServices: () => void
    loadMyServices: () => void
    loadProfile: () => void
    openServiceDetail: (id: string) => void
    apiBaseUrl: string
}

export function Dashboard({
    auth, services, myServices, categories, regions,
    setView, loadServices, loadMyServices, loadProfile, openServiceDetail, apiBaseUrl
}: DashboardProps) {

    const getUserName = () => {
        if (auth.state !== 'authenticated') return ''
        return auth.user.name || auth.user.email.split('@')[0]
    }

    const currentServices = auth.user.role === 'client' ? myServices : services

    return (
        <div className="dashboard">
            <DashboardHeader
                auth={auth}
                setView={setView}
                getUserName={getUserName}
            />

            <div className="dashboardGrid">
                <DashboardStats
                    auth={auth}
                    services={services}
                    myServices={myServices}
                    categories={categories}
                    regions={regions}
                />

                <div className="dashboardContent">
                    <div className="dashboardMain">
                        <div className="card">
                            <div className="cardHeader">
                                <h2>{auth.user.role === 'client' ? 'Meus Servicos' : 'Servicos Disponiveis'}</h2>
                                <button
                                    className="btnText"
                                    onClick={() => {
                                        if (auth.user.role === 'client') {
                                            loadMyServices()
                                        } else {
                                            loadServices()
                                        }
                                    }}
                                >
                                    Atualizar
                                </button>
                            </div>
                            {currentServices.length === 0 ? (
                                <div className="emptyState">
                                    <div className="emptyIcon">📭</div>
                                    <h3>Nenhum servico encontrado</h3>
                                    <p>{auth.user.role === 'client'
                                        ? 'Publique seu primeiro servico para encontrar profissionais'
                                        : 'Nenhum servico disponivel no momento'}
                                    </p>
                                    {auth.user.role === 'client' && (
                                        <button className="btnPrimary" onClick={() => setView('create-service')}>
                                            Publicar Servico
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="servicesList">
                                    {currentServices.slice(0, 10).map(service => (
                                        <ServiceListItem
                                            key={service.id}
                                            service={service}
                                            onClick={openServiceDetail}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DashboardSidebar
                        auth={auth}
                        regions={regions}
                        loadProfile={loadProfile}
                        setView={setView}
                        apiBaseUrl={apiBaseUrl}
                        getUserName={getUserName}
                    />
                </div>
            </div>
        </div>
    )
}
