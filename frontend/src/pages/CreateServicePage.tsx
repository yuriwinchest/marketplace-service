
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useCategories } from '../hooks/useCategories'
import { useCreateService } from '../hooks/useCreateService'
import { LocationSelector } from '../components/LocationSelector'
import { CategorySelector } from '../components/CategorySelector'

export function CreateServicePage() {
    const { auth } = useAuthStore()
    const { data: categories = [] } = useCategories()
    const navigate = useNavigate()

    const { formState, setters, ui, submitService } = useCreateService({
        onSuccess: () => navigate('/meus-servicos')
    })

    const { title, description, categoryId, budgetMin, budgetMax, urgency, location } = formState
    const { setTitle, setDescription, setCategoryId, setBudgetMin, setBudgetMax, setUrgency, setLocation } = setters
    const { error, loading } = ui

    if (auth.state !== 'authenticated') return null

    return (
        <div className="createServicePage max-w-4xl mx-auto px-4 py-10">
            <button
                className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
                onClick={() => navigate('/meus-servicos')}
            >
                ← Voltar para Meus Serviços
            </button>
            <div className="formCard bg-forest-800 border border-white/5 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Publicar Novo Serviço</h1>
                    <p className="text-gray-400 mb-10">Descreva o que você precisa e encontre os melhores profissionais da sua região.</p>

                    <div className="formSection space-y-8">
                        <div className="formGroup space-y-2">
                            <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                Título do Serviço *
                            </label>
                            <input
                                className="w-full bg-forest-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-gray-600"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ex: Reforma de banheiro, Design de Logo, Pintura Residencial..."
                            />
                        </div>

                        <div className="formGroup space-y-2">
                            <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                Descrição Detalhada
                            </label>
                            <textarea
                                className="w-full bg-forest-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium resize-none placeholder:text-gray-600"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Dê detalhes sobre o que precisa ser feito, materiais necessários, prazos desejados..."
                                rows={6}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="formGroup space-y-2">
                                <label className="text-sm font-semibold text-gray-400">Categoria do Serviço</label>
                                <CategorySelector
                                    categories={categories}
                                    value={categoryId}
                                    onChange={setCategoryId}
                                />
                            </div>
                            <div className="formGroup space-y-2">
                                <label className="text-sm font-semibold text-gray-400">Urgência</label>
                                <select
                                    className="w-full bg-forest-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none"
                                    value={urgency}
                                    onChange={e => setUrgency(e.target.value as 'low' | 'medium' | 'high')}
                                >
                                    <option value="low">Baixa - Sem pressa</option>
                                    <option value="medium">Média - Preciso logo</option>
                                    <option value="high">Urgente - Para ontem!</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-forest-900/50 p-6 rounded-2xl border border-white/5 space-y-6">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                📍 Localização do Serviço
                            </h3>
                            <LocationSelector value={location} onChange={setLocation} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="formGroup space-y-2">
                                <label className="text-sm font-semibold text-gray-400">Orçamento Mínimo (R$)</label>
                                <input
                                    className="w-full bg-forest-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                    type="number"
                                    placeholder="Ex: 500"
                                    value={budgetMin}
                                    onChange={e => setBudgetMin(e.target.value)}
                                />
                            </div>
                            <div className="formGroup space-y-2">
                                <label className="text-sm font-semibold text-gray-400">Orçamento Máximo (R$)</label>
                                <input
                                    className="w-full bg-forest-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                    type="number"
                                    placeholder="Ex: 2500"
                                    value={budgetMax}
                                    onChange={e => setBudgetMax(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 text-sm font-medium">
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="formActions pt-8 flex gap-4">
                            <button
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold transition-all border border-white/5"
                                onClick={() => navigate('/meus-servicos')}
                            >
                                Cancelar
                            </button>
                            <button
                                className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-forest-900 py-4 rounded-xl font-black transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                                onClick={submitService}
                                disabled={loading || !title}
                            >
                                {loading ? 'Publicando Demanda...' : 'Publicar Serviço'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
