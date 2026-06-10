import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { protect, AuthRequest } from '../middleware/authMiddleware'
import { prisma } from '../lib/prisma'

const router = Router()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

router.post('/chat', protect, async (req: AuthRequest, res) => {
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

const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

  // Build chat history in Gemini format
  const geminiHistory = (history || []).map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const chat = model.startChat({ history: geminiHistory })
  const result = await chat.sendMessage(message)
  const reply = result.response.text()

  res.json({ reply })
})

export default router