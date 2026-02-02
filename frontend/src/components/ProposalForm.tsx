import { formatCurrency } from '../utils/formatters'
import type { useProposal } from '../hooks/useProposal'

type UseProposalReturn = ReturnType<typeof useProposal>

interface ProposalFormProps {
    proposal: UseProposalReturn['proposal']
    updateProposal: UseProposalReturn['updateProposal']
    submitProposal: UseProposalReturn['submitProposal']
    sending: boolean
    financials: UseProposalReturn['financials']
    onCancel: () => void
}

export function ProposalForm({
    proposal,
    updateProposal,
    submitProposal,
    sending,
    financials,
    onCancel
}: ProposalFormProps) {
    return (
        <div className="card" style={{ marginTop: '2rem', border: '2px solid #3b82f6' }}>
            <h3>Enviar Proposta</h3>
            <form onSubmit={submitProposal}>
                <div className="formGroup">
                    <label>Seu Valor (R$)</label>
                    <input
                        type="number"
                        required
                        min="0"
                        value={proposal.value}
                        onChange={e => updateProposal('value', e.target.value)}
                        placeholder="0.00"
                    />
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Taxa de Serviço (5%):</span>
                            <span>+ {formatCurrency(financials.platformFee)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '0.25rem', color: '#fff' }}>
                            <span>Valor Final para o Cliente:</span>
                            <span>{formatCurrency(financials.clientPrice)}</span>
                        </div>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                            * O cliente visualizará o valor final de {formatCurrency(financials.clientPrice)}.
                        </p>
                    </div>
                </div>
                <div className="formGroup">
                    <label>Prazo Estimado (dias)</label>
                    <input
                        type="number"
                        required
                        min="1"
                        value={proposal.estimatedDays}
                        onChange={e => updateProposal('estimatedDays', e.target.value)}
                        placeholder="EX: 5"
                    />
                </div>
                <div className="formGroup">
                    <label>Descrição da Proposta</label>
                    <textarea
                        required
                        rows={4}
                        value={proposal.description}
                        onChange={e => updateProposal('description', e.target.value)}
                        placeholder="Descreva detalhes da sua proposta, o que está incluso, etc."
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btnPrimary" disabled={sending}>
                        {sending ? 'Enviando...' : 'Enviar Proposta'}
                    </button>
                    <button
                        type="button"
                        className="btnSecondary"
                        onClick={onCancel}
                        disabled={sending}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    )
}
