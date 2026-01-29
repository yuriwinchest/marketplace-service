import { useEffect, useState } from 'react'

type Scope = 'national' | 'state' | 'city'

interface LocationSelectorProps {
  value: {
    scope: Scope
    uf: string
    city: string
  }
  onChange: (value: { scope: Scope; uf: string; city: string }) => void
}

interface IBGEState {
  id: number
  sigla: string
  nome: string
}

interface IBGECity {
  id: number
  nome: string
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [states, setStates] = useState<IBGEState[]>([])
  const [cities, setCities] = useState<IBGECity[]>([])
  const [loadingStates, setLoadingStates] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then(data => setStates(data))
      .catch(err => console.error('Failed to fetch states', err))
      .finally(() => setLoadingStates(false))
  }, [])

  useEffect(() => {
    let active = true
    const loadCities = async () => {
      setLoadingCities(true)
      try {
        const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${value.uf}/municipios?orderBy=nome`)
        if (active) {
          const data = await res.json()
          setCities(data)
        }
      } catch (err) {
        if (active) console.error('Failed to fetch cities', err)
      } finally {
        if (active) setLoadingCities(false)
      }
    }

    if (value.uf) {
      loadCities()
    } else {
      setCities([])
    }
    return () => { active = false }
  }, [value.uf])

  const handleScopeChange = (newScope: Scope) => {
    onChange({
      ...value,
      scope: newScope,
      // Reset fields based on scope reduction
      uf: newScope === 'national' ? '' : value.uf,
      city: newScope !== 'city' ? '' : value.city
    })
  }

  return (
    <div className="location-selector">
      <div className="form-group">
        <label>Abrangência</label>
        <div className="scope-options">
          <label>
            <input
              type="radio"
              name="scope"
              checked={value.scope === 'national'}
              onChange={() => handleScopeChange('national')}
            />
            Todo o Brasil
          </label>
          <label>
            <input
              type="radio"
              name="scope"
              checked={value.scope === 'state'}
              onChange={() => handleScopeChange('state')}
            />
            Por Estado
          </label>
          <label>
            <input
              type="radio"
              name="scope"
              checked={value.scope === 'city'}
              onChange={() => handleScopeChange('city')}
            />
            Por Cidade
          </label>
        </div>
      </div>

      {value.scope !== 'national' && (
        <div className="form-group">
          <label>Estado (UF)</label>
          <select
            className="form-control"
            value={value.uf}
            onChange={(e) => onChange({ ...value, uf: e.target.value, city: '' })}
            disabled={loadingStates}
          >
            <option value="">Selecione um estado...</option>
            {states.map(state => (
              <option key={state.id} value={state.sigla}>
                {state.nome} ({state.sigla})
              </option>
            ))}
          </select>
        </div>
      )}

      {value.scope === 'city' && value.uf && (
        <div className="form-group">
          <label>Cidade</label>
          <select
            className="form-control"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            disabled={loadingCities || !value.uf}
          >
            <option value="">Selecione uma cidade...</option>
            {cities.map(city => (
              <option key={city.id} value={city.nome}>
                {city.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      <style>{`
        .location-selector {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: rgba(255,255,255,0.03);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .scope-options {
          display: flex;
          gap: 1.5rem;
          margin-top: 0.5rem;
        }
        .scope-options label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: normal;
        }
      `}</style>
    </div>
  )
}
