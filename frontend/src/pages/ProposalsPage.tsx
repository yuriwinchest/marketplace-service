
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { apiRequest } from '../services/api'
import type { Proposal, ProposalForClient } from '../types'
import { formatCurrency, formatDate, statusClass, statusLabel } from '../utils/formatters'

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

export function ProposalsPage() {
    const { auth } = useAuthStore()
    const navigate = useNavigate()

    if (auth.state !== 'authenticated') return null

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

    const loadProposals = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const path = auth.user.role === 'professional' ? '/api/proposals/me' : '/api/proposals/received'
            const data = await apiRequest<any>(path)
            if (auth.user.role === 'professional') {
                setProposals(extractItems<Proposal>(data))
                setReceived([])
            } else {
                setReceived(extractItems<ProposalForClient>(data))
                setProposals([])
            }
        } catch (e: any) {
            setError(e.message || 'Erro ao carregar propostas')
        } finally {
            setLoading(false)
        }
    }, [auth.user.role])

    useEffect(() => {
        void loadProposals()
    }, [loadProposals])

    const handleCancel = async (proposalId: string) => {
        try {
            setActionLoading(true)
            await apiRequest(`/api/proposals/${proposalId}/cancel`, { method: 'POST' })
            showFlash('success', 'A proposta foi cancelada com sucesso.')
            void loadProposals()
        } catch (e: any) {
            showFlash('error', e.message || 'Falha ao cancelar proposta')
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
            await apiRequest(`/api/proposals/${proposalId}`, { method: 'PUT', body: JSON.stringify(payload) })
            showFlash('success', 'Sua proposta foi atualizada.')
            cancelEdit()
            void loadProposals()
        } catch (e: any) {
            showFlash('error', e.message || 'Falha na atualização')
        } finally {
            setActionLoading(false)
        }
    }

    const handleAccept = async (proposalId: string) => {
        try {
            setActionLoading(true)
            await apiRequest(`/api/proposals/${proposalId}/accept`, { method: 'POST' })
            showFlash('success', 'Proposta aceita com sucesso!')
            void loadProposals()
        } catch (e: any) {
            showFlash('error', e.message || 'Erro ao processar aceite')
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async (proposalId: string) => {
        try {
            setActionLoading(true)
            await apiRequest(`/api/proposals/${proposalId}/reject`, { method: 'POST' })
            showFlash('success', 'Proposta recusada.')
            void loadProposals()
        } catch (e: any) {
            showFlash('error', e.message || 'Erro ao processar recusa')
        } finally {
            setActionLoading(false)
        }
    }

    const isProfessional = auth.user.role === 'professional'

    return (
        <div className="proposalsPage max-w-6xl mx-auto px-4 py-16 space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-forest-800 border border-white/5 p-12 rounded-[50px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        {isProfessional ? 'Minhas' : 'Propostas'} <span className="text-emerald-400">Recebidas</span>
                    </h1>
                    <p className="text-gray-400 mt-4 text-lg font-medium max-w-xl">
                        {isProfessional
                            ? 'Acompanhe o status e gerencie as propostas que você enviou para clientes.'
                            : 'Analise as ofertas de profissionais qualificados para as suas demandas publicadas.'}
                    </p>
                </div>

                <div className="relative z-10">
                    <button
                        className="bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-[24px] font-black transition-all border border-white/10 flex items-center gap-3 group shadow-xl active:scale-95"
                        onClick={loadProposals}
                        disabled={loading}
                    >
                        <span className={`text-emerald-500 text-xl ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`}>
                            {loading ? '⌛' : '↺'}
                        </span>
                        {loading ? 'Atualizando...' : 'Sincronizar Lista'}
                    </button>
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-8">
                {error && (
                    <div className="bg-red-500/10 text-red-400 p-6 rounded-[32px] border border-red-500/20 text-center font-bold">
                        ⚠️ Erro: {error}
                    </div>
                )}

                {loading && (
                    <div className="grid grid-cols-1 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-forest-800/50 border border-white/5 rounded-[40px]"></div>
                        ))}
                    </div>
                )}

                {!loading && (isProfessional ? proposals.length === 0 : received.length === 0) && (
                    <div className="text-center py-32 bg-forest-800 rounded-[50px] border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
                        <div className="text-8xl mb-10 transform hover:scale-110 transition-transform cursor-default">📥</div>
                        <h3 className="text-3xl font-black text-white mb-4">Nenhuma proposta por aqui</h3>
                        <p className="text-gray-400 max-w-md mx-auto mb-10 text-lg font-medium leading-relaxed">
                            {isProfessional
                                ? 'Você ainda não se candidatou a nenhum projeto. Explore o marketplace e comece agora!'
                                : 'Suas demandas publicadas ainda não receberam propostas. Tente ajustar os detalhes.'}
                        </p>
                        <button
                            className="bg-emerald-500 hover:bg-emerald-600 text-forest-900 px-12 py-5 rounded-[24px] font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                            onClick={() => navigate(isProfessional ? '/servicos' : '/demandas/criar')}
                        >
                            {isProfessional ? 'Ver Marketplace' : 'Criar Nova Demanda'}
                        </button>
                    </div>
                )}

                <div className="space-y-6">
                    {(isProfessional ? proposals : received).map((p: any) => (
                        <div key={p.id} className="group relative bg-forest-800 border border-white/5 rounded-[40px] p-10 md:p-14 shadow-xl hover:border-emerald-500/20 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[80px] group-hover:bg-emerald-500/10 transition-all"></div>

                            <div className="flex flex-col lg:flex-row gap-10 items-start">
                                {/* Info Column */}
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center text-3xl text-emerald-400 font-black border-2 border-emerald-500/10">
                                            {isProfessional ? '💼' : '🚀'}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => navigate(`/servico/${p.service_request_id}`)}>
                                                {p.service_request_title || 'Demanda do Projeto'}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest">
                                                <span>📅 {formatDate(p.created_at)}</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-white/5"></span>
                                                <span className={statusClass(p.status).replace('bg-', 'text-')}>
                                                    ● {statusLabel(p.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {editingId === p.id ? (
                                        <div className="bg-forest-900/50 p-8 rounded-[32px] border border-white/5 space-y-6 animate-in fade-in slide-in-from-top-4">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Valor do Lance (R$)</label>
                                                    <input
                                                        className="w-full bg-forest-900 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tempo Estimado (Dias)</label>
                                                    <input
                                                        className="w-full bg-forest-900 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                                        value={editDays}
                                                        onChange={(e) => setEditDays(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Apresentação / Contra-oferta</label>
                                                <textarea
                                                    className="w-full bg-forest-900 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium resize-none"
                                                    rows={4}
                                                    value={editDesc}
                                                    onChange={(e) => setEditDesc(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                                                <button className="text-gray-500 hover:text-white font-black text-xs uppercase tracking-widest px-6" onClick={cancelEdit}>Cancelar</button>
                                                <button className="bg-emerald-500 hover:bg-emerald-600 text-forest-900 px-8 py-3.5 rounded-xl font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-95" onClick={() => void saveEdit(p.id)}>Salvar Alterações</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 bg-forest-900/30 rounded-[32px] border border-white/5 italic text-gray-400 font-medium leading-relaxed relative">
                                            "{p.description}"
                                            <div className="absolute top-4 right-6 text-2xl opacity-10 font-serif">"</div>
                                        </div>
                                    )}
                                </div>

                                {/* Financial Column */}
                                <div className="w-full lg:w-[260px] space-y-4">
                                    <div className="bg-emerald-500/10 p-6 rounded-[32px] border border-emerald-500/20">
                                        <div className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest mb-1">Valor Ofertado</div>
                                        <div className="text-3xl font-black text-white tracking-tighter">
                                            {formatCurrency(Number(p.value))}
                                        </div>
                                        <div className="text-xs font-bold text-emerald-500/40 mt-1 uppercase tracking-widest">
                                            🚚 em {p.estimated_days} dias úteis
                                        </div>
                                    </div>

                                    {!isProfessional && (
                                        <div className="bg-white/5 p-6 rounded-[32px] border border-white/5">
                                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Profissional</div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl text-emerald-400 font-black">
                                                    {p.professional?.user?.name?.charAt(0) || 'P'}
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold leading-none">{p.professional?.user?.name || 'Freelancer'}</div>
                                                    <div className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest mt-1">⭐️ 5.0</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex lg:flex-col gap-3">
                                        {isProfessional ? (
                                            <>
                                                {(p.status === 'pending' || p.status === 'rejected') && (
                                                    <button
                                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/10 active:scale-95 disabled:opacity-50"
                                                        onClick={() => startEdit(p)}
                                                        disabled={actionLoading || editingId === p.id}
                                                    >
                                                        ⚙️ Editar
                                                    </button>
                                                )}
                                                {p.status === 'pending' && (
                                                    <button
                                                        className="flex-1 border border-red-500/20 hover:bg-red-500/10 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                                                        onClick={() => handleCancel(p.id)}
                                                        disabled={actionLoading}
                                                    >
                                                        ❌ Cancelar
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            p.status === 'pending' && (
                                                <div className="flex lg:flex-col gap-3 w-full">
                                                    <button
                                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-forest-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                                                        onClick={() => handleAccept(p.id)}
                                                        disabled={actionLoading}
                                                    >
                                                        ✅ Aceitar
                                                    </button>
                                                    <button
                                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/10 active:scale-95 disabled:opacity-50"
                                                        onClick={() => handleReject(p.id)}
                                                        disabled={actionLoading}
                                                    >
                                                        🚫 Recusar
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Flash Feedback */}
            {flash && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className={`flex items-center gap-4 px-10 py-5 rounded-[24px] shadow-2xl backdrop-blur-xl border ${flash.kind === 'success' ? 'bg-emerald-500 text-forest-900 border-emerald-400' : 'bg-red-500 text-white border-red-400'}`}>
                        <span className="text-2xl">{flash.kind === 'success' ? '✅' : '⚠️'}</span>
                        <div className="font-black tracking-tight">{flash.text}</div>
                    </div>
                </div>
            )}
        </div>
    )
}
