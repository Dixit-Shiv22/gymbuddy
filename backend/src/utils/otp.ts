import dotenv from 'dotenv'
dotenv.config()

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

export const sendOtp = async (phone: string, code: string) => {
  console.log(`📱 OTP for ${phone}: ${code}`)
}