import type { Service } from '@/data/services'

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="card p-8 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-primary">
      <div className="text-6xl text-center mb-6">{service.icon}</div>
      
      <h3 className="text-2xl font-bold text-center mb-3">{service.name}</h3>
      
      <p className="text-gray-600 text-center mb-6">{service.description}</p>
      
      <ul className="space-y-2 mb-6">
        {service.features.map((feature, index) => (
          <li key={index} className="text-gray-700 flex items-start gap-2">
            <span className="text-primary font-bold">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <div className="pt-6 border-t border-gray-100 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Providers:</span>
          <span className="font-semibold">{service.providers}</span>
        </div>
        <div className="flex justify-between">
          <span>Price Range:</span>
          <span className="font-semibold">{service.priceRange}</span>
        </div>
        <div className="flex justify-between">
          <span>Rating:</span>
          <span className="font-semibold text-primary">⭐ {service.rating}</span>
        </div>
      </div>
      
      <button className="w-full btn btn-primary mt-6">
        View Providers
      </button>
    </div>
  )
}
