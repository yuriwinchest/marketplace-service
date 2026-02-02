
import type { Service, View } from '../types'
import { MyServiceListItem } from '../components/MyServiceListItem'

interface MyServicesPageProps {
    myServices: Service[]
    setView: (view: View) => void
    openServiceDetail: (id: string) => void
}

export function MyServicesPage({ myServices, setView, openServiceDetail }: MyServicesPageProps) {
    return (
        <div className="myServicesPage">
            <div className="pageHeader">
                <h1>Meus Servicos Publicados</h1>
                <button className="btnPrimary" onClick={() => setView('create-service')}>
                    + Novo Servico
                </button>
            </div>

            {myServices.length === 0 ? (
                <div className="emptyState">
                    <div className="emptyIcon">📝</div>
                    <h3>Nenhum servico publicado</h3>
                    <p>Voce ainda nao publicou nenhum servico.</p>
                    <button className="btnPrimary" onClick={() => setView('create-service')}>
                        Publicar Agora
                    </button>
                </div>
            ) : (
                <div className="myServicesList">
                    {myServices.map(service => (
                        <MyServiceListItem
                            key={service.id}
                            service={service}
                            onClick={openServiceDetail}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
