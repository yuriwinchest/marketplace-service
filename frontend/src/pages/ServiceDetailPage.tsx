
import { useState } from 'react'
import type { Service, View, AuthState } from '../types'
import { formatCurrency, statusClass, statusLabel, formatTimeAgo, formatLocation, urgencyClass, urgencyLabel } from '../utils/formatters'
import { useProposal } from '../hooks/useProposal'
import { useServiceStats } from '../hooks/useServiceStats'
import { ProposalForm } from '../components/ProposalForm'
import { ServiceStats } from '../components/ServiceStats'

interface ServiceDetailPageProps {
    service: Service
    auth: Extract<AuthState, { state: 'authenticated' }> | { state: 'anonymous' }
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
    setView: (view: View) => void
}

export function ServiceDetailPage({ service, auth, apiFetch, setView }: ServiceDetailPageProps) {
    const [showProposalForm, setShowProposalForm] = useState(false)

    const isProfessional = auth.state === 'authenticated' && auth.user.role === 'professional'

    const {
        proposal,
        updateProposal,
        submitProposal,
        sending,
        financials
    } = useProposal({
        serviceId: service.id,
        apiFetch,
        onSuccess: () => {
            alert('Proposta enviada com sucesso!')
            setShowProposalForm(false)
            setView('proposals')
        },
        onError: (msg) => alert(msg)
    })

    const stats = useServiceStats(service.id, auth.state === 'authenticated', apiFetch)

    return (
        <div className="serviceDetailPage">
            <div style={{ marginBottom: '1rem' }}>
                <button
                    className="btnSecondary"
                    onClick={() => setView('services')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    ← Voltar para lista
                </button>
            </div>

            <div className="serviceDetailHeader">
                <div className="serviceDetailTitle">
                    <h1>{service.title}</h1>
                    <span className={`badge ${statusClass(service.status)}`}>
                        {statusLabel(service.status)}
                    </span>
                </div>
                <div className="serviceDetailMeta">
                    <span>Publicado {formatTimeAgo(service.created_at)}</span>
                    <span className="separator">•</span>
                    <span>{formatLocation(service)}</span>
                </div>
            </div>

            <div className="serviceDetailContent">
                <div className="serviceMainCol">
                    <div className="card">
                        <h2>Descrição do Projeto</h2>
                        <div className="serviceDescription">
                            {service.description || 'Sem descrição detalhada.'}
                        </div>
                    </div>

                    {showProposalForm && isProfessional && (
                        <ProposalForm
                            proposal={proposal}
                            updateProposal={updateProposal}
                            submitProposal={submitProposal}
                            sending={sending}
                            financials={financials}
                            onCancel={() => setShowProposalForm(false)}
                        />
                    )}
                </div>

                <div className="serviceSideCol">
                    <div className="card">
                        <div className="budgetBox">
                            <span className="label">Orçamento estimado</span>
                            <div className="value">
                                {service.budget_min && service.budget_max
                                    ? `${formatCurrency(service.budget_min)} - ${formatCurrency(service.budget_max)}`
                                    : 'A combinar'}
                            </div>
                        </div>
                        <div className="detailList">
                            <div className="detailRow">
                                <span className="label">Categoria</span>
                                <span className="value">{service.category_name || 'Geral'}</span>
                            </div>
                            <div className="detailRow">
                                <span className="label">Urgência</span>
                                <span className={`badge ${urgencyClass(service.urgency)}`}>
                                    {urgencyLabel(service.urgency)}
                                </span>
                            </div>
                        </div>

                        {/* Proposal Stats Section */}
                        {isProfessional && <ServiceStats stats={stats} />}

                        {isProfessional && !showProposalForm && service.status === 'open' && (
                            <button
                                className="btnPrimary btnFull"
                                onClick={() => setShowProposalForm(true)}
                                style={{ marginTop: '1rem' }}
                            >
                                Enviar Proposta
                            </button>
                        )}

                        {!isProfessional && service.status === 'open' && (
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                {auth.state === 'authenticated' ? (
                                    <p className="text-sm text-gray-500">Apenas profissionais podem enviar propostas.</p>
                                ) : (
                                    <button
                                        className="btnPrimary btnFull"
                                        onClick={() => setView('login')}
                                    >
                                        Fazer Login para Candidatar
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
