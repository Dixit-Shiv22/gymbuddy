# 💪 GymBuddy

A full stack gym discovery and booking web application built with React, Node.js, Express, PostgreSQL and Prisma. Features include geolocation-based gym search, session booking, social buddy matching, and AI fitness coaching powered by Google Gemini via n8n workflow automation.

🌐 **Live Demo:** [gymbuddy-woad.vercel.app](https://gymbuddy-woad.vercel.app)

---

## 📸 Screenshots

### Login Page
> Phone-based OTP authentication — enter your number and verify with a 6-digit OTP

### Home — Gym Discovery
> Gyms sorted by distance from your location using the Haversine formula

### Gym Detail & Booking
> View gym details, amenities, available sessions and book with one click

### Bookings
> View and manage all your confirmed and cancelled bookings

### Gym Buddy Matching
> Discover users with shared fitness goals and interests, send and accept buddy requests

### AI Fitness Coach
> Chat with an AI fitness coach powered by Google Gemini via n8n workflow

### Profile
> Set your fitness goals and interests to improve buddy matching

---

## 🚀 Features

- **Phone OTP Authentication** — JWT-based auth with phone number verification
- **Geolocation Gym Discovery** — Finds gyms near you using the browser Geolocation API and sorts by distance using the Haversine formula
- **Session Booking** — Book demo sessions or day passes with real-time slot management
- **Booking Management** — View and cancel bookings with slot count updates
- **Gym Buddy Matching** — Matching algorithm based on shared fitness goals and interests
- **Buddy Requests** — Send, accept, and decline buddy requests
- **AI Fitness Coach** — Chat interface powered by Google Gemini via n8n workflow automation
- **User Profiles** — Customizable fitness goals, interests, and bio

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS v4 | Styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| TanStack Query | Server state management |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| TypeScript | Type safety |
| Prisma ORM v6 | Database access layer |
| PostgreSQL | Relational database |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |

### AI & Automation
| Technology | Purpose |
|---|---|
| n8n Cloud | Workflow automation |
| Google Gemini | AI language model |
| Webhook | API integration layer |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Render PostgreSQL | Managed database |
| GitHub | Version control + CI/CD |

---

## 🗄️ Database Schema

```
User
├── id, name, phone, email
├── bio, fitnessGoal, interests[]
├── bookings[]
├── sentRequests[], receivedRequests[]

Gym
├── id, name, address
├── latitude, longitude
├── amenities[], photos[]
├── rating, phone
└── sessions[]

GymSession
├── id, gymId, type
├── date, price
├── slots, booked
└── bookings[]

Booking
├── id, userId, sessionId
├── status, paymentId
└── createdAt

BuddyRequest
├── id, senderId, receiverId
├── status (pending/accepted/rejected)
└── createdAt

OtpCode
├── id, phone, code
├── expiresAt, used
└── createdAt
```

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   React (Vite)  │ ──────▶ │  Express.js API  │
│   Vercel        │  HTTPS  │  Render          │
└─────────────────┘         └────────┬─────────┘
                                     │
                          ┌──────────▼─────────┐
                          │   PostgreSQL DB    │
                          │   Render           │
                          └────────────────────┘
                                     │
                          ┌──────────▼─────────┐
                          │   n8n Workflow     │
                          │   Google Gemini    │
                          └────────────────────┘
```

---

## 📡 API Endpoints

### Auth
```
POST /api/auth/send-otp      — Send OTP to phone number
POST /api/auth/verify-otp    — Verify OTP and get JWT token
```

### Gyms
```
GET  /api/gyms               — Get all gyms (sorted by distance if lat/lng provided)
GET  /api/gyms/:id           — Get gym details with sessions
```

### Bookings
```
POST  /api/bookings          — Book a session
GET   /api/bookings/my       — Get my bookings
PATCH /api/bookings/:id/cancel — Cancel a booking
```

### Buddies
```
POST  /api/buddies/request       — Send buddy request
GET   /api/buddies/requests      — Get pending requests
PATCH /api/buddies/request/:id   — Accept or reject request
GET   /api/buddies/my            — Get my accepted buddies
```

### Users
```
GET   /api/users/me          — Get my profile
PATCH /api/users/me          — Update profile
GET   /api/users/buddies     — Get matched users sorted by score
```

### AI
```
POST /api/ai/chat            — Send message to AI fitness coach
```

---

## ⚙️ Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL
- Git

### Clone the repo
```bash
git clone https://github.com/Dixit-Shiv22/gymbuddy.git
cd gymbuddy
```

### Backend setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/gymbuddy"
JWT_SECRET="your_jwt_secret"
PORT=5000
GEMINI_API_KEY="your_gemini_key"
N8N_WEBHOOK_URL="your_n8n_webhook_url"
```

Run migrations and seed:
```bash
npx prisma migrate dev
npx ts-node prisma/seed.ts
npm run dev
```

### Frontend setup
```bash
cd web
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔑 Key Technical Decisions

**Why PostgreSQL over MongoDB?**
The data is highly relational — users have bookings, bookings belong to sessions, sessions belong to gyms. PostgreSQL with foreign key constraints and joins is the right tool for this structure. Using MongoDB here would be the wrong technical choice.

**Why Prisma ORM?**
Prisma provides type-safe database queries, automatic migration generation, and an intuitive schema definition language. It significantly reduces bugs from raw SQL queries.

**Why n8n for AI?**
Using n8n as a middleware layer decouples the AI provider from the backend. Switching from Gemini to another LLM requires only a workflow change in n8n — zero backend code changes. It also provides a visual interface for non-developers to modify AI behavior.

**Why Haversine formula for distance?**
PostGIS would be overkill for this use case. The Haversine formula calculates accurate great-circle distances between two GPS coordinates and is sufficient for sorting gyms within a city radius.

---

## 🚀 Deployment

### Backend (Render)
- Auto-deploys from `main` branch
- Runs `prisma migrate deploy` on every deploy
- PostgreSQL database managed by Render

### Frontend (Vercel)
- Auto-deploys from `main` branch
- Root directory set to `web/`
- Zero configuration needed

---

## 📋 Future Improvements

- [ ] Real SMS OTP via Twilio
- [ ] Real gym data via Google Places API
- [ ] Payment integration via Razorpay
- [ ] Real-time buddy chat via Socket.io
- [ ] Push notifications for booking reminders
- [ ] Gym photos via Cloudinary
- [ ] Admin dashboard for gym management

---

## 👨‍💻 Author

**Shivansh Dixit**
- GitHub: [@Dixit-Shiv22](https://github.com/Dixit-Shiv22)
- LinkedIn: [linkedin.com/in/shivansh-dixit](https://www.linkedin.com/in/dixitshivansh/)

---

## 📄 License

MIT License — feel free to use this project as a reference or starting point.
