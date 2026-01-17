'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function AgentDashboard() {
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
                M
              </div>
              <div>
                <div className="font-bold text-gray-900">Mohamed Ali</div>
                <div className="text-sm text-gray-600">Agent</div>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <Link href="/dashboard/agent" className="flex items-center gap-3 px-4 py-3 bg-bg-light text-primary rounded-xl font-semibold">
              <span className="text-xl">🏠</span>
              <span>Dashboard</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">📝</span>
              <span>My Listings</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">➕</span>
              <span>Add Property</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">📊</span>
              <span>Analytics</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">💬</span>
              <span>Messages</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">⭐</span>
              <span>Reviews</span>
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
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Agent Dashboard 👨‍💼</h1>
          <p className="text-gray-600 text-lg">Manage your property listings and clients</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">🏢</div>
            <div className="text-4xl font-extrabold mb-1">24</div>
            <div className="text-blue-100">Active Listings</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">👁️</div>
            <div className="text-4xl font-extrabold mb-1">1,234</div>
            <div className="text-green-100">Total Views</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">📩</div>
            <div className="text-4xl font-extrabold mb-1">45</div>
            <div className="text-purple-100">Inquiries</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-4xl font-extrabold mb-1">4.8</div>
            <div className="text-orange-100">Rating</div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold mb-4">Monthly Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Property Views</span>
                  <span className="font-bold">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-primary h-3 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Inquiries</span>
                  <span className="font-bold">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{width: '72%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Closed Deals</span>
                  <span className="font-bold">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Properties Listed This Month</span>
                <span className="font-bold text-primary text-xl">8</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Average Response Time</span>
                <span className="font-bold text-green-600 text-xl">2.5h</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Conversion Rate</span>
                <span className="font-bold text-blue-600 text-xl">35%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Active Listings</h2>
            <button className="btn btn-primary">
              + Add New Property
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Property</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Views</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: '2BR Apartment', location: 'Nasr City', price: '3,500', views: '234', status: 'Active' },
                  { name: 'Studio', location: 'Maadi', price: '2,800', views: '189', status: 'Active' },
                  { name: '3BR Villa', location: 'New Cairo', price: '6,500', views: '567', status: 'Active' },
                  { name: '1BR Flat', location: 'Heliopolis', price: '2,500', views: '145', status: 'Pending' },
                ].map((property, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="font-semibold">{property.name}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{property.location}</td>
                    <td className="py-4 px-4 font-bold text-primary">{property.price} EGP</td>
                    <td className="py-4 px-4 text-gray-600">👁️ {property.views}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        property.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button className="text-primary hover:bg-bg-light p-2 rounded-lg">Edit</button>
                        <button className="text-red-600 hover:bg-red-50 p-2 rounded-lg">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Inquiries</h2>
          <div className="space-y-4">
            {[
              { name: 'Sarah Ahmed', property: '2BR in Nasr City', time: '2 hours ago', status: 'New' },
              { name: 'John Smith', property: 'Studio in Maadi', time: '5 hours ago', status: 'Replied' },
              { name: 'Fatima Hassan', property: '3BR Villa', time: '1 day ago', status: 'Scheduled' },
            ].map((inquiry, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                      {inquiry.name[0]}
                    </div>
                    <div>
                      <div className="font-bold">{inquiry.name}</div>
                      <div className="text-sm text-gray-600">{inquiry.property}</div>
                      <div className="text-xs text-gray-500">{inquiry.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      inquiry.status === 'New' ? 'bg-blue-100 text-blue-700' :
                      inquiry.status === 'Replied' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {inquiry.status}
                    </span>
                    <button className="btn btn-primary text-sm">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
