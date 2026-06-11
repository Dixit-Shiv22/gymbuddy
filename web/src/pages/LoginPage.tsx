import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { saveToken } from '../lib/auth'

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSendOtp = async () => {
    if (phone.length < 10) return setError('Enter a valid phone number')
    setError('')
    setLoading(true)
    try {
      const formatted = phone.startsWith('+') ? phone : `+91${phone}`
      await api.post('/auth/send-otp', { phone: formatted })
      setPhone(formatted)
      setStep('otp')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (otp.length < 6) return setError('Enter the 6-digit OTP')
    if (isNewUser && !name.trim()) return setError('Enter your name')
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { phone, code: otp, name })
      if (res.data.isNewUser && !name.trim()) {
        setIsNewUser(true)
        setLoading(false)
        return
      }
      saveToken(res.data.token)
      navigate('/')
    } catch (e: any) {
      const data = e.response?.data
      if (data?.isNewUser) {
        setIsNewUser(true)
        setLoading(false)
        return
      }
      setError(data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">💪</div>
          <h1 className="text-3xl font-bold text-[#6C63FF]">GymBuddy</h1>
          <p className="text-gray-400 mt-2">Find gyms, book sessions, meet buddies</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#333]">
          {step === 'phone' ? (
            <>
              <h2 className="text-xl font-bold mb-6">Enter your phone number</h2>
              <div className="flex border border-[#333] rounded-xl overflow-hidden mb-4">
                <div className="bg-[#252525] px-4 flex items-center border-r border-[#333]">
                  <span className="text-white">+91</span>
                </div>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  className="flex-1 bg-[#252525] px-4 py-4 text-white outline-none placeholder-gray-600"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                />
              </div>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-[#6C63FF] text-white py-4 rounded-xl font-bold text-base hover:bg-[#5a52d5] transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('phone')}
                className="text-[#6C63FF] text-sm mb-6 hover:underline"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold mb-2">Verify your number</h2>
              <p className="text-gray-400 text-sm mb-6">OTP sent to {phone}</p>

              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-4 text-white text-center text-2xl tracking-widest outline-none mb-4 placeholder-gray-600 focus:border-[#6C63FF]"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              {isNewUser && (
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-4 text-white outline-none mb-4 placeholder-gray-600 focus:border-[#6C63FF]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full bg-[#6C63FF] text-white py-4 rounded-xl font-bold text-base hover:bg-[#5a52d5] transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : isNewUser ? 'Create Account' : 'Verify & Login'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}