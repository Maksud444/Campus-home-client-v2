'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreatePostPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [postType, setPostType] = useState<'roommate' | 'looking' | null>(null)

  const handleTypeSelect = (type: 'roommate' | 'looking') => {
    setPostType(type)
    setStep(2)
  }

  const handleSubmit = () => {
    alert('Post created successfully!')
    router.push('/dashboard/student')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary-light/20">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/student" className="flex items-center gap-3">
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white font-extrabold text-2xl">
                C
              </div>
              <span className="text-2xl font-bold text-primary">Campus Home</span>
            </Link>
            <Link href="/dashboard/student" className="text-gray-600 hover:text-primary font-semibold">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        {postType && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-1 ${step > s ? 'bg-primary' : 'bg-gray-300'}`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-4 text-gray-600">
              Step {step} of 3
            </div>
          </div>
        )}

        {/* Step 1: Select Post Type */}
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Create Your Post</h1>
              <p className="text-gray-600 text-lg">What are you looking for?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Looking for Roommate */}
              <button
                onClick={() => handleTypeSelect('roommate')}
                className="group p-8 border-3 border-gray-200 rounded-2xl hover:border-primary hover:shadow-xl transition-all text-left"
              >
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  Looking for Roommate
                </h3>
                <p className="text-gray-600 mb-4">
                  I have a room/apartment and I'm looking for someone to share it with
                </p>
                <div className="flex items-center text-primary font-semibold">
                  <span>Select this option</span>
                  <span className="ml-2">→</span>
                </div>
              </button>

              {/* Looking for Room */}
              <button
                onClick={() => handleTypeSelect('looking')}
                className="group p-8 border-3 border-gray-200 rounded-2xl hover:border-primary hover:shadow-xl transition-all text-left"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  Looking for Room
                </h3>
                <p className="text-gray-600 mb-4">
                  I'm a student looking for a room or apartment to rent
                </p>
                <div className="flex items-center text-primary font-semibold">
                  <span>Select this option</span>
                  <span className="ml-2">→</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Basic Information */}
        {step === 2 && postType && (
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                {postType === 'roommate' ? 'Room Details' : 'Your Requirements'}
              </h2>
              <p className="text-gray-600">
                {postType === 'roommate' 
                  ? 'Tell us about the room you want to share' 
                  : 'Tell us what kind of room you\'re looking for'}
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Location / Area</label>
                  <select className="input">
                    <option>Select location...</option>
                    <option>Nasr City</option>
                    <option>Maadi</option>
                    <option>Giza</option>
                    <option>Heliopolis</option>
                    <option>New Cairo</option>
                    <option>Zamalek</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Near University</label>
                  <select className="input">
                    <option>Select university...</option>
                    <option>Cairo University</option>
                    <option>Ain Shams University</option>
                    <option>American University</option>
                    <option>German University</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    {postType === 'roommate' ? 'Rent per Person' : 'Your Budget'}
                  </label>
                  <div className="relative">
                    <input type="number" className="input pr-16" placeholder="2000" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
                      EGP
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Available From</label>
                  <input type="date" className="input" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Property Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Studio', 'Apartment', '1 BR', '2 BR'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:border-primary hover:text-primary transition-all"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-outline px-8 py-3"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn-primary px-8 py-3 flex-1"
                >
                  Continue →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Additional Details */}
        {step === 3 && postType && (
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Additional Details</h2>
              <p className="text-gray-600">Help others know more about your requirements</p>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Title</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder={postType === 'roommate' 
                    ? 'e.g. Looking for roommate in Nasr City' 
                    : 'e.g. Student looking for room near Cairo University'
                  }
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Description</label>
                <textarea 
                  className="input min-h-[150px]" 
                  placeholder="Describe your situation, preferences, and what you're looking for..."
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-3">Preferences & Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['WiFi', 'AC', 'Furnished', 'Parking', 'Quiet', 'Pet Friendly', 'Near Metro', 'Balcony', 'Kitchen'].map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                      <input type="checkbox" className="w-5 h-5 text-primary" />
                      <span className="font-medium">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Contact Information</label>
                <input type="tel" className="input" placeholder="Your phone number" />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-outline px-8 py-3"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-primary px-8 py-3 flex-1 text-lg"
                >
                  🚀 Publish Post
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
