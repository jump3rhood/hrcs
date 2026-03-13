import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db'

import authRoutes from './routes/auth'
import candidateRoutes from './routes/candidates'
import employerRoutes from './routes/employers'
import adminRoutes from './routes/admin'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))
app.use(express.json())
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    skip: () => process.env.NODE_ENV === 'development',
  }),
)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/candidates', candidateRoutes)
app.use('/api/employers', employerRoutes)
app.use('/api/admin', adminRoutes)

const PORT = process.env.PORT || 5000

if (process.env.NODE_ENV === 'production') {
  const missing = ['MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL'].filter(v => !process.env[v])
  if (missing.length) { console.error('Missing required env vars:', missing.join(', ')); process.exit(1) }
  if (process.env.JWT_SECRET === 'change-this-super-secret-key-in-production') {
    console.error('JWT_SECRET must be changed in production'); process.exit(1)
  }
}

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('DB connection failed:', err)
    process.exit(1)
  })
