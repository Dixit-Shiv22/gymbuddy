import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { generateOtp, sendOtp } from '../utils/otp'
import { prisma } from '../lib/prisma'

const router = Router()

router.post('/send-otp', async (req, res) => {
  console.log('send-otp hit', req.body)
  const { phone } = req.body
  if (!phone) return res.status(400).json({ message: 'Phone required' })

  const code = generateOtp()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.otpCode.create({ data: { phone, code, expiresAt } })
  await sendOtp(phone, code)

  res.json({ message: 'OTP sent' })
})

router.post('/verify-otp', async (req, res) => {
  console.log('verify-otp hit', req.body)
  const { phone, code, name } = req.body

  const otp = await prisma.otpCode.findFirst({
    where: { phone, code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) return res.status(400).json({ message: 'Invalid or expired OTP' })

  let user = await prisma.user.findUnique({ where: { phone } })
  let isNewUser = false

  if (!user) {
    if (!name) {
      // OTP is valid but we need the name — don't mark as used yet
      return res.status(400).json({ message: 'Name required for new users', isNewUser: true })
    }
    isNewUser = true
    user = await prisma.user.create({ data: { phone, name } })
  }

  // Only mark OTP as used once we're done
  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  })

  res.json({ token, user, isNewUser })
})

export default router