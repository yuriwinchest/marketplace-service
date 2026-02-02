import { formatCurrency } from '../utils/formatters'

interface Stats {
    count: number
    average_value: number
    professionals: { name: string; avatar_url: string | null }[]
}

interface ServiceStatsProps {
    stats: Stats | null
}

export function ServiceStats({ stats }: ServiceStatsProps) {
    if (!stats) return null

    return (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <h4>Estatísticas da Demanda (Atualizado)</h4>
            <div className="detailList">
                <div className="detailRow">
                    <span className="label">Propostas Recebidas</span>
                    <span className="value">{stats.count}</span>
                </div>
                <div className="detailRow">
                    <span className="label">Média de Preço</span>
                    <span className="value">{formatCurrency(stats.average_value)}</span>
                </div>
            </div>
            {stats.professionals && stats.professionals.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                    <span className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>Propostas de:</span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {stats.professionals.map((p, i) => (
                            <div key={i} title={p.name} style={{
                                width: '32px', height: '32px', borderRadius: '50%', background: '#444',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', overflow: 'hidden'
                            }}>
                                {p.avatar_url ? (
                                    <img src={p.avatar_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span>{p.name.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        ))}
                        {stats.count > (stats.professionals?.length || 0) && (
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%', background: '#333',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#aaa'
                            }}>
                                +{stats.count - (stats.professionals?.length || 0)}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
