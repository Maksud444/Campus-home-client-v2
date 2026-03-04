import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://baytino.com'
  const now = new Date()

  // Fetch live property IDs for dynamic routes
  let propertyUrls: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`https://student-housing-backend.vercel.app/api/properties?limit=200`, { next: { revalidate: 3600 } })
    const data = await res.json()
    if (data.success && data.properties) {
      propertyUrls = data.properties.map((p: any) => ({
        url: `${base}/properties/${p._id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch { /* ignore — static pages still included */ }

  return [
    { url: base,                         lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/properties`,         lastModified: now, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${base}/services`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/post`,               lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/login`,              lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/privacy-policy`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,              lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    ...propertyUrls,
  ]
}
