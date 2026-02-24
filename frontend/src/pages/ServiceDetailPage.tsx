
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { apiRequest } from '../services/api'
import type { Service, ProposalForClient } from '../types'
import { formatCurrency, statusClass, statusLabel, formatTimeAgo, formatLocation, urgencyClass, urgencyLabel } from '../utils/formatters'
import { API_BASE_URL } from '../config'
import { useProposal } from '../hooks/useProposal'
import { useServiceStats } from '../hooks/useServiceStats'
import { ProposalForm } from '../components/ProposalForm'
import { ServiceStats } from '../components/ServiceStats'

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

export function ServiceDetailPage() {
    const { id: serviceId } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { auth } = useAuthStore()

    const [showProposalForm, setShowProposalForm] = useState(false)
    const [editingRequest, setEditingRequest] = useState(false)
    const [service, setService] = useState<Service | null>(null)
    const [loading, setLoading] = useState(false)

    const [editTitle, setEditTitle] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [editBudgetMin, setEditBudgetMin] = useState<string>('')
    const [editBudgetMax, setEditBudgetMax] = useState<string>('')
    const [editUrgency, setEditUrgency] = useState<'low' | 'medium' | 'high'>('medium')

    const [receivedProposals, setReceivedProposals] = useState<ProposalForClient[]>([])
    const [receivedLoading, setReceivedLoading] = useState(false)
    const [flash, setFlash] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
    const flashTimerRef = useRef<number | null>(null)

    const showFlash = useCallback((kind: 'success' | 'error', text: string) => {
        setFlash({ kind, text })
        if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
        flashTimerRef.current = window.setTimeout(() => setFlash(null), 3500)
    }, [])

    useEffect(() => {
        if (!serviceId) return
        setLoading(true)
        apiRequest<any>(`/api/requests/${serviceId}`)
            .then((data) => {
                const req = (data.request || data.data?.request) as Service | undefined
                if (req) setService(req)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [serviceId])

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
    }, [service?.id])

    const loadReceived = useCallback(async () => {
        if (!isClient || !serviceId) return
        setReceivedLoading(true)
        try {
            const data = await apiRequest<any>(`/api/proposals/service-request/${serviceId}`)
            const items = extractProposalItems(data)
            setReceivedProposals(items)
        } catch (e: any) {
            if (e.status === 403) setReceivedProposals([])
            else showFlash('error', e.message || 'Erro ao carregar propostas')
        } finally {
            setReceivedLoading(false)
        }
    }, [isClient, serviceId, showFlash])

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
        serviceId: serviceId || '',
        apiFetch: async (path, init) => {
            const res = await apiRequest<any>(path, init)
            return new Response(JSON.stringify(res))
        },
        onSuccess: () => {
            showFlash('success', 'Sua proposta foi enviada com sucesso! Aguarde o retorno do cliente.')
            setShowProposalForm(false)
        },
        onError: (msg) => showFlash('error', msg)
    })

    const stats = useServiceStats(serviceId || '', isAuthed, async (path, init) => {
        const res = await apiRequest<any>(path, init)
        return new Response(JSON.stringify(res))
    })

    const handleAccept = async (proposalId: string) => {
        try {
            await apiRequest(`/api/proposals/${proposalId}/accept`, { method: 'POST' })
            await loadReceived()
            showFlash('success', 'Proposta aceita com sucesso!')
        } catch (e: any) {
            showFlash('error', e.message || 'Erro ao aceitar proposta')
        }
    }

    const handleReject = async (proposalId: string) => {
        try {
            await apiRequest(`/api/proposals/${proposalId}/reject`, { method: 'POST' })
            await loadReceived()
            showFlash('success', 'Proposta recusada.')
        } catch (e: any) {
            showFlash('error', e.message || 'Erro ao rejeitar proposta')
        }
    }

    if (loading && !service) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full shadow-xl shadow-emerald-500/20"></div>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-32 text-center">
                <div className="bg-forest-800 p-16 rounded-[48px] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
                    <div className="text-7xl mb-8">🚫</div>
                    <h3 className="text-3xl font-black text-white mb-4">Projeto Indisponível</h3>
                    <p className="text-gray-400 mb-10 text-lg font-medium">Esta demanda pode ter sido removida, cancelada ou já está com um profissional.</p>
                    <button
                        className="bg-white/5 hover:bg-white/10 text-white px-12 py-5 rounded-2xl font-black transition-all border border-white/10"
                        onClick={() => navigate(-1)}
                    >
                        Explorar Outros Projetos
                    </button>
                </div>
            </div>
        )
    }

    const svc = service
    const canEditRequest = isClient && svc.user_id === auth.user.id && svc.status !== 'closed' && svc.status !== 'cancelled'

    const saveRequestEdit = async () => {
        const payload: Record<string, unknown> = {
            title: editTitle.trim(),
            description: editDescription.trim(),
            urgency: editUrgency,
        }
        if (editBudgetMin.trim() !== '') payload.budgetMin = Number(editBudgetMin)
        if (editBudgetMax.trim() !== '') payload.budgetMax = Number(editBudgetMax)

        try {
            const data = await apiRequest<any>(`/api/requests/${svc.id}`, { method: 'PUT', body: JSON.stringify(payload) })
            const updated = extractUpdatedRequest(data)
            if (updated) setService(updated)
            setEditingRequest(false)
            showFlash('success', 'As alterações foram salvas.')
        } catch (e: any) {
            showFlash('error', e.message || 'Falha ao salvar alterações')
        }
    }

    return (
        <div className="serviceDetailPage max-w-7xl mx-auto px-4 py-12 space-y-10">
            {/* Header Actions */}
            <div className="flex items-center justify-between px-2">
                <button
                    className="group text-gray-500 hover:text-white flex items-center gap-3 text-sm font-bold transition-all"
                    onClick={() => navigate(-1)}
                >
                    <span className="p-2 bg-white/5 rounded-xl group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all">←</span>
                    Voltar aos Resultados
                </button>
                {canEditRequest && (
                    <button
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-emerald-500/10 flex items-center gap-2"
                        onClick={() => setEditingRequest(!editingRequest)}
                    >
                        {editingRequest ? '❌ CANCELAR EDIÇÃO' : '✏️ EDITAR PROJETO'}
                    </button>
                )}
            </div>

            {/* Main Title Section */}
            <div className="relative bg-forest-800 border border-white/5 p-10 md:p-16 rounded-[48px] shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10"></div>

                <div className="space-y-6 relative z-10">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusClass(svc.status)}`}>
                            {statusLabel(svc.status)}
                        </span>
                        <span className="bg-white/5 text-gray-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">
                            {svc.category_name || 'Geral'}
                        </span>
                        <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-auto">
                            Postado {formatTimeAgo(svc.created_at)}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight max-w-4xl">
                        {svc.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 pt-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📍</span>
                            <div>
                                <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Localização</div>
                                <div className="text-white font-bold">{formatLocation(svc)}</div>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-white/5 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⏳</span>
                            <div>
                                <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Urgência</div>
                                <div className={`font-black ${urgencyClass(svc.urgency).includes('high') ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {urgencyLabel(svc.urgency)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
                <div className="space-y-12">
                    {/* Description Card */}
                    <div className="bg-forest-800 border border-white/5 rounded-[40px] p-10 md:p-16 shadow-xl space-y-10">
                        <div className="flex items-center justify-between border-b border-white/5 pb-8">
                            <h2 className="text-2xl font-black text-white flex items-center gap-4">
                                <span className="p-3 bg-emerald-500/10 rounded-2xl text-xl">📄</span>
                                Detalhes da Demanda
                            </h2>
                        </div>

                        {editingRequest ? (
                            <div className="space-y-8">
                                <div className="formGroup space-y-3">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Título do Projeto</label>
                                    <input
                                        className="w-full bg-forest-900 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                    />
                                </div>
                                <div className="formGroup space-y-3">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Descrição Completa</label>
                                    <textarea
                                        className="w-full bg-forest-900 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium resize-none min-h-[300px]"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="formGroup space-y-3">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Orç. Mínimo (R$)</label>
                                        <input
                                            className="w-full bg-forest-900 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                            value={editBudgetMin}
                                            onChange={(e) => setEditBudgetMin(e.target.value)}
                                        />
                                    </div>
                                    <div className="formGroup space-y-3">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Orç. Máximo (R$)</label>
                                        <input
                                            className="w-full bg-forest-900 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                            value={editBudgetMax}
                                            onChange={(e) => setEditBudgetMax(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-forest-900 py-6 rounded-[24px] font-black text-lg transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
                                    onClick={saveRequestEdit}
                                >
                                    Atualizar Publicação
                                </button>
                            </div>
                        ) : (
                            <div className="text-gray-300 text-lg leading-relaxed font-medium bg-forest-900/50 p-10 rounded-[32px] border border-white/5 italic whitespace-pre-wrap">
                                "{svc.description || 'Nenhum detalhe adicional fornecido pelo contratante.'}"
                            </div>
                        )}
                    </div>

                    {/* Proposals Section (Only for Client) */}
                    {isClient && svc.user_id === auth.user.id && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black text-white">Candidatos</h2>
                                <button
                                    className="text-emerald-500 hover:text-emerald-400 font-black text-xs uppercase tracking-widest flex items-center gap-2 group"
                                    onClick={loadReceived}
                                    disabled={receivedLoading}
                                >
                                    <span className={receivedLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}>🔄</span>
                                    Sincronizar
                                </button>
                            </div>

                            {receivedLoading ? (
                                <div className="space-y-6">
                                    {[1, 2].map(i => <div key={i} className="h-64 bg-forest-800/20 rounded-[40px] animate-pulse"></div>)}
                                </div>
                            ) : receivedProposals.length === 0 ? (
                                <div className="bg-forest-800 border border-white/5 border-dashed rounded-[48px] p-20 text-center space-y-6">
                                    <div className="text-6xl mb-4 opacity-20">📨</div>
                                    <h3 className="text-2xl font-black text-white">Ninguém se interessou ainda?</h3>
                                    <p className="text-gray-500 font-medium max-w-sm mx-auto">Logo profissionais qualificados entrarão em contato. Verifique se o seu orçamento está atraente.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {receivedProposals.map((p) => {
                                        const prof = p.professional?.user
                                        const profProfile = p.professional?.profile
                                        return (
                                            <div key={p.id} className="group bg-forest-800 border border-white/5 rounded-[48px] p-10 md:p-14 shadow-xl hover:border-emerald-500/30 transition-all">
                                                <div className="flex flex-col md:flex-row gap-10 items-start">
                                                    <div className="flex items-center gap-6">
                                                        <div className="relative">
                                                            {prof?.avatar_url ? (
                                                                <img
                                                                    className="w-24 h-24 rounded-[32px] object-cover border-4 border-white/5 shadow-2xl"
                                                                    src={`${API_BASE_URL}${prof.avatar_url}`}
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <div className="w-24 h-24 rounded-[32px] bg-emerald-500/20 flex items-center justify-center text-3xl text-emerald-400 font-black border-4 border-white/5">
                                                                    {prof?.name?.charAt(0) || 'P'}
                                                                </div>
                                                            )}
                                                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-forest-900 p-2 rounded-xl text-[8px] font-black uppercase border-4 border-forest-800 shadow-xl">Verificado</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-2xl font-black text-white mb-1">{prof?.name || 'Profissional'}</div>
                                                            <div className="text-emerald-500/70 text-sm font-bold flex items-center gap-2">
                                                                ⭐️ 5.0 • {profProfile?.city}/{profProfile?.uf || 'BR'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="md:ml-auto text-left md:text-right space-y-1">
                                                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Valor da Proposta</div>
                                                        <div className="text-4xl font-black text-white">{formatCurrency(Number(p.value))}</div>
                                                        <div className="text-emerald-400 text-xs font-bold uppercase">Em {p.estimated_days} dias úteis</div>
                                                    </div>
                                                </div>

                                                <div className="my-10 text-gray-300 font-medium leading-relaxed bg-forest-900/50 p-8 rounded-[32px] border border-white/5 italic">
                                                    "{p.description}"
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-6 pt-10 border-t border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusClass(p.status)}`}>
                                                            Status: {statusLabel(p.status)}
                                                        </span>
                                                    </div>

                                                    {p.status === 'pending' && (
                                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                                            <button
                                                                className="flex-1 md:flex-none border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 px-8 py-4 rounded-2xl font-black text-sm transition-all"
                                                                onClick={() => handleReject(p.id)}
                                                            >
                                                                Recusar
                                                            </button>
                                                            <button
                                                                className="flex-[2] md:flex-none bg-emerald-500 hover:bg-emerald-600 text-forest-900 px-12 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                                                onClick={() => handleAccept(p.id)}
                                                            >
                                                                Aceitar Proposta
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit Proposal Form (Professional only) */}
                    {showProposalForm && isProfessional && (
                        <div id="proposal-form-scroll">
                            <ProposalForm
                                proposal={proposal}
                                updateProposal={updateProposal}
                                submitProposal={submitProposal}
                                sending={sending}
                                financials={financials}
                                onCancel={() => setShowProposalForm(false)}
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="lg:sticky lg:top-24 space-y-8">
                    {/* Budget Highlight */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[40px] p-10 shadow-2xl shadow-emerald-500/20 text-forest-900 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl transform group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Faixa de Orçamento</div>
                            <div className="text-4xl font-black leading-none tracking-tighter">
                                {svc.budget_min && svc.budget_max
                                    ? <>{formatCurrency(svc.budget_min)} <span className="opacity-40 text-2xl font-medium mx-1">-</span> {formatCurrency(svc.budget_max)}</>
                                    : 'A combinar'}
                            </div>

                            <div className="pt-6 border-t border-forest-900/10 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Segurança de Pagamento</span>
                                <span className="text-lg">🛡️</span>
                            </div>
                        </div>
                    </div>

                    {/* Project Stats (Only for Professional) */}
                    {isProfessional && <ServiceStats stats={stats} />}

                    {/* Action Button */}
                    {isProfessional && !showProposalForm && svc.status === 'open' && (
                        <button
                            className="w-full bg-forest-800 hover:bg-forest-700 text-white py-6 rounded-[32px] font-black text-xl transition-all shadow-2xl border border-white/5 active:scale-95 flex items-center justify-center gap-4 group"
                            onClick={() => {
                                setShowProposalForm(true)
                                setTimeout(() => document.getElementById('proposal-form-scroll')?.scrollIntoView({ behavior: 'smooth' }), 100)
                            }}
                        >
                            Candidatar-se Agora
                            <span className="text-emerald-500 group-hover:translate-x-2 transition-transform">🚀</span>
                        </button>
                    )}

                    {!isProfessional && svc.status === 'open' && (
                        <div className="bg-forest-800 border border-white/5 rounded-[40px] p-10 text-center space-y-6">
                            <div className="text-4xl opacity-30">🔐</div>
                            {auth.state === 'authenticated' ? (
                                <p className="text-gray-400 font-medium leading-relaxed">Você está em modo Cliente. Publique uma vaga para contratar profissionais qualificados.</p>
                            ) : (
                                <>
                                    <p className="text-gray-400 font-bold">Autentique-se como Profissional para acessar os detalhes financeiros e enviar propostas.</p>
                                    <button
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-forest-900 py-4 rounded-xl font-black transition-all"
                                        onClick={() => navigate('/login')}
                                    >
                                        ENTRAR
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Safe Badge */}
                    <div className="bg-forest-800/20 border border-white/5 p-8 rounded-[32px] flex items-center gap-5">
                        <div className="text-2xl p-3 bg-white/5 rounded-2xl">🤝</div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                            Contrate com segurança. O valor só é liberado após a conclusão do trabalho.
                        </p>
                    </div>
                </aside>
            </div>

            {/* Flash Messages */}
            {flash && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className={`flex items-center gap-4 px-8 py-5 rounded-[24px] shadow-2xl backdrop-blur-xl border ${flash.kind === 'success' ? 'bg-emerald-500/90 text-forest-900 border-emerald-400' : 'bg-red-500/90 text-white border-red-400'}`}>
                        <span className="text-2xl">{flash.kind === 'success' ? '✅' : '⚠️'}</span>
                        <div className="font-black tracking-tight">{flash.text}</div>
                    </div>
                </div>
            )}
        </div>
    )
}
