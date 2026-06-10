import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { protect, AuthRequest } from '../middleware/authMiddleware'

const router = Router()

// Get my profile
router.get('/me', protect, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
  })
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

// Update my profile
router.patch('/me', protect, async (req: AuthRequest, res) => {
  const { name, bio, fitnessGoal, interests } = req.body

  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: { name, bio, fitnessGoal, interests },
  })
  res.json(user)
})

// Get nearby buddies based on matching interests and fitness goals
router.get('/buddies', protect, async (req: AuthRequest, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.userId! },
  })

  if (!me) return res.status(404).json({ message: 'User not found' })

  // Get all users except me
  const users = await prisma.user.findMany({
    where: { id: { not: req.userId! } },
    select: {
      id: true,
      name: true,
      bio: true,
      fitnessGoal: true,
      interests: true,
      sentRequests: {
        where: { receiverId: req.userId! },
        select: { status: true },
      },
      receivedRequests: {
        where: { senderId: req.userId! },
        select: { status: true },
      },
    },
  })

  // Score each user by shared interests
  const scored = users.map((user) => {
    const sharedInterests = user.interests.filter((i) =>
      me.interests.includes(i)
    )
    const sameGoal = user.fitnessGoal === me.fitnessGoal ? 1 : 0
    const score = sharedInterests.length + sameGoal

    const sentRequest = user.sentRequests[0]
    const receivedRequest = user.receivedRequests[0]

    let requestStatus = 'none'
    if (receivedRequest) requestStatus = receivedRequest.status
    if (sentRequest) requestStatus = sentRequest.status === 'accepted' ? 'accepted' : 'received'

    return {
      id: user.id,
      name: user.name,
      bio: user.bio,
      fitnessGoal: user.fitnessGoal,
      interests: user.interests,
      sharedInterests,
      score,
      requestStatus,
    }
  })

  scored.sort((a, b) => b.score - a.score)
  res.json(scored)
})

export default router