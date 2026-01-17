export interface Location {
  id: string
  name: string
  propertyCount: number
  image: string
  slug: string
}

export const locations: Location[] = [
  {
    id: '1',
    name: 'Nasr City',
    propertyCount: 124,
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
    slug: 'nasr-city'
  },
  {
    id: '2',
    name: 'Maadi',
    propertyCount: 98,
    image: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800',
    slug: 'maadi'
  },
  {
    id: '3',
    name: 'Heliopolis',
    propertyCount: 156,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    slug: 'heliopolis'
  },
  {
    id: '4',
    name: 'New Cairo',
    propertyCount: 203,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    slug: 'new-cairo'
  },
  {
    id: '5',
    name: 'Giza',
    propertyCount: 87,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    slug: 'giza'
  },
  {
    id: '6',
    name: 'Zamalek',
    propertyCount: 45,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    slug: 'zamalek'
  }
]