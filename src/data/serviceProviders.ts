export interface ServiceProvider {
  id: string
  name: string
  service: string
  location: string
  rating: number
  experience: string
  price: string
  image: string
  description: string
  available: boolean
  specialties: string[]
}

export const serviceProviders: ServiceProvider[] = [
  // Plumbing - Nasr City
  {
    id: '1',
    name: 'Ahmed Mohamed',
    service: 'plumbing',
    location: 'Nasr City',
    rating: 4.8,
    experience: '8 years',
    price: '150–300 EGP',
    image: 'https://ui-avatars.com/api/?name=Ahmed+Mohamed&background=219ebc&color=fff&size=200',
    description: 'Professional plumber specializing in repairs, installations, and maintenance.',
    available: true,
    specialties: ['Pipe Repair', 'Water Heater', 'Bathroom Fixtures']
  },
  {
    id: '2',
    name: 'Mohamed Hassan',
    service: 'plumbing',
    location: 'Nasr City',
    rating: 4.6,
    experience: '5 years',
    price: '120–250 EGP',
    image: 'https://ui-avatars.com/api/?name=Mohamed+Hassan&background=219ebc&color=fff&size=200',
    description: 'Experienced in residential and commercial plumbing services.',
    available: true,
    specialties: ['Leak Detection', 'Drain Cleaning', 'Pipe Installation']
  },

  // Plumbing - Maadi
  {
    id: '3',
    name: 'Omar Ali',
    service: 'plumbing',
    location: 'Maadi',
    rating: 4.9,
    experience: '10 years',
    price: '180–350 EGP',
    image: 'https://ui-avatars.com/api/?name=Omar+Ali&background=219ebc&color=fff&size=200',
    description: 'Expert plumber with a decade of experience in all plumbing needs.',
    available: true,
    specialties: ['Emergency Repairs', 'Water Systems', 'Kitchen Plumbing']
  },

  // Electrical - Nasr City
  {
    id: '4',
    name: 'Mahmoud Ibrahim',
    service: 'electrical',
    location: 'Nasr City',
    rating: 4.7,
    experience: '7 years',
    price: '200–400 EGP',
    image: 'https://ui-avatars.com/api/?name=Mahmoud+Ibrahim&background=219ebc&color=fff&size=200',
    description: 'Licensed electrician for all your electrical needs.',
    available: true,
    specialties: ['Wiring', 'Circuit Breakers', 'Lighting Installation']
  },
  {
    id: '5',
    name: 'Khaled Ahmed',
    service: 'electrical',
    location: 'Nasr City',
    rating: 4.5,
    experience: '6 years',
    price: '180–380 EGP',
    image: 'https://ui-avatars.com/api/?name=Khaled+Ahmed&background=219ebc&color=fff&size=200',
    description: 'Reliable electrical services for homes and offices.',
    available: true,
    specialties: ['Power Systems', 'Socket Installation', 'Electrical Repairs']
  },

  // Electrical - Heliopolis
  {
    id: '6',
    name: 'Youssef Mahmoud',
    service: 'electrical',
    location: 'Heliopolis',
    rating: 4.8,
    experience: '9 years',
    price: '220–450 EGP',
    image: 'https://ui-avatars.com/api/?name=Youssef+Mahmoud&background=219ebc&color=fff&size=200',
    description: 'Expert electrician with extensive commercial experience.',
    available: true,
    specialties: ['Smart Home Systems', 'Security Lighting', 'Panel Upgrades']
  },

  // Cleaning - Maadi
  {
    id: '7',
    name: 'Fatima Hassan',
    service: 'cleaning',
    location: 'Maadi',
    rating: 4.9,
    experience: '4 years',
    price: '100–200 EGP/hour',
    image: 'https://ui-avatars.com/api/?name=Fatima+Hassan&background=219ebc&color=fff&size=200',
    description: 'Professional cleaning services for apartments and villas.',
    available: true,
    specialties: ['Deep Cleaning', 'Move-in/out', 'Regular Maintenance']
  },
  {
    id: '8',
    name: 'Nour Mohamed',
    service: 'cleaning',
    location: 'Maadi',
    rating: 4.7,
    experience: '3 years',
    price: '90–180 EGP/hour',
    image: 'https://ui-avatars.com/api/?name=Nour+Mohamed&background=219ebc&color=fff&size=200',
    description: 'Thorough and reliable cleaning services.',
    available: true,
    specialties: ['Kitchen Cleaning', 'Bathroom Cleaning', 'Floor Polishing']
  },

  // AC Repair - New Cairo
  {
    id: '9',
    name: 'Hassan Ali',
    service: 'ac',
    location: 'New Cairo',
    rating: 4.8,
    experience: '12 years',
    price: '250–500 EGP',
    image: 'https://ui-avatars.com/api/?name=Hassan+Ali&background=219ebc&color=fff&size=200',
    description: 'AC repair and maintenance specialist for all brands.',
    available: true,
    specialties: ['AC Installation', 'Freon Refill', 'Maintenance']
  },
  {
    id: '10',
    name: 'Tarek Mahmoud',
    service: 'ac',
    location: 'New Cairo',
    rating: 4.6,
    experience: '8 years',
    price: '220–450 EGP',
    image: 'https://ui-avatars.com/api/?name=Tarek+Mahmoud&background=219ebc&color=fff&size=200',
    description: 'Expert in all AC systems and cooling solutions.',
    available: true,
    specialties: ['Split AC', 'Central AC', 'Emergency Repairs']
  },

  // Painting - Giza
  {
    id: '11',
    name: 'Ibrahim Youssef',
    service: 'painting',
    location: 'Giza',
    rating: 4.7,
    experience: '6 years',
    price: '50–100 EGP/sqm',
    image: 'https://ui-avatars.com/api/?name=Ibrahim+Youssef&background=219ebc&color=fff&size=200',
    description: 'Professional painter for interior and exterior work.',
    available: true,
    specialties: ['Interior Painting', 'Exterior Painting', 'Decorative Finishes']
  },

  // Carpentry - Zamalek
  {
    id: '12',
    name: 'Amr Khaled',
    service: 'carpentry',
    location: 'Zamalek',
    rating: 4.9,
    experience: '15 years',
    price: '300–600 EGP',
    image: 'https://ui-avatars.com/api/?name=Amr+Khaled&background=219ebc&color=fff&size=200',
    description: 'Master carpenter specializing in custom furniture and repairs.',
    available: true,
    specialties: ['Custom Furniture', 'Door Repair', 'Kitchen Cabinets']
  },
]

export const serviceLocations = [
  { name: 'Nasr City', count: 24 },
  { name: 'Maadi', count: 18 },
  { name: 'Heliopolis', count: 21 },
  { name: 'New Cairo', count: 19 },
  { name: 'Giza', count: 16 },
  { name: 'Zamalek', count: 12 },
]

export const getProvidersByService = (service: string) => {
  return serviceProviders.filter(p => p.service === service)
}

export const getProvidersByServiceAndLocation = (service: string, location: string) => {
  return serviceProviders.filter(p => p.service === service && p.location === location)
}
