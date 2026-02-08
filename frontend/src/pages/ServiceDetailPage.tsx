
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Service, View, AuthState, ProposalForClient } from '../types'
import { formatCurrency, statusClass, statusLabel, formatTimeAgo, formatLocation, urgencyClass, urgencyLabel } from '../utils/formatters'
import { API_BASE_URL } from '../config'
import { useProposal } from '../hooks/useProposal'
import { useServiceStats } from '../hooks/useServiceStats'
import { ProposalForm } from '../components/ProposalForm'
import { ServiceStats } from '../components/ServiceStats'

function extractError(json: unknown): string | undefined {
    if (!json || typeof json !== 'object') return undefined
    const obj = json as Record<string, unknown>
    return typeof obj.error === 'string' ? obj.error : undefined
}

function extractProposalItems(json: unknown): ProposalForClient[] {
    if (!json || typeof json !== 'object') return []
    const obj = json as Record<string, unknown>

    const rootItems = obj.items
    if (Array.isArray(rootItems)) return rootItems as ProposalForClient[]

    const data = obj.data
    if (data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>
        const dataItems = dataObj.items
        if (Array.isArray(dataItems)) return dataItems as ProposalForClient[]
    }

    return []
}

function extractUpdatedRequest(json: unknown): Service | null {
    if (!json || typeof json !== 'object') return null
    const obj = json as Record<string, unknown>
    const data = obj.data && typeof obj.data === 'object' ? (obj.data as Record<string, unknown>) : obj
    const req = (data as Record<string, unknown>).request
    return req && typeof req === 'object' ? (req as Service) : null
}

interface ServiceDetailPageProps {
    serviceId: string
    initialService?: Service | null
    auth: Extract<AuthState, { state: 'authenticated' }> | { state: 'anonymous' }
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
    setView: (view: View) => void
}

