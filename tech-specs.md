# Tech Stack - BRI HR Portal MVP

## Frontend
- **Framework:** React 18.2+ with TypeScript
- **Build Tool:** Vite 5+
- **Routing:** React Router DOM v6
- **State Management:** Recoil
- **UI Framework:** Tailwind CSS 3+
- **Component Library:** Shadcn/ui (Radix UI primitives)
- **Form Handling:** React Hook Form + Zod validation
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Icons:** Lucide React
- **Date Handling:** date-fns

## Backend
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js with TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken) + bcryptjs
- **Validation:** express-validator
- **Email:** Nodemailer or @sendgrid/mail
- **Environment:** dotenv
- **Security:** helmet, cors, express-rate-limit
- **Dev Tools:** ts-node-dev, nodemon

## Database
- **Primary:** MongoDB Atlas (cloud) or MongoDB Community (local)
- **ODM:** Mongoose 8+
- **No caching layer** (Redis skipped for MVP)

## Utility Libraries

### Frontend Utils
- **clsx** - Conditional classnames
- **class-variance-authority** - Component variants
- **tailwind-merge** - Merge Tailwind classes
- **react-dropzone** - File uploads (future)

### Backend Utils
- **validator** - String validation
- **crypto** - Token generation (built-in Node)
- **path** - File path handling (built-in Node)

## Development Tools
- **TypeScript:** 5.3+
- **ESLint:** Code linting
- **Prettier:** Code formatting
- **Husky:** Git hooks (optional)
- **Concurrently:** Run frontend + backend together

## Hosting (Recommended)
- **Frontend:** Vercel or Netlify
- **Backend:** Render, Railway, or Heroku
- **Database:** MongoDB Atlas (free tier)
- **Email:** SendGrid (free 100 emails/day)

## Package.json Highlights

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "recoil": "^0.7.7",
  "axios": "^1.6.0",
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.0",
  "tailwindcss": "^3.4.0",
  "lucide-react": "^0.300.0",
  "react-hot-toast": "^2.4.1",
  "date-fns": "^3.0.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.2.0"
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "express-validator": "^7.0.1",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.0",
  "nodemailer": "^6.9.7",
  "@sendgrid/mail": "^8.1.0"
}
```

### Dev Dependencies (Both)
```json
{
  "typescript": "^5.3.0",
  "ts-node-dev": "^2.0.0",
  "@types/node": "^20.10.0",
  "@types/express": "^4.17.21",
  "@types/react": "^18.2.0",
  "eslint": "^8.56.0",
  "prettier": "^3.1.0"
}
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=BRI HR Portal
```

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bri-hr
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
SENDGRID_API_KEY=your-sendgrid-key
SENDER_EMAIL=noreply@brihr.com
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Project Structure
```
bri-hr-portal/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── recoil/        # Recoil atoms & selectors
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   └── package.json
└── README.md
```

---

**No Redis. No complex caching. Just MERN + TypeScript + Recoil.**