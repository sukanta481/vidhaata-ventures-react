export function formatINR(price: number | string, status?: string) {
  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice === 0) return 'Price on Request';

  let formatted = '';
  if (numPrice >= 10000000) {
    formatted = `₹${(numPrice / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  } else if (numPrice >= 100000) {
    formatted = `₹${(numPrice / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  } else if (numPrice >= 1000) {
    formatted = `₹${(numPrice / 1000).toFixed(2).replace(/\.00$/, '')} K`;
  } else {
    formatted = `₹${numPrice}`;
  }

  return status === 'for_rent' ? `${formatted}/month` : formatted;
}

export function formatINRCompact(price: number | string) {
  return formatINR(price);
}

export function formatBathrooms(bathrooms: number | string) {
  return Math.round(Number(bathrooms || 0));
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
