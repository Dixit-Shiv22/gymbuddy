import { Link, useNavigate, useLocation } from 'react-router-dom'
import { clearToken } from '../lib/auth'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    clearToken()
    navigate('/login')
  }

  const links = [
    { path: '/', label: '🏠 Home' },
    { path: '/bookings', label: '📅 Bookings' },
    { path: '/buddies', label: '🤝 Buddies' },
    { path: '/ai', label: '🤖 AI Coach' },
    { path: '/profile', label: '👤 Profile' },
  ]

  return (
    <nav className="bg-[#1a1a1a] border-b border-[#333] px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold text-[#6C63FF]">
        💪 GymBuddy
      </Link>
      <div className="flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-sm font-medium transition-colors ${
              location.pathname === link.path
                ? 'text-[#6C63FF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="text-sm text-red-400 hover:text-red-300 font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}