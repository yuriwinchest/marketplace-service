
import { useMemo, useState } from 'react'
import type { Category } from '../types'

interface CategorySelectorProps {
    categories: Category[]
    value: string
    onChange: (id: string) => void
}

export function CategorySelector({ categories, value, onChange }: CategorySelectorProps) {
    const selectedName = useMemo(() => {
        return categories.find(c => c.id === value)?.name || ''
    }, [categories, value])

    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase())
    )

    return (
        <div className="searchableSelect">
            <input
                type="text"
                value={isOpen ? query : selectedName}
                onChange={e => {
                    setQuery(e.target.value)
                    setIsOpen(true)
                    if (e.target.value === '') onChange('')
                }}
                onFocus={() => {
                    setQuery(selectedName)
                    setIsOpen(true)
                }}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                placeholder="Busque uma categoria... (ex: Pedreiro, Design)"
                className="categoryInput"
            />
            {isOpen && (
                <div className="dropdownOptions">
                    {filtered.map(c => (
                        <div
                            key={c.id}
                            className="dropdownOption"
                            onClick={() => {
                                onChange(c.id)
                                setQuery('')
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
