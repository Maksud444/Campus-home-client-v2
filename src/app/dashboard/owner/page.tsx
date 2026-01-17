'use client'

import Link from 'next/link'

export default function OwnerDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 fixed h-screen overflow-y-auto">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white font-extrabold text-2xl">
              C
            </div>
            <span className="text-2xl font-bold text-primary">Campus Home</span>
          </Link>

          <div className="mb-8 p-4 bg-bg-light rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                Y
              </div>
              <div>
                <div className="font-bold text-gray-900">Youssef Ibrahim</div>
                <div className="text-sm text-gray-600">Property Owner</div>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <Link href="/dashboard/owner" className="flex items-center gap-3 px-4 py-3 bg-bg-light text-primary rounded-xl font-semibold">
              <span className="text-xl">🏠</span>
              <span>Dashboard</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">🏢</span>
              <span>My Properties</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">➕</span>
              <span>Add Property</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">👥</span>
              <span>Tenants</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">💰</span>
              <span>Revenue</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">💬</span>
              <span>Messages</span>
            </Link>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Property Owner Dashboard 🏠</h1>
          <p className="text-gray-600 text-lg">Manage your properties and track revenue</p>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-3xl mb-2">🏢</div>
            <div className="text-4xl font-extrabold mb-1">8</div>
            <div className="text-green-100">Total Properties</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-4xl font-extrabold mb-1">15,600</div>
            <div className="text-blue-100">EGP Monthly Revenue</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-4xl font-extrabold mb-1">89%</div>
            <div className="text-purple-100">Occupancy Rate</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-4xl font-extrabold mb-1">4.9</div>
            <div className="text-orange-100">Average Rating</div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold mb-4">Monthly Revenue Breakdown</h3>
            <div className="space-y-4">
              {[
                { property: 'Nasr City Apartment', revenue: 4200, percent: 27 },
                { property: 'Maadi Studio', revenue: 3500, percent: 22 },
                { property: 'Heliopolis Villa', revenue: 6500, percent: 42 },
                { property: 'Giza Flat', revenue: 1400, percent: 9 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700 font-medium">{item.property}</span>
                    <span className="font-bold text-primary">{item.revenue} EGP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full" 
                      style={{width: `${item.percent}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold mb-4">Property Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <div>
                  <div className="text-sm text-gray-600">Occupied Units</div>
                  <div className="text-2xl font-bold text-green-700">7 / 8</div>
                </div>
                <div className="text-4xl">✅</div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div>
                  <div className="text-sm text-gray-600">Pending Payments</div>
                  <div className="text-2xl font-bold text-blue-700">2</div>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div>
                  <div className="text-sm text-gray-600">Maintenance Requests</div>
                  <div className="text-2xl font-bold text-purple-700">3</div>
                </div>
                <div className="text-4xl">🔧</div>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
            <button className="btn btn-primary">
              + Add New Property
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: '2BR Apartment', location: 'Nasr City', rent: 4200, status: 'Occupied', tenant: 'Ahmed Hassan' },
              { name: 'Studio', location: 'Maadi', rent: 3500, status: 'Occupied', tenant: 'Sarah Mohamed' },
              { name: '3BR Villa', location: 'Heliopolis', rent: 6500, status: 'Occupied', tenant: 'John Smith' },
              { name: '1BR Flat', location: 'Giza', rent: 2500, status: 'Vacant', tenant: null },
            ].map((property, i) => (
              <div key={i} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-primary">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{property.name}</h3>
                    <p className="text-gray-600 text-sm">📍 {property.location}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    property.status === 'Occupied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {property.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">Monthly Rent</div>
                  <div className="text-2xl font-bold text-primary">{property.rent} EGP</div>
                </div>

                {property.tenant && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Current Tenant</div>
                    <div className="font-semibold">{property.tenant}</div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 btn btn-outline text-sm py-2">View</button>
                  <button className="flex-1 btn btn-primary text-sm py-2">Manage</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { icon: '💰', title: 'Payment Received', description: 'Ahmed Hassan paid 4,200 EGP for Nasr City Apartment', time: '2 hours ago', type: 'success' },
              { icon: '🔧', title: 'Maintenance Request', description: 'Sarah Mohamed requested plumbing service at Maadi Studio', time: '5 hours ago', type: 'warning' },
              { icon: '📝', title: 'New Inquiry', description: 'John inquired about your vacant property in Giza', time: '1 day ago', type: 'info' },
              { icon: '⭐', title: 'New Review', description: 'Ahmed left a 5-star review for your property', time: '2 days ago', type: 'success' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  activity.type === 'success' ? 'bg-green-100' :
                  activity.type === 'warning' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold mb-1">{activity.title}</div>
                  <div className="text-sm text-gray-600 mb-1">{activity.description}</div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
                <button className="text-primary hover:bg-bg-light px-3 py-2 rounded-lg font-semibold text-sm">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
