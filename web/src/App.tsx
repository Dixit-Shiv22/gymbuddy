import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import GymDetailPage from './pages/GymDetailPage'
import BookingsPage from './pages/BookingsPage'
import BuddiesPage from './pages/BuddiesPage'
import ProfilePage from './pages/ProfilePage'
import AICoachPage from './pages/AICoachPage'
import { isAuthenticated } from './lib/auth'

const queryClient = new QueryClient()

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route path="/" element={
            <ProtectedRoute><Layout><HomePage /></Layout></ProtectedRoute>
          } />
          <Route path="/gym/:id" element={
            <ProtectedRoute><Layout><GymDetailPage /></Layout></ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute><Layout><BookingsPage /></Layout></ProtectedRoute>
          } />
          <Route path="/buddies" element={
            <ProtectedRoute><Layout><BuddiesPage /></Layout></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>
          } />
          <Route path="/ai" element={
            <ProtectedRoute><Layout><AICoachPage /></Layout></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}