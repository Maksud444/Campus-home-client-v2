export interface Property {
  city: string
  id: string
  title: string
  description: string
  type: 'apartment' | 'studio' | 'villa' | 'room'
  price: number
  location: string
  area: string // Neighborhood
  bedrooms: number
  bathrooms: number
  size: number // in sqm
  furnished: boolean
  verified: boolean
  availableFrom: string // ISO date
  images: string[]
  features: string[]
  owner: {
    id: string
    name: string
    phone: string
    email: string
    image: string
    verified: boolean
  }
  postedDate: string // ISO date
  views: number
  saved: number
}

export const properties: Property[] = [
  {
    id: '1',
    title: 'Modern 2BR Apartment in Nasr City',
    description: 'Beautiful modern apartment with 2 bedrooms, fully furnished with AC, washing machine, and all amenities. Located in a quiet area close to universities and public transport. Perfect for students or small families.',
    type: 'apartment',
    price: 4500,
    location: 'Nasr City',
    city: 'Nasr City',
    area: 'Street 9',
    bedrooms: 2,
    bathrooms: 1,
    size: 100,
    furnished: true,
    verified: true,
    availableFrom: '2025-01-15',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
    ],
    features: ['AC', 'Washing Machine', 'Balcony', 'Elevator', 'Security', 'Parking'],
    owner: {
      id: 'owner1',
      name: 'Mohamed Hassan',
      phone: '+20 100 123 4567',
      email: 'mohamed@example.com',
      image: 'https://ui-avatars.com/api/?name=Mohamed+Hassan&background=219ebc&color=fff',
      verified: true
    },
    postedDate: '2024-12-01T10:00:00Z',
    views: 234,
    saved: 45
  },
  {
    id: '2',
    title: 'Cozy Studio in Maadi',
    description: 'Fully furnished studio apartment perfect for single student. Includes all utilities, internet, and close to metro station. Safe and quiet neighborhood.',
    type: 'studio',
    price: 3200,
    location: 'Maadi',
    city: 'Maadi',
    area: 'Degla',
    bedrooms: 1,
    bathrooms: 1,
    size: 45,
    furnished: true,
    verified: true,
    availableFrom: '2025-01-01',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    ],
    features: ['AC', 'WiFi', 'Kitchen', 'Security', 'Near Metro'],
    owner: {
      id: 'owner2',
      name: 'Sarah Ahmed',
      phone: '+20 101 234 5678',
      email: 'sarah@example.com',
      image: 'https://ui-avatars.com/api/?name=Sarah+Ahmed&background=219ebc&color=fff',
      verified: true
    },
    postedDate: '2024-12-05T14:30:00Z',
    views: 189,
    saved: 32
  },
  {
    id: '3',
    title: 'Spacious 3BR in Heliopolis',
    description: 'Large apartment with 3 bedrooms, 2 bathrooms. Great for families or students sharing. Modern kitchen, large living room, and balcony. Near Cairo University.',
    type: 'apartment',
    price: 6000,
    location: 'Heliopolis',
    city: 'Heliopolis',
    area: 'Korba',
    bedrooms: 3,
    bathrooms: 2,
    size: 140,
    furnished: true,
    verified: true,
    availableFrom: '2025-02-01',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
    ],
    features: ['AC', 'Balcony', 'Parking', 'Elevator', 'Security', 'Storage'],
    owner: {
      id: 'owner3',
      name: 'Ahmed Ibrahim',
      phone: '+20 102 345 6789',
      email: 'ahmed@example.com',
      image: 'https://ui-avatars.com/api/?name=Ahmed+Ibrahim&background=219ebc&color=fff',
      verified: false
    },
    postedDate: '2024-12-03T09:15:00Z',
    views: 312,
    saved: 67
  },
  {
    id: '4',
    title: 'Luxury Villa in New Cairo',
    description: 'Beautiful standalone villa with garden, 4 bedrooms, 3 bathrooms. Perfect for large families. Includes maid room, garage for 2 cars, and swimming pool.',
    type: 'villa',
    price: 15000,
    location: 'New Cairo',
    city: 'New Cairo',
    area: 'Katameya',
    bedrooms: 4,
    bathrooms: 3,
    size: 300,
    furnished: true,
    verified: true,
    availableFrom: '2025-01-20',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
    ],
    features: ['Swimming Pool', 'Garden', 'Garage', 'Maid Room', 'Security', 'AC'],
    owner: {
      id: 'owner4',
      name: 'Khaled Youssef',
      phone: '+20 103 456 7890',
      email: 'khaled@example.com',
      image: 'https://ui-avatars.com/api/?name=Khaled+Youssef&background=219ebc&color=fff',
      verified: true
    },
    postedDate: '2024-12-08T11:00:00Z',
    views: 456,
    saved: 89
  },
  {
    id: '5',
    title: 'Affordable Room in Giza',
    description: 'Single room in shared apartment near Giza University. Shared kitchen and bathroom. Utilities included. Great for budget-conscious students.',
    type: 'room',
    price: 1500,
    location: 'Giza',
    city: 'Giza',
    area: 'Dokki',
    bedrooms: 1,
    bathrooms: 1,
    size: 15,
    furnished: true,
    verified: false,
    availableFrom: '2024-12-20',
    images: [
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'
    ],
    features: ['Shared Kitchen', 'WiFi', 'Near University', 'Utilities Included'],
    owner: {
      id: 'owner5',
      name: 'Omar Khaled',
      phone: '+20 104 567 8901',
      email: 'omar@example.com',
      image: 'https://ui-avatars.com/api/?name=Omar+Khaled&background=219ebc&color=fff',
      verified: false
    },
    postedDate: '2024-12-10T16:45:00Z',
    views: 167,
    saved: 23
  },
  {
    id: '6',
    title: 'Student-Friendly 2BR in Zamalek',
    description: 'Charming apartment in prestigious Zamalek area. Close to AUC and cultural centers. Fully furnished with modern amenities.',
    type: 'apartment',
    price: 7000,
    location: 'Zamalek',
    city: 'Zamalek',
    area: 'Zamalek Center',
    bedrooms: 2,
    bathrooms: 1,
    size: 90,
    furnished: true,
    verified: true,
    availableFrom: '2025-01-10',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    ],
    features: ['AC', 'Balcony', 'Near AUC', 'WiFi', 'Elevator'],
    owner: {
      id: 'owner6',
      name: 'Laila Hassan',
      phone: '+20 105 678 9012',
      email: 'laila@example.com',
      image: 'https://ui-avatars.com/api/?name=Laila+Hassan&background=219ebc&color=fff',
      verified: true
    },
    postedDate: '2024-12-07T13:20:00Z',
    views: 278,
    saved: 54
  }
]

export const locations = [
  'Nasr City',
  'Maadi',
  'Heliopolis',
  'New Cairo',
  'Giza',
  'Zamalek',
  'Downtown',
  '6th October'
]

export const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
  { value: 'room', label: 'Room' }
]