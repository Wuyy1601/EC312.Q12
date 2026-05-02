# 🎁 Giftnity — E-Commerce Gift Platform

> **EC312.Q12** — Full-stack e-commerce platform for personalized gifts, built with React + Node.js/Express + MongoDB.

---

## 📐 Architecture

```
EC312.Q12/
├── BackEnd/                  # Node.js/Express API Gateway
│   ├── src/
│   │   ├── server.js         # Entry point & API Gateway
│   │   ├── services/         # Domain-based microservices
│   │   │   ├── user/         # Auth & User management
│   │   │   ├── product/      # Product catalog
│   │   │   ├── order/        # Order processing
│   │   │   ├── category/     # Categories
│   │   │   ├── review/       # Product reviews
│   │   │   ├── gemini/       # AI visual search (Gemini)
│   │   │   ├── spirit/       # Spirit gift consultant (AI)
│   │   │   ├── calendar/     # Event calendar & reminders
│   │   │   ├── cardTemplate/ # Greeting card templates
│   │   │   └── admin/        # Admin dashboard APIs
│   │   ├── shared/           # Shared utilities (JWT, upload)
│   │   └── utils/            # Helper functions
│   ├── Dockerfile
│   └── .env.example
├── FrontEnd/                 # React + Vite SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── context/          # React Context (Cart, Toast)
│   │   ├── routers/          # Route definitions
│   │   └── utils/            # Frontend utilities
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml        # Full-stack orchestration
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local or Atlas)
- **Git**

### 1. Clone & Install

```bash
git clone https://github.com/Wuyy1601/EC312.Q12.git
cd EC312.Q12
```

### 2. Backend Setup

```bash
cd BackEnd
cp .env.example .env      # Edit .env with your MongoDB URI & secrets
npm install
npm run dev               # Starts on http://localhost:5001
```

### 3. Frontend Setup

```bash
cd FrontEnd
cp .env.example .env      # Edit VITE_API_URL if needed
npm install
npm run dev               # Starts on http://localhost:5173
```

---

## 🐳 Docker Deployment

### Prerequisites

- **Docker** ≥ 20
- **Docker Compose** ≥ 2.0

### Build & Run (One Command)

```bash
# From the project root (EC312.Q12/)
docker compose up --build -d
```

| Service    | URL                        |
|------------|----------------------------|
| Frontend   | http://localhost:3000       |
| Backend    | http://localhost:5001       |
| MongoDB    | mongodb://localhost:27017  |

### Environment Variables

Create a `.env` file in the root directory for Docker secrets:

```env
JWT_SECRET=your-strong-random-secret-here
GEMINI_API_KEY=your-gemini-api-key
```

### Useful Commands

```bash
# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v

# Rebuild a specific service
docker compose up --build backend -d
```

---

## 🛠️ Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | React 18, Vite 5, React Router v6        |
| Backend    | Node.js, Express 5, Mongoose             |
| Database   | MongoDB 7                                 |
| AI         | Google Gemini API, LangChain              |
| Auth       | JWT (jsonwebtoken), bcryptjs              |
| Email      | Nodemailer                                |
| Upload     | Multer                                    |
| Deploy     | Docker, Nginx                             |

---

## 📦 API Overview

| Endpoint                | Method | Description            |
|-------------------------|--------|------------------------|
| `/api/auth/register`    | POST   | User registration      |
| `/api/auth/login`       | POST   | User login             |
| `/api/auth/me`          | GET    | Get current user       |
| `/api/products`         | GET    | List all products      |
| `/api/orders`           | GET    | List user orders       |
| `/api/reviews`          | GET    | Product reviews        |
| `/api/gemini/*`         | POST   | AI visual search       |
| `/health`               | GET    | Health check           |

---

## 👥 Team

**Course:** EC312.Q12 — UIT

---

## 📄 License

This project is for educational purposes.
