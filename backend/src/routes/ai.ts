import { Router } from 'express'
import { protect, AuthRequest } from '../middleware/authMiddleware'
import { prisma } from '../lib/prisma'

const router = Router()

// Define your webhook URL (Make sure to add N8N_WEBHOOK_URL to your .env file!)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!

router.post('/chat', protect, async (req: AuthRequest, res) => {
  try {
    const { message, history } = req.body

    if (!message) return res.status(400).json({ message: 'Message required' })

    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { name: true, fitnessGoal: true, interests: true },
    })

    const systemPrompt = `You are a professional fitness coach and gym advisor for GymBuddy app.
You help users with workout plans, nutrition advice, exercise form, and gym guidance.
Keep responses concise, practical, and motivating.
${user?.fitnessGoal ? `This user's fitness goal is: ${user.fitnessGoal}.` : ''}
${user?.interests?.length ? `Their interests include: ${user.interests.join(', ')}.` : ''}
Always tailor advice to their specific goals when relevant.
Respond in a friendly, encouraging tone. Use bullet points for lists.`

    // Send the POST request to your n8n Production Webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        systemPrompt: systemPrompt, // Passing this to n8n
        history: history // Passing history in case you add a memory node in n8n later!
      }),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook failed with status: ${response.status}`)
    }

    const data = await response.json()

    // Extract the "reply" key returned by your Respond to Webhook node
    res.json({ reply: data.reply })

  } catch (error) {
    console.error('Error communicating with AI backend:', error)
    res.status(500).json({ message: 'Failed to generate response' })
  }
})

export default router