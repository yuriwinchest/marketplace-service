import { useState } from 'react'
import { calculateProposalValues } from '../utils/calculations'

interface ProposalState {
    value: string
    description: string
    estimatedDays: string
}

interface UseProposalProps {
    serviceId: string
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
    onSuccess: () => void
    onError: (msg: string) => void
}

export function useProposal({ serviceId, apiFetch, onSuccess, onError }: UseProposalProps) {
    const [sending, setSending] = useState(false)
    const [proposal, setProposal] = useState<ProposalState>({
        value: '',
        description: '',
        estimatedDays: ''
    })

    const updateProposal = (field: keyof ProposalState, value: string) => {
        setProposal(prev => ({ ...prev, [field]: value }))
    }

    const { platformFee, clientPrice } = calculateProposalValues(Number(proposal.value))

    const submitProposal = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        try {
            const res = await apiFetch('/api/proposals', {
                method: 'POST',
                body: JSON.stringify({
                    serviceRequestId: serviceId,
                    value: Number(proposal.value),
                    description: proposal.description,
                    estimatedDays: Number(proposal.estimatedDays)
                })
            })

            if (res.ok) {
                onSuccess()
            } else {
                const data = await res.json()
                onError(data.error || 'Erro ao enviar proposta')
            }
        } catch {
            onError('Erro de conexão')
        } finally {
            setSending(false)
        }
    }

    return {
        proposal,
        updateProposal,
        submitProposal,
        sending,
        financials: { platformFee, clientPrice }
    }
}
