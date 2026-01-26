export interface Property {
  _id: string
  id?: string
  title: string
  description: string
  type: string
  price: number | null
  location: string
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  images: string[]
  propertyType: string
  featured?: boolean
}

// Empty array - Backend থেকে data আসবে
export const properties: Property[] = []