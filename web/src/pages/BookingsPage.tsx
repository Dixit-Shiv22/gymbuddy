import { useEffect, useState } from 'react'
import api from '../lib/api'

type Booking = {
  id: string
  status: string
  session: {
    type: string
    date: string
    price: number
    gym: { name: string; address: string }
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my')
      setBookings(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return
    setCancellingId(id)
    try {
      await api.patch(`/bookings/${id}/cancel`)
      fetchBookings()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to cancel')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-pulse">📅</div>
      </div>
    )
  }

  const active = bookings.filter((b) => b.status === 'confirmed')
  const cancelled = bookings.filter((b) => b.status === 'cancelled')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🏋️</div>
          <p className="text-gray-400 text-lg">No bookings yet</p>
          <p className="text-gray-600 text-sm mt-2">Book a session at a nearby gym to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...active, ...cancelled].map((booking) => (
            <div
              key={booking.id}
              className={`bg-[#1a1a1a] border rounded-xl p-6 ${
                booking.status === 'cancelled' ? 'border-[#2a2a2a] opacity-60' : 'border-[#2a2a2a]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{booking.session.gym.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">📍 {booking.session.gym.address}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {booking.session.type === 'demo' ? '🎯 Demo Session' : '🏋️ Day Pass'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    📅 {new Date(booking.session.date).toLocaleDateString('en-IN', {
                      weekday: 'long', day: 'numeric', month: 'long'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#6C63FF] font-bold text-xl mb-2">₹{booking.session.price}</p>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    booking.status === 'confirmed'
                      ? 'bg-green-900 text-green-300'
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {booking.status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}
                  </span>
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="block mt-2 text-red-400 text-sm hover:underline disabled:opacity-50"
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}