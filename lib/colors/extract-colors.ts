/**
 * Server-side color extraction from cover images.
 * Fetches the image, draws it to an OffscreenCanvas-like buffer,
 * and returns the dominant color.
 */

interface ExtractedColors {
  dominant: [number, number, number]
  isVibrant: boolean
}

const DEFAULT_COLOR: [number, number, number] = [14, 216, 148] // green-accent

function getSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  if (max === 0) return 0
  return (max - min) / max
}

function getLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function boostSaturation(r: number, g: number, b: number, factor: number): [number, number, number] {
  const avg = (r + g + b) / 3
  return [
    Math.min(255, Math.max(0, Math.round(avg + (r - avg) * factor))),
    Math.min(255, Math.max(0, Math.round(avg + (g - avg) * factor))),
    Math.min(255, Math.max(0, Math.round(avg + (b - avg) * factor))),
  ]
}

/**
 * Simple dominant color extraction using pixel sampling.
 * Works server-side without Canvas by fetching raw image bytes
 * and decoding with sharp (if available) or a simple fetch + sampling approach.
 */
export async function extractColorsFromUrl(url: string): Promise<ExtractedColors> {
  try {
    // Dynamically import sharp for server-side image processing
    const sharp = (await import('sharp')).default

    const response = await fetch(url, { next: { revalidate: 3600 } })
    if (!response.ok) return { dominant: DEFAULT_COLOR, isVibrant: true }

    const buffer = Buffer.from(await response.arrayBuffer())

    // Resize to tiny image for fast color sampling
    const { data, info } = await sharp(buffer)
      .resize(16, 16, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Count colors using a simple histogram approach
    const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>()

    for (let i = 0; i < info.width * info.height; i++) {
      const r = data[i * 3]
      const g = data[i * 3 + 1]
      const b = data[i * 3 + 2]

      // Skip very dark or very light pixels
      const lum = getLuminance(r, g, b)
      if (lum < 0.08 || lum > 0.92) continue

      // Quantize to reduce noise (bucket by 32)
      const qr = Math.round(r / 32) * 32
      const qg = Math.round(g / 32) * 32
      const qb = Math.round(b / 32) * 32
      const key = `${qr},${qg},${qb}`

      const existing = colorBuckets.get(key)
      if (existing) {
        existing.r += r
        existing.g += g
        existing.b += b
        existing.count++
      } else {
        colorBuckets.set(key, { r, g, b, count: 1 })
      }
    }

    if (colorBuckets.size === 0) return { dominant: DEFAULT_COLOR, isVibrant: true }

    // Find the most frequent color bucket, weighted by saturation
    let bestBucket = { r: 0, g: 0, b: 0, count: 0 }
    let bestScore = 0

    for (const bucket of colorBuckets.values()) {
      const avgR = bucket.r / bucket.count
      const avgG = bucket.g / bucket.count
      const avgB = bucket.b / bucket.count
      const sat = getSaturation(avgR, avgG, avgB)
      // Score: frequency × (1 + saturation boost)
      const score = bucket.count * (1 + sat * 2)
      if (score > bestScore) {
        bestScore = score
        bestBucket = bucket
      }
    }

    let r = Math.round(bestBucket.r / bestBucket.count)
    let g = Math.round(bestBucket.g / bestBucket.count)
    let b = Math.round(bestBucket.b / bestBucket.count)

    const sat = getSaturation(r, g, b)
    const lum = getLuminance(r, g, b)

    // Fallback if too desaturated
    if (sat < 0.08) return { dominant: DEFAULT_COLOR, isVibrant: false }

    // Boost if somewhat desaturated
    if (sat < 0.25) {
      ;[r, g, b] = boostSaturation(r, g, b, 1.8)
    }

    // Lighten if too dark
    if (lum < 0.2) {
      r = Math.min(255, Math.round(r * 1.5))
      g = Math.min(255, Math.round(g * 1.5))
      b = Math.min(255, Math.round(b * 1.5))
    }

    return {
      dominant: [r, g, b],
      isVibrant: sat > 0.15,
    }
  } catch (error) {
    console.error('Color extraction failed:', error)
    return { dominant: DEFAULT_COLOR, isVibrant: true }
  }
}
