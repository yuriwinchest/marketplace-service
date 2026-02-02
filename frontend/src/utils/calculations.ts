
export function calculateProposalValues(inputValue: number) {
    const numericValue = inputValue || 0
    const platformFee = numericValue * 0.05
    const clientPrice = numericValue + platformFee
    return { numericValue, platformFee, clientPrice }
}
