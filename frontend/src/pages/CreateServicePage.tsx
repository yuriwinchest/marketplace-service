import { useState } from 'react'
import type { AuthState, Category, View } from '../types'
import { LocationSelector } from '../components/LocationSelector'

interface CreateServicePageProps {
    auth: AuthState
    categories: Category[]
    setView: (view: View) => void
    onServiceCreated: () => void
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
}

export function CreateServicePage({ auth, categories, setView, onServiceCreated, apiFetch }: CreateServicePageProps) {
    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState('')
    const [category, setCategory] = useState('')
    const [budgetMin, setBudgetMin] = useState('')
    const [budgetMax, setBudgetMax] = useState('')
    const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium')
    const [location, setLocation] = useState<{ scope: 'national' | 'state' | 'city', uf: string, city: string }>({
        scope: 'city',
        uf: '',
        city: ''
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        if (auth.state !== 'authenticated') return
        setError(null)
        setLoading(true)
        try {
            const res = await apiFetch('/api/requests', {
                method: 'POST',
                body: JSON.stringify({
                    title: title,
                    description: desc || undefined,
                    categoryId: category || undefined,
                    urgency: urgency,
                    budgetMin: budgetMin ? Number(budgetMin) : undefined,
                    budgetMax: budgetMax ? Number(budgetMax) : undefined,
                    locationScope: location.scope,
                    uf: location.uf || undefined,
                    city: location.city || undefined,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'Erro ao criar servico')
                return
            }
            // Reset form
            setTitle('')
            setDesc('')
            setCategory('')
            setLocation({ scope: 'city', uf: '', city: '' })
            setBudgetMin('')
            setBudgetMax('')

            onServiceCreated() // Refresh list and change view
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

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
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            placeholder="Descreva os detalhes do projeto..."
                            rows={5}
                        />
                    </div>

                    <div className="formRow">
                        <div className="formGroup">
                            <label>Categoria</label>
                            <select value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="">Selecione</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
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
                            onClick={handleCreate}
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
