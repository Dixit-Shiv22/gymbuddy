import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'

type Session = {
  id: string
  type: string
  date: string
  price: number
  slots: number
  booked: number
}

type Gym = {
  id: string
  name: string
  address: string
  phone: string | null
  rating: number | null
  amenities: string[]
  sessions: Session[]
}

export default function GymDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [gym, setGym] = useState<Gym | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingId, setBookingId] = useState<string | null>(null)

  useEffect(() => {
    fetchGym()
  }, [id])

  const fetchGym = async () => {
    try {
      const res = await api.get(`/gyms/${id}`)
      setGym(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async (sessionId: string) => {
    setBookingId(sessionId)
    try {
      await api.post('/bookings', { sessionId })
      alert('🎉 Session booked successfully!')
      fetchGym()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Booking failed')
    } finally {
      setBookingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-pulse">🏋️</div>
      </div>
    )
  }

  if (!gym) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400">Gym not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-[#6C63FF] mb-6 hover:underline"
      >
        ← Back
      </button>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{gym.name}</h1>
          {gym.rating && (
            <span className="text-yellow-400 text-lg">⭐ {gym.rating}</span>
          )}
        </div>
        <p className="text-gray-400 mb-2">📍 {gym.address}</p>
        {gym.phone && <p className="text-gray-400 mb-4">📞 {gym.phone}</p>}

        <div className="flex flex-wrap gap-2 mt-4">
          {gym.amenities.map((a) => (
            <span key={a} className="bg-[#2a2a2a] text-gray-300 px-3 py-1 rounded-full text-sm">
              {a}
            </span>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Available Sessions</h2>

      {gym.sessions.length === 0 ? (
        <p className="text-gray-400">No sessions available</p>
      ) : (
        <div className="space-y-4">
          {gym.sessions.map((session) => {
            const slotsLeft = session.slots - session.booked
            const isFull = slotsLeft <= 0
            return (
              <div
                key={session.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-lg">
                    {session.type === 'demo' ? '🎯 Demo Session' : '🏋️ Day Pass'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    📅 {new Date(session.date).toLocaleDateString('en-IN', {
                      weekday: 'long', day: 'numeric', month: 'long'
                    })}
                  </p>
                  <p className={`text-sm mt-1 ${isFull ? 'text-red-400' : 'text-[#6C63FF]'}`}>
                    {isFull ? 'Full' : `${slotsLeft} slots left`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold mb-2">₹{session.price}</p>
                  <button
                    onClick={() => !isFull && handleBook(session.id)}
                    disabled={isFull || bookingId === session.id}
                    className="bg-[#6C63FF] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#5a52d5] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingId === session.id ? 'Booking...' : isFull ? 'Full' : 'Book'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}