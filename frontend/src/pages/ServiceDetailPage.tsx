
import { useState, useEffect } from 'react'
import type { Service, View, AuthState } from '../types'
import { formatCurrency, statusClass, statusLabel, formatTimeAgo, formatLocation, urgencyClass, urgencyLabel } from '../utils/formatters'

interface ServiceDetailPageProps {
    service: Service
    auth: Extract<AuthState, { state: 'authenticated' }> | { state: 'anonymous' }
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
    setView: (view: View) => void
}

export function ServiceDetailPage({ service, auth, apiFetch, setView }: ServiceDetailPageProps) {
    const [sending, setSending] = useState(false)
    const [showProposalForm, setShowProposalForm] = useState(false)
    const [proposal, setProposal] = useState({
        value: '',
        description: '',
        estimatedDays: ''
    })
    const [stats, setStats] = useState<{
        count: number
        average_value: number
        professionals: { name: string; avatar_url: string | null }[]
    } | null>(null)

    // Fetch stats
    useEffect(() => {
        if (auth.state === 'authenticated') {
            apiFetch(`/api/requests/${service.id}/stats`)
                .then(res => res.json())
                .then(data => setStats(data))
                .catch(err => console.error('Failed to fetch stats', err))
        }
    }, [auth.state, service.id, apiFetch])

    const handleSendProposal = async (e: React.FormEvent) => {
        e.preventDefault()
        if (auth.state !== 'authenticated') return

        setSending(true)
        try {
            const res = await apiFetch('/api/proposals', {
                method: 'POST',
                body: JSON.stringify({
                    serviceRequestId: service.id,
                    value: Number(proposal.value),
                    description: proposal.description,
                    estimatedDays: Number(proposal.estimatedDays)
                })
            })

            if (res.ok) {
                alert('Proposta enviada com sucesso!')
                setShowProposalForm(false)
                setView('proposals')
            } else {
                const data = await res.json()
                alert(data.error || 'Erro ao enviar proposta')
            }
        } catch (err) {
            alert('Erro de conexão')
        } finally {
            setSending(false)
        }
    }

    const isProfessional = auth.state === 'authenticated' && auth.user.role === 'professional'

    // Calculations
    const numericValue = Number(proposal.value) || 0
    const platformFee = numericValue * 0.05
    const clientPrice = numericValue + platformFee

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
                        <div className="card" style={{ marginTop: '2rem', border: '2px solid #3b82f6' }}>
                            <h3>Enviar Proposta</h3>
                            <form onSubmit={handleSendProposal}>
                                <div className="formGroup">
                                    <label>Seu Valor (R$)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={proposal.value}
                                        onChange={e => setProposal({ ...proposal, value: e.target.value })}
                                        placeholder="0.00"
                                    />
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Taxa de Serviço (5%):</span>
                                            <span>+ {formatCurrency(platformFee)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '0.25rem', color: '#fff' }}>
                                            <span>Valor Final para o Cliente:</span>
                                            <span>{formatCurrency(clientPrice)}</span>
                                        </div>
                                        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                                            * O cliente visualizará o valor final de {formatCurrency(clientPrice)}.
                                        </p>
                                    </div>
                                </div>
                                <div className="formGroup">
                                    <label>Prazo Estimado (dias)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={proposal.estimatedDays}
                                        onChange={e => setProposal({ ...proposal, estimatedDays: e.target.value })}
                                        placeholder="EX: 5"
                                    />
                                </div>
                                <div className="formGroup">
                                    <label>Descrição da Proposta</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={proposal.description}
                                        onChange={e => setProposal({ ...proposal, description: e.target.value })}
                                        placeholder="Descreva detalhes da sua proposta, o que está incluso, etc."
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btnPrimary" disabled={sending}>
                                        {sending ? 'Enviando...' : 'Enviar Proposta'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btnSecondary"
                                        onClick={() => setShowProposalForm(false)}
                                        disabled={sending}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
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
                        {isProfessional && stats && (
                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <h4>Estatísticas da Demanda (Atualizado)</h4>
                                <div className="detailList">
                                    <div className="detailRow">
                                        <span className="label">Propostas Recebidas</span>
                                        <span className="value">{stats.count}</span>
                                    </div>
                                    <div className="detailRow">
                                        <span className="label">Média de Preço</span>
                                        <span className="value">{formatCurrency(stats.average_value)}</span>
                                    </div>
                                </div>
                                {stats.professionals && stats.professionals.length > 0 && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <span className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>Propostas de:</span>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {stats.professionals.map((p, i) => (
                                                <div key={i} title={p.name} style={{
                                                    width: '32px', height: '32px', borderRadius: '50%', background: '#444',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', overflow: 'hidden'
                                                }}>
                                                    {p.avatar_url ? (
                                                        <img src={p.avatar_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <span>{p.name.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                            ))}
                                            {stats.count > (stats.professionals?.length || 0) && (
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%', background: '#333',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#aaa'
                                                }}>
                                                    +{stats.count - (stats.professionals?.length || 0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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
