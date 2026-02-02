
import type { Service } from '../types'
import { formatCurrency, formatTimeAgo, formatLocation, urgencyClass, urgencyLabel } from '../utils/formatters'

interface ServiceCardProps {
    service: Service
    onClick: (id: string) => void
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
    return (
        <div
            className={`serviceCard ${service.urgency === 'high' ? 'highlightedCard' : ''}`}
            onClick={() => onClick(service.id)}
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
    )
}
