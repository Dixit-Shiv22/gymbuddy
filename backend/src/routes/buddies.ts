import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { protect, AuthRequest } from '../middleware/authMiddleware'

const router = Router()

// Send buddy request
router.post('/request', protect, async (req: AuthRequest, res) => {
  const { receiverId } = req.body
  const senderId = req.userId!

  if (senderId === receiverId) {
    return res.status(400).json({ message: 'Cannot send request to yourself' })
  }

  const existing = await prisma.buddyRequest.findFirst({
    where: { senderId, receiverId },
  })
  if (existing) return res.status(400).json({ message: 'Request already sent' })

  const request = await prisma.buddyRequest.create({
    data: { senderId, receiverId },
  })
  res.json(request)
})

// Get my buddy requests (received)
router.get('/requests', protect, async (req: AuthRequest, res) => {
  const requests = await prisma.buddyRequest.findMany({
    where: { receiverId: req.userId!, status: 'pending' },
    include: {
      sender: {
        select: { id: true, name: true, bio: true, fitnessGoal: true, interests: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(requests)
})

// Accept or reject buddy request
router.patch('/request/:id', protect, async (req: AuthRequest, res) => {
  const { status } = req.body
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' })
  }

  const request = await prisma.buddyRequest.findUnique({
    where: { id: String(req.params.id) },
  })

  if (!request) return res.status(404).json({ message: 'Request not found' })
  if (request.receiverId !== req.userId) return res.status(403).json({ message: 'Unauthorized' })

  const updated = await prisma.buddyRequest.update({
    where: { id: String(req.params.id) },
    data: { status },
  })
  res.json(updated)
})

// Get my accepted buddies
router.get('/my', protect, async (req: AuthRequest, res) => {
  const requests = await prisma.buddyRequest.findMany({
    where: {
      status: 'accepted',
      OR: [
        { senderId: req.userId! },
        { receiverId: req.userId! },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, bio: true, fitnessGoal: true, interests: true } },
      receiver: { select: { id: true, name: true, bio: true, fitnessGoal: true, interests: true } },
    },
  })

  const buddies = requests.map((r) =>
    r.senderId === req.userId ? r.receiver : r.sender
  )
  res.json(buddies)
})

export default router