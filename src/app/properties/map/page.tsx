'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

interface Property {
  _id: string
  title: string
  price: number
  type: string
  propertyType: string
  bedrooms: number
  images: Array<{ url: string }>
  location: {
    city: string
    area: string
    address: string
  }
}

interface SearchResult {
  place_id: string
  display_name: string
  lat: string
  lon: string
  type: string
}

// Coordinates for Cairo areas (English + Arabic names)
const areaCoordinates: Record<string, [number, number]> = {
  'Cairo': [30.0444, 31.2357],
  'Downtown Cairo': [30.0512, 31.2472],
  'Nasr City': [30.0624, 31.3252],
  'New Cairo': [30.0200, 31.4700],
  'Fifth Settlement': [30.0200, 31.4700],
  'Maadi': [29.9592, 31.2569],
  'Zamalek': [30.0683, 31.2189],
  'Dokki': [30.0609, 31.1985],
  'Mohandessin': [30.0609, 31.1985],
  'Heliopolis': [30.0878, 31.3218],
  'Ain Shams': [30.1100, 31.3200],
  '6th of October': [29.9402, 30.9184],
  '6th October': [29.9402, 30.9184],
  'October City': [29.9402, 30.9184],
  'Giza': [30.0131, 31.2089],
  'Shubra': [30.1100, 31.2450],
  'Abbasia': [30.0700, 31.2802],
  'Ramses': [30.0628, 31.2513],
  'Garden City': [30.0381, 31.2306],
  'Tahrir': [30.0443, 31.2357],
  'Agouza': [30.0662, 31.2097],
  'Madinet Nasr': [30.0624, 31.3252],
  'ابو يوسف (تبة)': [30.0558, 31.2472],
  'باب الشرعية': [30.0592, 31.2528],
  'باب الفطور': [30.0583, 31.2502],
  'بركات (دراسة)': [30.0578, 31.2618],
  'تبة': [30.0563, 31.2479],
  'التجمع الخامس': [30.0200, 31.4700],
  'حي الثامن': [30.0610, 31.3255],
  'حي العاشر': [30.0620, 31.3265],
  'حي السابع': [30.0600, 31.3245],
  'خان خليل': [30.0467, 31.2627],
  'دراسة': [30.0578, 31.2615],
  'دوية': [30.0540, 31.2488],
  'دجلة المعادي': [29.9600, 31.2578],
  'رمسيس': [30.0628, 31.2513],
  'زهراء': [30.0558, 31.2452],
  'زهراء المعادي': [29.9572, 31.2542],
  'ميدان التحرير': [30.0443, 31.2357],
  'سيدة عائشة': [30.0448, 31.2502],
  'سيدة زينب': [30.0412, 31.2492],
  'عتبة': [30.0522, 31.2472],
  'عباسية': [30.0700, 31.2802],
  'عبدي باشا': [30.0532, 31.2462],
  'عباس العقاد': [30.0652, 31.3202],
  'مستشفى حسين': [30.0502, 31.2612],
  'مدينة البعوث': [30.0607, 31.2625],
  'منهل': [30.0482, 31.2462],
  'مكرم عبيد': [30.0622, 31.3302],
  'مدينة نصر': [30.0624, 31.3252],
  'مصطفى النحاس': [30.0642, 31.3222],
  'مقطم': [30.0150, 31.2952],
  'معادي': [29.9592, 31.2569],
  'مهندسين': [30.0609, 31.1985],
  'نادي غمالية': [30.0512, 31.2622],
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  // Search state
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${API_URL}/api/properties`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        const data = await response.json()
        if (data.success) setProperties(data.properties)
      } catch (err) {
        console.error('Map fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced Nominatim search
  const handleSearchInput = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim() || value.length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=6&countrycodes=eg&addressdetails=1`,
          { headers: { 'Accept-Language': 'en,ar' } }
        )
        const data: SearchResult[] = await res.json()
        setResults(data)
        setShowDropdown(data.length > 0)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }, [])

  // Fly to selected location
  const handleSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat)
    const lon = parseFloat(result.lon)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 15, { animate: true, duration: 1.2 })
    }
    setQuery(result.display_name.split(',')[0])
    setShowDropdown(false)
    setResults([])
  }

  // Build map
  useEffect(() => {
    if (loading || !mapRef.current || properties.length === 0) return

    import('leaflet').then((L) => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      const map = (L as any).map(mapRef.current!, {
        center: [30.0444, 31.2357],
        zoom: 12,
        zoomControl: true,
      })
      mapInstanceRef.current = map

      ;(L as any).tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map)

      const grouped: Record<string, Property[]> = {}
      properties.forEach((property) => {
        const area = property.location?.area || property.location?.city || 'Cairo'
        if (!grouped[area]) grouped[area] = []
        grouped[area].push(property)
      })

      Object.entries(grouped).forEach(([area, areaProps]) => {
        const coords = areaCoordinates[area] || [30.0444, 31.2357] as [number, number]
        const firstProp = areaProps[0]
        const imgUrl = firstProp.images?.[0]?.url || ''

        const markerHtml = `
          <div style="position:relative;width:64px;cursor:pointer;">
            <div style="width:56px;height:56px;border-radius:50%;border:3px solid #6366f1;overflow:hidden;background:#e5e7eb;box-shadow:0 4px 14px rgba(0,0,0,0.35);margin:0 auto;">
              ${imgUrl
                ? `<img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" />`
                : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22px;">🏠</div>`
              }
            </div>
            <div style="position:absolute;top:-6px;right:2px;background:#6366f1;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${areaProps.length}</div>
            <div style="margin-top:5px;text-align:center;background:white;color:#1f2937;padding:2px 6px;border-radius:5px;font-size:10px;font-weight:600;white-space:nowrap;max-width:100px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 6px rgba(0,0,0,0.2);margin-left:50%;transform:translateX(-50%);display:inline-block;">${area}</div>
          </div>
        `

        const icon = (L as any).divIcon({
          html: markerHtml,
          className: '',
          iconSize: [64, 88],
          iconAnchor: [32, 72],
          popupAnchor: [0, -75],
        })

        const marker = (L as any).marker(coords, { icon }).addTo(map)

        const popupContent = `
          <div style="min-width:220px;max-width:260px;max-height:320px;overflow-y:auto;font-family:system-ui,sans-serif;">
            <div style="font-weight:700;font-size:13px;color:#1f2937;padding:0 0 8px;border-bottom:1px solid #e5e7eb;margin-bottom:8px;">
              ${area}
              <span style="background:#eef2ff;color:#6366f1;font-size:11px;padding:1px 7px;border-radius:99px;margin-left:6px;">${areaProps.length}</span>
            </div>
            ${areaProps.map((p) => `
              <a href="/properties/${p._id}"
                onclick="event.preventDefault();window.location.href='/properties/${p._id}';"
                style="display:flex;align-items:center;gap:10px;padding:7px 6px;border-radius:8px;margin-bottom:4px;background:#f9fafb;text-decoration:none;color:inherit;cursor:pointer;"
                onmouseover="this.style.background='#eef2ff'" onmouseout="this.style.background='#f9fafb'"
              >
                <div style="width:42px;height:42px;border-radius:7px;overflow:hidden;flex-shrink:0;background:#e5e7eb;">
                  ${p.images?.[0]?.url
                    ? `<img src="${p.images[0].url}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" />`
                    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px;">🏠</div>`
                  }
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:12px;font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    ${p.title.length > 36 ? p.title.slice(0, 36) + '…' : p.title}
                  </div>
                  <div style="font-size:12px;color:#6366f1;font-weight:700;margin-top:2px;">
                    ${p.price ? p.price.toLocaleString() + ' EGP/mo' : '—'}
                  </div>
                  ${p.bedrooms ? `<div style="font-size:10px;color:#6b7280;margin-top:1px;">🛏 ${p.bedrooms} bed</div>` : ''}
                </div>
              </a>
            `).join('')}
          </div>
        `

        marker.bindPopup(popupContent, { maxWidth: 280, closeButton: true })
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [properties, loading])

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)', marginTop: '64px' }}>

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Back */}
          <Link
            href="/properties"
            className="flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors text-sm font-medium flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

          {/* Title */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="font-bold text-gray-900 text-sm hidden sm:inline">Map</span>
          </div>

          {!loading && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
              {properties.length}
            </span>
          )}

          {/* ── Location Search Box ── */}
          <div ref={searchRef} className="flex-1 relative max-w-md ml-auto">
            <div className="relative flex items-center">
              {/* Search icon */}
              <svg
                className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <input
                type="text"
                value={query}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => results.length > 0 && setShowDropdown(true)}
                placeholder="Search location..."
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />

              {/* Clear button */}
              {query && (
                <button
                  onClick={() => { setQuery(''); setResults([]); setShowDropdown(false) }}
                  className="absolute right-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Spinner */}
              {searching && (
                <div className="absolute right-2.5 w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* Dropdown results */}
            {showDropdown && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden">
                {results.map((result) => (
                  <button
                    key={result.place_id}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-indigo-50 transition-colors text-left border-b border-gray-50 last:border-0"
                  >
                    <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate leading-snug">
                        {result.display_name.split(',')[0]}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {result.display_name.split(',').slice(1, 3).join(',')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ isolation: 'isolate' }}>
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mb-4" />
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        ) : null}
        <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />
      </div>
    </div>
  )
}
