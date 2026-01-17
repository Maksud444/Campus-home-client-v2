export interface Service {
  id: string
  name: string
  icon: string
  description: string
  features: string[]
  providers: number
  priceRange: string
  rating: number
}

export const services: Service[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: '🔧',
    description: 'Professional plumbers for all your water and pipe needs',
    features: ['Pipe Repair', 'Water Heater', 'Leak Detection', 'Bathroom Fixtures'],
    providers: 156,
    priceRange: '100-300 EGP',
    rating: 4.8
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: '⚡',
    description: 'Licensed electricians for safe and reliable electrical work',
    features: ['Wiring', 'Circuit Breakers', 'Lighting', 'Power Systems'],
    providers: 142,
    priceRange: '150-400 EGP',
    rating: 4.7
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: '🧹',
    description: 'Professional cleaning services for homes and offices',
    features: ['Deep Cleaning', 'Regular Maintenance', 'Move-in/out', 'Sanitization'],
    providers: 203,
    priceRange: '80-200 EGP/hour',
    rating: 4.9
  },
  {
    id: 'ac',
    name: 'AC Repair',
    icon: '❄️',
    description: 'Expert AC repair and maintenance for all brands',
    features: ['Installation', 'Repair', 'Maintenance', 'Freon Refill'],
    providers: 128,
    priceRange: '200-500 EGP',
    rating: 4.6
  },
  {
    id: 'painting',
    name: 'Painting',
    icon: '🎨',
    description: 'Professional painters for interior and exterior work',
    features: ['Interior Painting', 'Exterior Painting', 'Decorative', 'Touch-ups'],
    providers: 98,
    priceRange: '50-100 EGP/sqm',
    rating: 4.7
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    icon: '🪚',
    description: 'Skilled carpenters for custom furniture and repairs',
    features: ['Custom Furniture', 'Door Repair', 'Cabinets', 'Wood Work'],
    providers: 89,
    priceRange: '200-600 EGP',
    rating: 4.8
  }
]