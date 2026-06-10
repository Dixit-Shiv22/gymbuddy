import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { protect } from '../middleware/authMiddleware'

const router = Router()

router.get('/', protect, async (req, res) => {
  const { lat, lng } = req.query

  const gyms = await prisma.gym.findMany({
    orderBy: { rating: 'desc' },
  })

  if (!lat || !lng) {
    return res.json(gyms)
  }

  const userLat = parseFloat(lat as string)
  const userLng = parseFloat(lng as string)

  const gymsWithDistance = gyms.map((gym) => {
    const distance = getDistanceKm(userLat, userLng, gym.latitude, gym.longitude)
    return { ...gym, distance: Math.round(distance * 10) / 10 }
  })

  gymsWithDistance.sort((a, b) => a.distance - b.distance)

  res.json(gymsWithDistance)
})

router.get('/:id', protect, async (req, res) => {
  const gym = await prisma.gym.findUnique({
    where: { id: String(req.params.id) },
    include: { sessions: true },
  })
  if (!gym) return res.status(404).json({ message: 'Gym not found' })
  res.json(gym)
})

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default router