import { useEffect, useState } from 'react'
import api from '../lib/api'

type Buddy = {
  id: string
  name: string
  bio: string | null
  fitnessGoal: string | null
  interests: string[]
  sharedInterests: string[]
  requestStatus: string
}

type Request = {
  id: string
  sender: {
    name: string
    bio: string | null
    fitnessGoal: string | null
  }
}

export default function BuddiesPage() {
  const [tab, setTab] = useState<'discover' | 'requests' | 'my'>('discover')
  const [buddies, setBuddies] = useState<Buddy[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [myBuddies, setMyBuddies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [b, r, m] = await Promise.all([
        api.get('/users/buddies'),
        api.get('/buddies/requests'),
        api.get('/buddies/my'),
      ])
      setBuddies(b.data)
      setRequests(r.data)
      setMyBuddies(m.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (userId: string) => {
    setActionId(userId)
    try {
      await api.post('/buddies/request', { receiverId: userId })
      fetchAll()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to send request')
    } finally {
      setActionId(null)
    }
  }

  const handleRespond = async (requestId: string, status: string) => {
    setActionId(requestId)
    try {
      await api.patch(`/buddies/request/${requestId}`, { status })
      fetchAll()
    } catch (e) {
      alert('Failed to respond')
    } finally {
      setActionId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-pulse">🤝</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gym Buddies</h1>

      <div className="flex gap-3 mb-8">
        {(['discover', 'requests', 'my'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
              tab === t ? 'bg-[#6C63FF] text-white' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
            }`}
          >
            {t === 'discover' ? 'Discover' : t === 'requests' ? `Requests${requests.length > 0 ? ` (${requests.length})` : ''}` : 'My Buddies'}
          </button>
        ))}
      </div>

      {tab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buddies.length === 0 ? (
            <p className="text-gray-400 col-span-3 text-center py-16">No users found. Set your fitness goals in Profile!</p>
          ) : buddies.map((buddy) => (
            <div key={buddy.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#6C63FF] flex items-center justify-center text-xl font-bold">
                  {buddy.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{buddy.name}</p>
                  {buddy.fitnessGoal && <p className="text-gray-400 text-sm">🎯 {buddy.fitnessGoal}</p>}
                </div>
              </div>
              {buddy.bio && <p className="text-gray-400 text-sm mb-3">{buddy.bio}</p>}
              {buddy.sharedInterests.length > 0 && (
                <p className="text-[#6C63FF] text-sm mb-4">
                  Shared: {buddy.sharedInterests.join(', ')}
                </p>
              )}
              <button
                onClick={() => buddy.requestStatus === 'none' && handleSendRequest(buddy.id)}
                disabled={buddy.requestStatus !== 'none' || actionId === buddy.id}
                className={`w-full py-2 rounded-xl text-sm font-medium transition ${
                  buddy.requestStatus === 'none'
                    ? 'bg-[#6C63FF] text-white hover:bg-[#5a52d5]'
                    : 'bg-[#2a2a2a] text-gray-400 cursor-not-allowed'
                }`}
              >
                {actionId === buddy.id ? 'Sending...' :
                  buddy.requestStatus === 'none' ? 'Send Request' :
                  buddy.requestStatus === 'pending' ? 'Request Sent' :
                  buddy.requestStatus === 'accepted' ? '✅ Buddies' : 'Respond in Requests'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-gray-400 text-center py-16">No pending requests</p>
          ) : requests.map((req) => (
            <div key={req.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 flex justify-between items-center">
              <div>
                <p className="font-bold">{req.sender.name}</p>
                {req.sender.fitnessGoal && <p className="text-gray-400 text-sm">🎯 {req.sender.fitnessGoal}</p>}
                {req.sender.bio && <p className="text-gray-400 text-sm mt-1">{req.sender.bio}</p>}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRespond(req.id, 'rejected')}
                  className="border border-red-400 text-red-400 px-4 py-2 rounded-xl text-sm hover:bg-red-400 hover:text-white transition"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleRespond(req.id, 'accepted')}
                  className="bg-[#6C63FF] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#5a52d5] transition"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'my' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myBuddies.length === 0 ? (
            <p className="text-gray-400 col-span-3 text-center py-16">No buddies yet. Start connecting!</p>
          ) : myBuddies.map((buddy) => (
            <div key={buddy.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#6C63FF] flex items-center justify-center text-xl font-bold">
                  {buddy.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{buddy.name}</p>
                  {buddy.fitnessGoal && <p className="text-gray-400 text-sm">🎯 {buddy.fitnessGoal}</p>}
                </div>
              </div>
              {buddy.bio && <p className="text-gray-400 text-sm">{buddy.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}