import type { Service } from '../types'

export const formatDate = (iso: string) => {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export const formatTimeAgo = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 60) return `${minutes}min atras`
    if (hours < 24) return `${hours}h atras`
    return `${days}d atras`
}

export const urgencyLabel = (u: string) => {
    if (u === 'high') return 'Urgente'
    if (u === 'low') return 'Baixa'
    return 'Media'
}

export const urgencyClass = (u: string) => {
    if (u === 'high') return 'badge-danger'
    if (u === 'low') return 'badge-success'
    return 'badge-warning'
}

export const statusLabel = (s: string) => {
    if (s === 'open') return 'Aberto'
    if (s === 'in_progress' || s === 'matched') return 'Em andamento'
    if (s === 'completed' || s === 'closed') return 'Concluido'
    if (s === 'cancelled') return 'Cancelado'
    return s
}

export const statusClass = (s: string) => {
    if (s === 'open') return 'badge-primary'
    if (s === 'in_progress' || s === 'matched') return 'badge-warning'
    if (s === 'completed' || s === 'closed') return 'badge-success'
    if (s === 'cancelled') return 'badge-danger'
    return 'badge-secondary'
}

export const formatLocation = (s: Service) => {
    if (s.location_scope === 'national') return 'Todo o Brasil'
    if (s.location_scope === 'state') return `Estado: ${s.uf}`
    if (s.location_scope === 'city') return `${s.city} - ${s.uf}`
    return s.region_name || 'Regiao nao informada'
}
