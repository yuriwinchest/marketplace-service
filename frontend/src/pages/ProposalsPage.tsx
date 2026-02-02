
import { useEffect, useState } from 'react'
import type { AuthState, Proposal } from '../types'
import { formatCurrency, formatDate, statusClass, statusLabel } from '../utils/formatters'

interface ProposalsPageProps {
    auth: Extract<AuthState, { state: 'authenticated' }>
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
}

export function ProposalsPage({ apiFetch }: ProposalsPageProps) {
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadProposals()
    }, [])

    const loadProposals = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await apiFetch('/api/proposals/me', { method: 'GET' })
            if (res.ok) {
                const data = await res.json()
                setProposals(data.proposals || [])
            } else {
                setError('Erro ao carregar propostas')
            }
        } catch (err) {
            setError('Erro de conexão ao carregar propostas')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (proposalId: string) => {
        if (!confirm('Tem certeza que deseja cancelar esta proposta?')) return

        try {
            const res = await apiFetch(`/api/proposals/${proposalId}/cancel`, { method: 'POST' })
            if (res.ok) {
                alert('Proposta cancelada')
                loadProposals()
            } else {
                const data = await res.json()
                alert(data.error || 'Erro ao cancelar proposta')
            }
        } catch (err) {
            alert('Erro de conexão')
        }
    }

    return (
        <div className="servicesPage"> {/* Reusing servicesPage layout for now */}
            <div className="pageHeader">
                <div>
                    <h1>Minhas Propostas</h1>
                    <p>Gerencie as propostas enviadas e recebidas</p>
                </div>
                <button className="btnSecondary" onClick={loadProposals}>
                    Atualizar
                </button>
            </div>

            <div className="servicesLayout" style={{ display: 'block' }}> {/* Full width */}
                {loading ? (
                    <div className="loading">Carregando propostas...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : proposals.length === 0 ? (
                    <div className="emptyState">
                        <div className="emptyIcon">📨</div>
                        <h3>Nenhuma proposta encontrada</h3>
                        <p>Você ainda não enviou nenhuma proposta.</p>
                    </div>
                ) : (
                    <div className="servicesList">
                        {proposals.map(proposal => (
                            <div key={proposal.id} className="serviceCard" style={{ cursor: 'default' }}>
                                <div className="serviceCardHeader">
                                    <div className="serviceClient">
                                        <div className="clientAvatar">P</div>
                                        <div>
                                            <div className="clientName">{proposal.service_request_title || 'Demanda'}</div>
                                            <div className="serviceTime">Enviada em {formatDate(proposal.created_at)}</div>
                                        </div>
                                    </div>
                                    <span className={`badge ${statusClass(proposal.status)}`}>
                                        {statusLabel(proposal.status)}
                                    </span>
                                </div>

                                <div className="serviceCardBody" style={{ marginTop: '1rem' }}>
                                    <p><strong>Valor:</strong> {formatCurrency(proposal.value)}</p>
                                    <p><strong>Prazo:</strong> {proposal.estimated_days} dias</p>
                                    <p className="serviceCardDesc" style={{ marginTop: '0.5rem' }}>
                                        {proposal.description}
                                    </p>
                                </div>

                                <div className="serviceCardFooter" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    {proposal.status === 'pending' && (
                                        <button
                                            className="btnSecondary"
                                            style={{ color: '#ef4444', borderColor: '#ef4444' }}
                                            onClick={() => handleCancel(proposal.id)}
                                        >
                                            Cancelar Proposta
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
