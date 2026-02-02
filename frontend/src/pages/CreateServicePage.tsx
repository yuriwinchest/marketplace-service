
import type { AuthState, Category, View } from '../types'
import { LocationSelector } from '../components/LocationSelector'
import { CategorySelector } from '../components/CategorySelector'
import { useCreateService } from '../hooks/useCreateService'

interface CreateServicePageProps {
    auth: AuthState
    categories: Category[]
    setView: (view: View) => void
    onServiceCreated: () => void
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
}

export function CreateServicePage({ auth, categories, setView, onServiceCreated, apiFetch }: CreateServicePageProps) {
    const { formState, setters, ui, submitService } = useCreateService({
        auth,
        onSuccess: onServiceCreated,
        apiFetch
    })

    const { title, description, categoryId, budgetMin, budgetMax, urgency, location } = formState
    const { setTitle, setDescription, setCategoryId, setBudgetMin, setBudgetMax, setUrgency, setLocation } = setters
    const { error, loading } = ui

    return (
        <div className="createServicePage">
            <button className="backBtn" onClick={() => setView('my-services')}>← Voltar</button>
            <div className="formCard">
                <h1>Publicar Novo Servico</h1>
                <p className="subtitle">Descreva o que voce precisa e encontre profissionais</p>

                <div className="formSection">
                    <div className="formGroup">
                        <label>Titulo do servico *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ex: Reforma de banheiro, Design de Logo..."
                        />
                    </div>

                    <div className="formGroup">
                        <label>Descricao detalhada</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Descreva os detalhes do projeto..."
                            rows={5}
                        />
                    </div>

                    <div className="formRow">
                        <div className="formGroup">
                            <label>Categoria</label>
                            <CategorySelector
                                categories={categories}
                                value={categoryId}
                                onChange={setCategoryId}
                            />
                        </div>
                    </div>

                    <LocationSelector value={location} onChange={setLocation} />

                    <div className="formRow">
                        <div className="formGroup">
                            <label>Orcamento minimo (R$)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={budgetMin}
                                onChange={e => setBudgetMin(e.target.value)}
                            />
                        </div>
                        <div className="formGroup">
                            <label>Orcamento maximo (R$)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={budgetMax}
                                onChange={e => setBudgetMax(e.target.value)}
                            />
                        </div>
                        <div className="formGroup">
                            <label>Urgencia</label>
                            <select value={urgency} onChange={e => setUrgency(e.target.value as 'low' | 'medium' | 'high')}>
                                <option value="low">Baixa</option>
                                <option value="medium">Media</option>
                                <option value="high">Urgente</option>
                            </select>
                        </div>
                    </div>

                    {error && <div className="errorBox">{error}</div>}

                    <div className="formActions">
                        <button className="btnSecondary" onClick={() => setView('my-services')}>
                            Cancelar
                        </button>
                        <button
                            className="btnPrimary"
                            onClick={submitService}
                            disabled={loading || !title}
                        >
                            {loading ? 'Publicando...' : 'Publicar Servico'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
