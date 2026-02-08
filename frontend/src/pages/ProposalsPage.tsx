
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AuthState, Proposal, ProposalForClient } from '../types'
import { formatCurrency, formatDate, statusClass, statusLabel } from '../utils/formatters'

interface ProposalsPageProps {
    auth: Extract<AuthState, { state: 'authenticated' }>
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
    openServiceDetail: (id: string) => void
}

function extractItems<T>(json: unknown): T[] {
    if (!json || typeof json !== 'object') return []
    const obj = json as Record<string, unknown>

    const rootItems = obj.items
    if (Array.isArray(rootItems)) return rootItems as T[]

    const data = obj.data
    if (data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>
        const dataItems = dataObj.items
        if (Array.isArray(dataItems)) return dataItems as T[]
    }

    return []
}

function extractError(json: unknown): string | undefined {
    if (!json || typeof json !== 'object') return undefined
    const obj = json as Record<string, unknown>
    return typeof obj.error === 'string' ? obj.error : undefined
}

export function ProposalsPage({ auth, apiFetch, openServiceDetail }: ProposalsPageProps) {
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [received, setReceived] = useState<ProposalForClient[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [flash, setFlash] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
    const flashTimerRef = useRef<number | null>(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState<string>('')
    const [editDays, setEditDays] = useState<string>('')
    const [editDesc, setEditDesc] = useState<string>('')

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

    const loadProposals = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const path = auth.user.role === 'professional' ? '/api/proposals/me' : '/api/proposals/received'
            const res = await apiFetch(path, { method: 'GET' })
            if (!res.ok) {
                const json: unknown = await res.json().catch(() => undefined)
                setError(extractError(json) || 'Erro ao carregar propostas')
                return
            }

            const json: unknown = await res.json()
            if (auth.user.role === 'professional') {
                setProposals(extractItems<Proposal>(json))
                setReceived([])
            } else {
                setReceived(extractItems<ProposalForClient>(json))
                setProposals([])
            }
        } catch {
            setError('Erro de conexão ao carregar propostas')
        } finally {
            setLoading(false)
        }
    }, [apiFetch, auth.user.role])

    useEffect(() => {
        void loadProposals()
    }, [loadProposals])

    const handleCancel = async (proposalId: string) => {
        try {
            setActionLoading(true)
            const res = await apiFetch(`/api/proposals/${proposalId}/cancel`, { method: 'POST' })
            if (res.ok) {
                showFlash('success', 'Proposta cancelada')
                void loadProposals()
            } else {
                const json: unknown = await res.json().catch(() => undefined)
                showFlash('error', extractError(json) || 'Erro ao cancelar proposta')
            }
        } catch {
            showFlash('error', 'Erro de conexão')
        } finally {
            setActionLoading(false)
        }
    }

    const startEdit = (p: Proposal) => {
        setEditingId(p.id)
        setEditValue(String(p.value ?? ''))
        setEditDays(p.estimated_days ? String(p.estimated_days) : '')
        setEditDesc(p.description ?? '')
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditValue('')
        setEditDays('')
        setEditDesc('')
    }

    const saveEdit = async (proposalId: string) => {
        const payload: Record<string, unknown> = {}
        const valueNum = Number(editValue)
        if (Number.isFinite(valueNum)) payload.value = valueNum
        if (editDesc.trim()) payload.description = editDesc.trim()
        const daysNum = Number(editDays)
        if (editDays.trim() !== '' && Number.isFinite(daysNum)) payload.estimatedDays = daysNum

        try {
            setActionLoading(true)
            const res = await apiFetch(`/api/proposals/${proposalId}`, { method: 'PUT', body: JSON.stringify(payload) })
            if (!res.ok) {
                const json: unknown = await res.json().catch(() => undefined)
                showFlash('error', extractError(json) || 'Erro ao editar proposta')
                return
            }
            showFlash('success', 'Proposta atualizada')
            cancelEdit()
            void loadProposals()
        } catch {
            showFlash('error', 'Erro de conexão')
        } finally {
            setActionLoading(false)
        }
    }

    const handleAccept = async (proposalId: string) => {
        try {
            setActionLoading(true)
            const res = await apiFetch(`/api/proposals/${proposalId}/accept`, { method: 'POST' })
            if (!res.ok) {
                const json: unknown = await res.json().catch(() => undefined)
                showFlash('error', extractError(json) || 'Erro ao aceitar proposta')
                return
            }
            showFlash('success', 'Proposta aceita')
            void loadProposals()
        } catch {
            showFlash('error', 'Erro de conexão')
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async (proposalId: string) => {
        try {
            setActionLoading(true)
            const res = await apiFetch(`/api/proposals/${proposalId}/reject`, { method: 'POST' })
            if (!res.ok) {
                const json: unknown = await res.json().catch(() => undefined)
                showFlash('error', extractError(json) || 'Erro ao rejeitar proposta')
                return
            }
            showFlash('success', 'Proposta rejeitada')
            void loadProposals()
        } catch {
            showFlash('error', 'Erro de conexão')
        } finally {
            setActionLoading(false)
        }
    }

    const title = useMemo(() => auth.user.role === 'professional' ? 'Minhas Propostas' : 'Propostas Recebidas', [auth.user.role])
    const subtitle = useMemo(() => auth.user.role === 'professional'
        ? 'Gerencie as propostas enviadas'
        : 'Veja as propostas enviadas para suas demandas', [auth.user.role])

    return (
        <div className="servicesPage"> {/* Reusing servicesPage layout for now */}
            <div className="pageHeader">
                <div>
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>
                <button className="btnSecondary" onClick={loadProposals}>
                    Atualizar
                </button>
            </div>

            <div className="servicesLayout" style={{ display: 'block' }}> {/* Full width */}
                {flash && (
                    <div className={flash.kind === 'success' ? 'successBox' : 'errorBox'}>
                        {flash.text}
                    </div>
                )}
                {loading ? (
                    <div className="loading">Carregando propostas...</div>
                ) : error ? (
                    <div className="errorBox">{error}</div>
                ) : auth.user.role === 'professional' ? (
                    proposals.length === 0 ? (
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
                                        {editingId === proposal.id ? (
                                            <div>
                                                <div className="formRow">
                                                    <div className="formGroup">
                                                        <label>Valor</label>
                                                        <input
                                                            inputMode="numeric"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            placeholder="Ex.: 300"
                                                        />
                                                    </div>
                                                    <div className="formGroup">
                                                        <label>Prazo (dias)</label>
                                                        <input
                                                            inputMode="numeric"
                                                            value={editDays}
                                                            onChange={(e) => setEditDays(e.target.value)}
                                                            placeholder="Ex.: 7"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="formGroup" style={{ marginTop: '0.75rem' }}>
                                                    <label>Descrição</label>
                                                    <textarea
                                                        rows={5}
                                                        value={editDesc}
                                                        onChange={(e) => setEditDesc(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p><strong>Valor:</strong> {formatCurrency(Number(proposal.value))}</p>
                                                <p><strong>Prazo:</strong> {proposal.estimated_days} dias</p>
                                                <p className="serviceCardDesc" style={{ marginTop: '0.5rem' }}>
                                                    {proposal.description}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <div className="serviceCardFooter" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                                        {editingId === proposal.id ? (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btnSecondary" onClick={cancelEdit} disabled={actionLoading}>
                                                    Cancelar
                                                </button>
                                                <button className="btnPrimary" onClick={() => void saveEdit(proposal.id)} disabled={actionLoading}>
                                                    Salvar
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {(proposal.status === 'pending' || proposal.status === 'rejected') && (
                                                    <button
                                                        className="btnSecondary"
                                                        onClick={() => startEdit(proposal)}
                                                        disabled={actionLoading}
                                                    >
                                                        Editar
                                                    </button>
                                                )}
                                                {proposal.status === 'pending' && (
                                                    <button
                                                        className="btnSecondary"
                                                        style={{ color: '#ef4444', borderColor: '#ef4444' }}
                                                        onClick={() => handleCancel(proposal.id)}
                                                        disabled={actionLoading}
                                                    >
                                                        Cancelar Proposta
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : received.length === 0 ? (
                    <div className="emptyState">
                        <div className="emptyIcon">📨</div>
                        <h3>Nenhuma proposta encontrada</h3>
                        <p>Suas demandas ainda não receberam propostas.</p>
                    </div>
                ) : (
                    <div className="servicesList">
                        {received.map(p => (
                            <div key={p.id} className="serviceCard" style={{ cursor: 'default' }}>
                                <div className="serviceCardHeader">
                                    <div className="serviceClient">
                                        <div className="clientAvatar">R</div>
                                        <div>
                                            <div className="clientName">{p.service_request_title || 'Demanda'}</div>
                                            <div className="serviceTime">Recebida em {formatDate(p.created_at)}</div>
                                        </div>
                                    </div>
                                    <span className={`badge ${statusClass(p.status)}`}>
                                        {statusLabel(p.status)}
                                    </span>
                                </div>

                                <div className="serviceCardBody" style={{ marginTop: '1rem' }}>
                                    <p><strong>Profissional:</strong> {p.professional?.user?.name || 'Profissional'}</p>
                                    <p><strong>Valor:</strong> {Number.isFinite(Number(p.value)) ? formatCurrency(Number(p.value)) : 'A combinar'}</p>
                                    <p><strong>Prazo:</strong> {p.estimated_days ?? 'A combinar'} dias</p>
                                    <p className="serviceCardDesc" style={{ marginTop: '0.5rem' }}>
                                        {p.description}
                                    </p>
                                </div>

                                <div className="serviceCardFooter" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
                                    <button className="btnSecondary" onClick={() => openServiceDetail(p.service_request_id)}>
                                        Ver demanda
                                    </button>

                                    {p.status === 'pending' ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btnSuccess" onClick={() => void handleAccept(p.id)} disabled={actionLoading}>
                                                Aceitar
                                            </button>
                                            <button className="btnSecondary" onClick={() => void handleReject(p.id)} disabled={actionLoading}>
                                                Rejeitar
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ação indisponível</span>
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
