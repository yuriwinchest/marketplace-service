import { useState, useEffect } from 'react'
import type { AuthState, Category, View } from '../types'
import { LocationSelector } from '../components/LocationSelector'

interface CreateServicePageProps {
    auth: AuthState
    categories: Category[]
    setView: (view: View) => void
    onServiceCreated: () => void
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
}

function CategorySelector({ categories, value, onChange }: { categories: Category[], value: string, onChange: (id: string) => void }) {
    const [display, setDisplay] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    // Sync display with selected value (e.g. initial load or external change)
    useEffect(() => {
        if (value) {
            const cat = categories.find(c => c.id === value)
            if (cat) setDisplay(cat.name)
        } else {
            // Only clear display if user hasn't typed anything yet? 
            // actually if value is empty, display should be empty or what user is typing.
            // But we don't want to overwrite user typing if they are searching.
            // Simple logic: if value is effectively invalid, we let user type.
        }
    }, [value, categories])

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(display.toLowerCase())
    )

    return (
        <div className="searchableSelect">
            <input
                type="text"
                value={display}
                onChange={e => {
                    setDisplay(e.target.value)
                    setIsOpen(true)
                    // If user clears input, allow "empty" but don't unset logic unless strict
                    if (e.target.value === '') onChange('')
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                placeholder="Busque uma categoria... (ex: Pedreiro, Design)"
                className="categoryInput" // Optional extra class
            />
            {isOpen && (
                <div className="dropdownOptions">
                    {filtered.map(c => (
                        <div
                            key={c.id}
                            className="dropdownOption"
                            onClick={() => {
                                onChange(c.id)
                                setDisplay(c.name)
                                setIsOpen(false)
                            }}
                        >
                            {c.name}
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="dropdownOption disabled">Nenhuma categoria encontrada</div>
                    )}
                </div>
            )}
        </div>
    )
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
                            <CategorySelector
                                categories={categories}
                                value={category}
                                onChange={setCategory}
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
