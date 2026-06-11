import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

type Gym = {
  id: string
  name: string
  address: string
  rating: number | null
  amenities: string[]
  distance?: number
}

export default function HomePage() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchGyms()
  }, [])

  const fetchGyms = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords
            const res = await api.get(`/gyms?lat=${lat}&lng=${lng}`)
            setGyms(res.data)
            setLoading(false)
          },
          async () => {
            const res = await api.get('/gyms')
            setGyms(res.data)
            setLoading(false)
          }
        )
      } else {
        const res = await api.get('/gyms')
        setGyms(res.data)
        setLoading(false)
      }
    } catch (e) {
      setError('Failed to load gyms')
      setLoading(false)
    }
  }

  const filtered = gyms.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.address.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🏋️</div>
          <p className="text-gray-400">Finding gyms near you...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Gyms Near You</h1>
        <p className="text-gray-400">Discover and book sessions at top gyms</p>
      </div>

      <input
        type="text"
        placeholder="🔍 Search gyms by name or area..."
        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white outline-none mb-8 placeholder-gray-600 focus:border-[#6C63FF]"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((gym) => (
          <div
            key={gym.id}
            onClick={() => navigate(`/gym/${gym.id}`)}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 cursor-pointer hover:border-[#6C63FF] transition-all hover:shadow-lg hover:shadow-[#6C63FF20]"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold">{gym.name}</h3>
              {gym.rating && (
                <span className="text-yellow-400 text-sm">⭐ {gym.rating}</span>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-4">📍 {gym.address}</p>
            {gym.distance !== undefined && (
              <p className="text-[#6C63FF] text-sm mb-4">🗺️ {gym.distance} km away</p>
            )}
            <div className="flex flex-wrap gap-2">
              {gym.amenities.slice(0, 3).map((a) => (
                <span
                  key={a}
                  className="bg-[#2a2a2a] text-gray-400 text-xs px-3 py-1 rounded-full"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-400">No gyms found matching your search</p>
        </div>
      )}
    </div>
  )
}