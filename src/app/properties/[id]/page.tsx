import type { Metadata } from 'next'
import PropertyDetailClient from './PropertyDetailClient'

const API_URL = 'https://student-housing-backend.vercel.app'
const BASE_URL = 'https://baytino.com'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/api/properties/${params.id}`, {
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    if (data.success && data.property) {
      const p = data.property
      const area = p.location?.area || ''
      const city = p.location?.city || 'Cairo'
      const price = p.price ? `${Number(p.price).toLocaleString()} EGP/month` : ''
      const beds = p.bedrooms ? `${p.bedrooms} bed` : ''
      const baths = p.bathrooms ? `${p.bathrooms} bath` : ''
      const details = [beds, baths, price].filter(Boolean).join(' · ')

      const title = `${p.title} | ${area}${city ? `, ${city}` : ''}`
      const description = p.description
        ? p.description.slice(0, 155).replace(/\n/g, ' ')
        : `${p.propertyType || 'Property'} for ${p.type} in ${area}, ${city}, Egypt. ${details}. Contact on WhatsApp.`

      const imageUrl = p.images?.[0]?.url || `${BASE_URL}/og-image.png`
      const url = `${BASE_URL}/properties/${params.id}`

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: p.title,
        description: description,
        url,
        image: imageUrl,
        offers: p.price ? {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: 'EGP',
          availability: 'https://schema.org/InStock',
        } : undefined,
        address: {
          '@type': 'PostalAddress',
          addressLocality: area,
          addressRegion: city,
          addressCountry: 'EG',
        },
        numberOfRooms: p.bedrooms,
        floorSize: p.area ? { '@type': 'QuantitativeValue', value: p.area, unitCode: 'MTK' } : undefined,
      }

      return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
          title,
          description,
          url,
          type: 'website',
          images: [{ url: imageUrl, width: 1200, height: 630, alt: p.title }],
          siteName: 'Baytino',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [imageUrl],
        },
        other: {
          'script:ld+json': JSON.stringify(jsonLd),
        },
      }
    }
  } catch { /* fallback below */ }

  return {
    title: 'Property Listing | Baytino',
    description: 'View student housing listings in Egypt on Baytino.',
  }
}

export default function PropertyDetailPage() {
  return <PropertyDetailClient />
}
