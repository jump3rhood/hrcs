import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { connectDB } from './config/db'

import authRoutes from './routes/auth'
import candidateRoutes from './routes/candidates'
import employerRoutes from './routes/employers'
import adminRoutes from './routes/admin'

const app = express()

// In production the frontend is served from the same origin — no CORS needed.
// In development the Vite dev server runs on a different port, so allow it.
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }))
}

// Disable CSP so Vite-bundled inline scripts are not blocked
app.use(helmet({ contentSecurityPolicy: false }))
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

// Serve the built React app in production
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist')
  app.use(express.static(frontendDist))
  // React Router catch-all — must be last
  app.get('*', (_req, res) => res.sendFile(path.join(frontendDist, 'index.html')))
}

const PORT = process.env.PORT || 5000

if (process.env.NODE_ENV === 'production') {
  const missing = ['MONGODB_URI', 'JWT_SECRET'].filter(v => !process.env[v])
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
