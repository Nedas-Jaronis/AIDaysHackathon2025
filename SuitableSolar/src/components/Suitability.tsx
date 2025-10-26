export const getSuitabilityColor = (score: number) => {
    if (score >= 90) return 'var(--color-success)'
    if (score >= 75) return 'var(--color-warning)'
    return 'var(--color-error)'
  }

export const getSuitabilityLabel = (score: number) => {
if (score >= 90) return 'Excellent'
if (score >= 75) return 'Good'
if (score >= 60) return 'Fair'
return 'Poor'
}