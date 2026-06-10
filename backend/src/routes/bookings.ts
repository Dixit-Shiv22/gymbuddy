import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { protect, AuthRequest } from '../middleware/authMiddleware'

const router = Router()

// Book a session
router.post('/', protect, async (req: AuthRequest, res) => {
  const { sessionId } = req.body
  const userId = req.userId!

  const session = await prisma.gymSession.findUnique({
    where: { id: String(sessionId) },
  })

  if (!session) return res.status(404).json({ message: 'Session not found' })
  if (session.booked >= session.slots) return res.status(400).json({ message: 'Session is full' })

  // Check if already booked
  const existing = await prisma.booking.findFirst({
    where: { userId, sessionId: String(sessionId), status: 'confirmed' },
  })
  if (existing) return res.status(400).json({ message: 'Already booked this session' })

  const booking = await prisma.booking.create({
    data: { userId, sessionId: String(sessionId) },
    include: { session: { include: { gym: true } } },
  })

  await prisma.gymSession.update({
    where: { id: String(sessionId) },
    data: { booked: { increment: 1 } },
  })

  res.json(booking)
})

// Get my bookings
router.get('/my', protect, async (req: AuthRequest, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.userId! },
    include: {
      session: {
        include: { gym: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(bookings)
})

// Cancel a booking
router.patch('/:id/cancel', protect, async (req: AuthRequest, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: String(req.params.id) },
  })

  if (!booking) return res.status(404).json({ message: 'Booking not found' })
  if (booking.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' })

  await prisma.booking.update({
    where: { id: String(req.params.id) },
    data: { status: 'cancelled' },
  })

  await prisma.gymSession.update({
    where: { id: booking.sessionId },
    data: { booked: { decrement: 1 } },
  })

  res.json({ message: 'Booking cancelled' })
})

export default router