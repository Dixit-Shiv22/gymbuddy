import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

dotenv.config()

import authRoutes from './routes/auth'
import gymRoutes from './routes/gyms'
import bookingRoutes from './routes/bookings'
import buddyRoutes from './routes/buddies'
import userRoutes from './routes/users'
import aiRoutes from './routes/ai'

const app = express()

app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/gyms', gymRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/buddies', buddyRoutes)
app.use('/api/users', userRoutes)
app.use('/api/ai', aiRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000
app.listen(Number(PORT), '0.0.0.0', () => console.log(`Server running on port ${PORT}`))