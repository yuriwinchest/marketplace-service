
import { useState, useEffect } from 'react'
import type { Category } from '../types'

interface CategorySelectorProps {
    categories: Category[]
    value: string
    onChange: (id: string) => void
}

export function CategorySelector({ categories, value, onChange }: CategorySelectorProps) {
    const [display, setDisplay] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    // Sync display with selected value
    useEffect(() => {
        if (value) {
            const cat = categories.find(c => c.id === value)
            if (cat) setDisplay(cat.name)
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
                    if (e.target.value === '') onChange('')
                }}
                onFocus={() => setIsOpen(true)}
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
