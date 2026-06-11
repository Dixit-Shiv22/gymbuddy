import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { clearToken } from '../lib/auth'

const FITNESS_GOALS = ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness']
const INTERESTS = ['Weights', 'Cardio', 'Yoga', 'Crossfit', 'Zumba', 'Swimming', 'Boxing', 'Cycling']

type User = {
  name: string
  phone: string
  bio: string | null
  fitnessGoal: string | null
  interests: string[]
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [fitnessGoal, setFitnessGoal] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me')
      setUser(res.data)
      setBio(res.data.bio || '')
      setFitnessGoal(res.data.fitnessGoal || '')
      setInterests(res.data.interests || [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/users/me', { bio, fitnessGoal, interests })
      setEditing(false)
      fetchProfile()
      alert('✅ Profile updated!')
    } catch (e) {
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const handleLogout = () => {
    clearToken()
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-pulse">👤</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 mb-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#6C63FF] flex items-center justify-center text-3xl font-bold mx-auto mb-4">
          {user.name[0].toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-gray-400 mt-1">{user.phone}</p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="mt-4 border border-[#6C63FF] text-[#6C63FF] px-6 py-2 rounded-xl text-sm hover:bg-[#6C63FF] hover:text-white transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 mb-6">
        {editing ? (
          <>
            <h2 className="text-lg font-bold mb-6">Edit Profile</h2>
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Bio</label>
              <textarea
                className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white outline-none placeholder-gray-600 focus:border-[#6C63FF] resize-none"
                placeholder="Tell others about yourself..."
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Fitness Goal</label>
              <div className="flex flex-wrap gap-2">
                {FITNESS_GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setFitnessGoal(goal)}
                    className={`px-4 py-2 rounded-full text-sm transition ${
                      fitnessGoal === goal
                        ? 'bg-[#6C63FF] text-white'
                        : 'bg-[#252525] text-gray-400 hover:text-white border border-[#333]'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="text-gray-400 text-sm mb-2 block">Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm transition ${
                      interests.includes(interest)
                        ? 'bg-[#6C63FF] text-white'
                        : 'bg-[#252525] text-gray-400 hover:text-white border border-[#333]'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 border border-[#333] text-gray-400 py-3 rounded-xl hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#6C63FF] text-white py-3 rounded-xl font-bold hover:bg-[#5a52d5] transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-1">Bio</p>
              <p className="text-white">{user.bio || 'No bio yet'}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-1">Fitness Goal</p>
              <p className="text-white">{user.fitnessGoal || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {user.interests.length > 0 ? user.interests.map((i) => (
                  <span key={i} className="bg-[#6C63FF] text-white px-3 py-1 rounded-full text-sm">
                    {i}
                  </span>
                )) : <p className="text-gray-600">No interests set</p>}
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full border border-red-400 text-red-400 py-3 rounded-xl font-medium hover:bg-red-400 hover:text-white transition"
      >
        Logout
      </button>
    </div>
  )
}