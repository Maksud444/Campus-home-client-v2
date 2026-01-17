'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function StudentDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 fixed h-screen overflow-y-auto">
        <div className="p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white font-extrabold text-2xl">
              C
            </div>
            <span className="text-2xl font-bold text-primary">Campus Home</span>
          </Link>

          {/* User Info */}
          <div className="mb-8 p-4 bg-bg-light rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                A
              </div>
              <div>
                <div className="font-bold text-gray-900">Ahmed Hassan</div>
                <div className="text-sm text-gray-600">Student</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link href="/dashboard/student" className="flex items-center gap-3 px-4 py-3 bg-bg-light text-primary rounded-xl font-semibold">
              <span className="text-xl">🏠</span>
              <span>Dashboard</span>
            </Link>
            <Link href="/post" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">➕</span>
              <span>Create Post</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">📝</span>
              <span>My Posts</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">❤️</span>
              <span>Saved Properties</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">💬</span>
              <span>Messages</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">👤</span>
              <span>Profile</span>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome Back, Ahmed! 👋</h1>
          <p className="text-gray-600 text-lg">Here's your student dashboard overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="text-primary text-2xl mb-2">📝</div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">2</div>
            <div className="text-gray-600">Active Posts</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="text-primary text-2xl mb-2">❤️</div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">12</div>
            <div className="text-gray-600">Saved Properties</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="text-primary text-2xl mb-2">💬</div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">8</div>
            <div className="text-gray-600">Messages</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="text-primary text-2xl mb-2">👁️</div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">45</div>
            <div className="text-gray-600">Profile Views</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/post" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-4 transition-all flex items-center gap-3">
              <span className="text-3xl">➕</span>
              <div>
                <div className="font-bold">Create Post</div>
                <div className="text-sm text-white/80">Find roommate or room</div>
              </div>
            </Link>
            <Link href="/search" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-4 transition-all flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              <div>
                <div className="font-bold">Browse Properties</div>
                <div className="text-sm text-white/80">Find your perfect home</div>
              </div>
            </Link>
            <Link href="#" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-4 transition-all flex items-center gap-3">
              <span className="text-3xl">🔧</span>
              <div>
                <div className="font-bold">Book Service</div>
                <div className="text-sm text-white/80">Plumber, electrician, etc</div>
              </div>
            </Link>
          </div>
        </div>

        {/* My Active Posts */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Active Posts</h2>
            <Link href="/post" className="btn btn-primary">
              + Create New
            </Link>
          </div>
          
          <div className="space-y-4">
            {/* Post 1 */}
            <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                      Looking for Roommate
                    </span>
                    <span className="text-sm text-gray-500">Posted 2 days ago</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Looking for roommate in Nasr City</h3>
                  <p className="text-gray-600 mb-3">2BR apartment, 1,500 EGP/month, Near Cairo University</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>👁️ 23 views</span>
                    <span>💬 5 messages</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-primary hover:bg-bg-light px-3 py-2 rounded-lg font-semibold">
                    Edit
                  </button>
                  <button className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-semibold">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Post 2 */}
            <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Looking for Room
                    </span>
                    <span className="text-sm text-gray-500">Posted 5 days ago</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Student looking for room in Maadi</h3>
                  <p className="text-gray-600 mb-3">Budget: 2,000 EGP/month, Prefer quiet area</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>👁️ 45 views</span>
                    <span>💬 12 messages</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-primary hover:bg-bg-light px-3 py-2 rounded-lg font-semibold">
                    Edit
                  </button>
                  <button className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-semibold">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Properties */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Properties</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-200">
                  <Image 
                    src={`https://images.unsplash.com/photo-${i === 1 ? '1522708323590' : i === 2 ? '1560448204' : '1502672260'}-d24dbb6b0267?w=400&h=300&fit=crop`}
                    alt="Property"
                    fill
                    className="object-cover"
                  />
                  <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white">
                    <span className="text-red-500 text-xl">❤️</span>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-2">Studio in Nasr City</h3>
                  <p className="text-gray-600 text-sm mb-3">📍 Nasr City, Cairo</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold text-xl">2,500 EGP</span>
                    <button className="btn btn-primary text-sm">View</button>
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
