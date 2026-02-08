import type { Service } from '../types'
import { formatCurrency, formatTimeAgo, formatLocation, urgencyClass, urgencyLabel } from '../utils/formatters'
import './ServiceCard.css'

interface ServiceCardProps {
    service: Service
    onClick: (id: string) => void
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
    const isHighUrgency = service.urgency === 'high'

    return (
        <div
            className={`service-card ${isHighUrgency ? 'service-card-highlighted' : ''}`}
            onClick={() => onClick(service.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick(service.id)
                }
            }}
        >
            {isHighUrgency && (
                <div className="service-card-toprow" aria-label="Destaque">
                    <div className="service-card-highlight-badge">
                        <span className="service-card-highlight-icon">⚡</span>
                        <span>Destaque</span>
                    </div>
                </div>
            )}

            <div className="service-card-header">
                <div className="service-card-client">
                    <div className="service-card-avatar" aria-label="Avatar do cliente">
                        C
                    </div>
                    <div className="service-card-client-info">
                        <div className="service-card-client-name">Cliente</div>
                        <div className="service-card-time">{formatTimeAgo(service.created_at)}</div>
                    </div>
                </div>
                <span className={`badge ${urgencyClass(service.urgency)}`}>
                    {urgencyLabel(service.urgency)}
                </span>
            </div>

            <h3 className="service-card-title">{service.title}</h3>

            <p className="service-card-description">
                {service.description?.slice(0, 150) || 'Sem descrição'}
                {service.description && service.description.length > 150 ? '...' : ''}
            </p>

            <div className="service-card-footer">
                <div className="service-card-tags">
                    <span className="service-card-tag">
                        {service.category_name || 'Geral'}
                    </span>
                    <span className="service-card-tag">
                        {formatLocation(service)}
                    </span>
                </div>
                <div className="service-card-budget">
                    {service.budget_min && service.budget_max
                        ? `${formatCurrency(service.budget_min)} - ${formatCurrency(service.budget_max)}`
                        : 'A combinar'}
                </div>
            </div>
        </div>
    )
}
