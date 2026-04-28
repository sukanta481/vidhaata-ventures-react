export function formatINR(price: number, status: string) {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

  return status === 'for_rent' ? `${formatted}/month` : formatted
}

export function formatINRCompact(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(price)
}

export function isCommercialProperty(propertyType: string) {
  return propertyType === 'commercial'
}

export function parsePropertyDescription(description: string) {
  const [summary, ...rest] = description.split('\n\n')
  const metadata: Record<string, string> = {}
  const metadataText = rest.join('\n').trim()

  if (metadataText) {
    for (const line of metadataText.split('\n')) {
      const [rawKey, ...valueParts] = line.split(':')
      const value = valueParts.join(':').trim()
      if (!rawKey || !value) continue

      metadata[rawKey.trim().toLowerCase()] = value
    }
  }

  return {
    summary: summary.trim(),
    metadata,
  }
}