export function ServiceDetailPage({ serviceId, initialService, auth, apiFetch, setView }: ServiceDetailPageProps) {
    const [showProposalForm, setShowProposalForm] = useState(false)
    const [editingRequest, setEditingRequest] = useState(false)
    const [service, setService] = useState<Service | null>(() => initialService ?? null)
    const [loading, setLoading] = useState(false)

    const [editTitle, setEditTitle] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [editBudgetMin, setEditBudgetMin] = useState<string>('')
    const [editBudgetMax, setEditBudgetMax] = useState<string>('')
    const [editUrgency, setEditUrgency] = useState<'low' | 'medium' | 'high'>('medium')

    const [receivedProposals, setReceivedProposals] = useState<ProposalForClient[]>([])
    const [receivedLoading, setReceivedLoading] = useState(false)
    const [receivedError, setReceivedError] = useState('')
    const [flash, setFlash] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
    const flashTimerRef = useRef<number | null>(null)

    const showFlash = useCallback((kind: 'success' | 'error', text: string) => {
        setFlash({ kind, text })
        if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
        flashTimerRef.current = window.setTimeout(() => setFlash(null), 3500)
    }, [])

    useEffect(() => {
        return () => {
            if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
        }
    }, [])

    useEffect(() => {
        setService(initialService ?? null)
    }, [initialService])

    useEffect(() => {
        if (service) return
        setLoading(true)
        apiFetch(`/api/requests/${serviceId}`, { method: 'GET' })
            .then(async (res) => {
                if (!res.ok) return
                const json = await res.json()
                const data = json.data ?? json
                const req = data.request as Service | undefined
                if (req) setService(req)
            })
            .finally(() => setLoading(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serviceId, service])

    const isAuthed = auth.state === 'authenticated'
    const isProfessional = isAuthed && auth.user.role === 'professional'
    const isClient = isAuthed && auth.user.role === 'client'

    useEffect(() => {
        if (!service) return
        setEditTitle(service.title)
        setEditDescription(service.description || '')
        setEditBudgetMin(service.budget_min ? String(service.budget_min) : '')
        setEditBudgetMax(service.budget_max ? String(service.budget_max) : '')
        setEditUrgency((service.urgency as 'low' | 'medium' | 'high') || 'medium')
        setEditingRequest(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [service?.id])

    const backView: View = useMemo(() => {
        if (isProfessional) return 'services'
        if (isClient) return 'my-services'
        return 'public-services'
    }, [isClient, isProfessional])

    const loadReceived = useCallback(async () => {
        if (!isClient) return
        setReceivedLoading(true)
        setReceivedError('')
        try {
            const res = await apiFetch(`/api/proposals/service-request/${serviceId}`, { method: 'GET' })
            if (!res.ok) {
                if (res.status === 403) {
                    setReceivedProposals([])
                    return
                }
                const json: unknown = await res.json().catch(() => undefined)
                const msg = extractError(json) || `Erro ao carregar propostas (HTTP ${res.status})`
                setReceivedError(msg)
                return
            }
            const json: unknown = await res.json()
            const items = extractProposalItems(json)
            setReceivedProposals(items)
        } catch {
            setReceivedError('Erro de conexão ao carregar propostas')
        } finally {
            setReceivedLoading(false)
        }
    }, [apiFetch, isClient, serviceId])

    useEffect(() => {
        void loadReceived()
    }, [loadReceived])

    const {
        proposal,
        updateProposal,
        submitProposal,
        sending,
        financials
    } = useProposal({
        serviceId,
        apiFetch,
        onSuccess: () => {
            showFlash('success', 'Proposta enviada com sucesso')
            setShowProposalForm(false)
        },
        onError: (msg) => showFlash('error', msg)
    })

    const stats = useServiceStats(serviceId, auth.state === 'authenticated', apiFetch)

    const handleAccept = async (proposalId: string) => {
        const res = await apiFetch(`/api/proposals/${proposalId}/accept`, { method: 'POST' })
        if (!res.ok) {
            const json: unknown = await res.json().catch(() => undefined)
            showFlash('error', extractError(json) || 'Erro ao aceitar proposta')
            return
        }
        await loadReceived()
        showFlash('success', 'Proposta aceita')
    }

    const handleReject = async (proposalId: string) => {
        const res = await apiFetch(`/api/proposals/${proposalId}/reject`, { method: 'POST' })
        if (!res.ok) {
            const json: unknown = await res.json().catch(() => undefined)
            showFlash('error', extractError(json) || 'Erro ao rejeitar proposta')
            return
        }
        await loadReceived()
        showFlash('success', 'Proposta rejeitada')
    }

    if (loading && !service) {
        return (
            <div className="serviceDetailPage">
                <div className="loading">Carregando...</div>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="serviceDetailPage">
                <div className="emptyState">
                    <h3>Demanda não encontrada</h3>
                    <p>Talvez ela tenha sido removida ou já foi fechada.</p>
                    <button className="btnSecondary" onClick={() => setView(backView)}>Voltar</button>
                </div>
            </div>
        )
    }

    const svc = service
    const canEditRequest = isClient && svc.status !== 'closed' && svc.status !== 'cancelled'

    const saveRequestEdit = async () => {
        const payload: Record<string, unknown> = {
            title: editTitle.trim(),
            description: editDescription.trim(),
            urgency: editUrgency,
        }
        if (editBudgetMin.trim() !== '') payload.budgetMin = Number(editBudgetMin)
        if (editBudgetMax.trim() !== '') payload.budgetMax = Number(editBudgetMax)

        const res = await apiFetch(`/api/requests/${svc.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        if (!res.ok) {
            const json: unknown = await res.json().catch(() => undefined)
            showFlash('error', extractError(json) || `Erro ao salvar (HTTP ${res.status})`)
            return
        }
        const json: unknown = await res.json()
        const updated = extractUpdatedRequest(json)
        if (updated) setService(updated)
        setEditingRequest(false)
        showFlash('success', 'Demanda atualizada')
    }

    return (
        <div className="serviceDetailPage">
            <div style={{ marginBottom: '1rem' }}>
                <button
                    className="btnSecondary"
                    onClick={() => setView(backView)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    ← Voltar para lista
                </button>
            </div>

            <div className="serviceDetailHeader">
                <div className="serviceDetailTitle">
                    <h1>{svc.title}</h1>
                    <span className={`badge ${statusClass(svc.status)}`}>
                        {statusLabel(svc.status)}
                    </span>
                </div>
                <div className="serviceDetailMeta">
                    <span>Publicado {formatTimeAgo(svc.created_at)}</span>
                    <span className="separator">•</span>
                    <span>{formatLocation(svc)}</span>
                </div>
            </div>

            <div className="serviceDetailContent">
                <div className="serviceMainCol">
                    <div className="card">
                        <div className="cardHeader">
                            <h2>Descrição do Projeto</h2>
                            {canEditRequest && (
                                <button
                                    className="btnSecondary btnSm"
                                    onClick={() => setEditingRequest((v) => !v)}
                                >
                                    {editingRequest ? 'Cancelar' : 'Editar'}
                                </button>
                            )}
                        </div>

                        {editingRequest ? (
                            <div style={{ marginTop: '0.75rem' }}>
                                <div className="formGroup">
                                    <label>Título</label>
                                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                                </div>
                                <div className="formGroup">
                                    <label>Descrição</label>
                                    <textarea rows={6} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                                </div>
                                <div className="formRow" style={{ marginTop: '0.75rem' }}>
                                    <div className="formGroup">
                                        <label>Orçamento mín.</label>
                                        <input
                                            inputMode="numeric"
                                            value={editBudgetMin}
                                            onChange={(e) => setEditBudgetMin(e.target.value)}
                                            placeholder="Ex.: 300"
                                        />
                                    </div>
                                    <div className="formGroup">
                                        <label>Orçamento máx.</label>
                                        <input
                                            inputMode="numeric"
                                            value={editBudgetMax}
                                            onChange={(e) => setEditBudgetMax(e.target.value)}
                                            placeholder="Ex.: 2999"
                                        />
                                    </div>
                                </div>
                                <div className="formGroup" style={{ marginTop: '0.75rem' }}>
                                    <label>Urgência</label>
                                    <select
                                        value={editUrgency}
                                        onChange={(e) => {
                                            const v = e.target.value
                                            if (v === 'low' || v === 'medium' || v === 'high') setEditUrgency(v)
                                        }}
                                    >
                                        <option value="low">Baixa</option>
                                        <option value="medium">Média</option>
                                        <option value="high">Urgente</option>
                                    </select>
                                </div>
                                <div className="formActions">
                                    <button className="btnSecondary" onClick={() => setEditingRequest(false)}>Voltar</button>
                                    <button className="btnPrimary" onClick={() => void saveRequestEdit()}>Salvar</button>
                                </div>
                            </div>
                        ) : (
                            <div className="serviceDescription">
                                {svc.description || 'Sem descrição detalhada.'}
                            </div>
                        )}
                    </div>

                    {isClient && (
                        <div className="card" style={{ marginTop: '1rem' }}>
                            <div className="cardHeader">
                                <h2>Propostas Recebidas</h2>
                                <button className="btnSecondary btnSm" onClick={() => void loadReceived()} disabled={receivedLoading}>
                                    Atualizar
                                </button>
                            </div>

                            {flash && (
                                <div className={flash.kind === 'success' ? 'successBox' : 'errorBox'}>
                                    {flash.text}
                                </div>
                            )}

                            {receivedLoading ? (
                                <div className="loading">Carregando propostas...</div>
                            ) : receivedError ? (
                                <div className="errorBox">{receivedError}</div>
                            ) : receivedProposals.length === 0 ? (
                                <div className="emptyState sm">
                                    <div className="emptyIcon">📨</div>
                                    <h3>Nenhuma proposta ainda</h3>
                                    <p>Quando um freelancer enviar proposta, ela vai aparecer aqui.</p>
                                </div>
                            ) : (
                                <div className="proposalsList">
                                    {receivedProposals.map((p) => {
                                        const prof = p.professional?.user
                                        const profProfile = p.professional?.profile
                                        const profName = prof?.name || 'Profissional'
                                        const profLoc = profProfile?.is_remote
                                            ? 'Remoto'
                                            : (profProfile?.city && profProfile?.uf ? `${profProfile.city}/${profProfile.uf}` : (profProfile?.uf || 'Brasil'))

                                        return (
                                            <div key={p.id} className="proposalCard">
                                                <div className="proposalHeader">
                                                    <div className="proposalFreelancer">
                                                        <div className="freelancerAvatar" style={{ overflow: 'hidden' }}>
                                                            {prof?.avatar_url ? (
                                                                <img
                                                                    src={prof.avatar_url.startsWith('/') ? `${API_BASE_URL}${prof.avatar_url}` : prof.avatar_url}
                                                                    alt=""
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <span>{profName.charAt(0).toUpperCase()}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="freelancerName">{profName}</div>
                                                            <div className="freelancerRating" style={{ color: 'var(--text-muted)' }}>{profLoc}</div>
                                                        </div>
                                                    </div>
                                                    <div className="proposalPrice">
                                                        {Number.isFinite(Number(p.value)) ? formatCurrency(Number(p.value)) : 'A combinar'}
                                                    </div>
                                                </div>

                                                <div className="proposalMessage">
                                                    {p.description}
                                                </div>

                                                {profProfile?.skills && profProfile.skills.length > 0 && (
                                                    <div className="skillsTags" style={{ marginBottom: '0.75rem' }}>
                                                        {profProfile.skills.slice(0, 8).map((s) => (
                                                            <span key={s} className="skillTag">{s}</span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="proposalFooter">
                                                    <span>Prazo: {p.estimated_days ?? 'A combinar'} dias</span>
                                                    <span>Status: <span className={`badge ${statusClass(p.status)}`}>{statusLabel(p.status)}</span></span>
                                                </div>

                                                {p.status === 'pending' && (
                                                    <div className="proposalActions" style={{ marginTop: '1rem' }}>
                                                        <button className="btnSuccess" onClick={() => void handleAccept(p.id)}>
                                                            Aceitar
                                                        </button>
                                                        <button className="btnSecondary" onClick={() => void handleReject(p.id)}>
                                                            Rejeitar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

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
                                {svc.budget_min && svc.budget_max
                                    ? `${formatCurrency(svc.budget_min)} - ${formatCurrency(svc.budget_max)}`
                                    : 'A combinar'}
                            </div>
                        </div>
                        <div className="detailList">
                            <div className="detailRow">
                                <span className="label">Categoria</span>
                                <span className="value">{svc.category_name || 'Geral'}</span>
                            </div>
                            <div className="detailRow">
                                <span className="label">Urgência</span>
                                <span className={`badge ${urgencyClass(svc.urgency)}`}>
                                    {urgencyLabel(svc.urgency)}
                                </span>
                            </div>
                        </div>

                        {/* Proposal Stats Section */}
                        {isProfessional && <ServiceStats stats={stats} />}

                        {isProfessional && !showProposalForm && svc.status === 'open' && (
                            <button
                                className="btnPrimary btnFull"
                                onClick={() => setShowProposalForm(true)}
                                style={{ marginTop: '1rem' }}
                            >
                                Enviar Proposta
                            </button>
                        )}

                        {!isProfessional && svc.status === 'open' && (
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
