# Ernest Fintech - Full Stack Task Management Assessment

A robust, premium Task Management System built with **Node.js (Backend)** and **Next.js (Frontend)**.

## 🚀 Track Selection: Track A (Full-Stack Engineer)

### 🏗 Features
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion, Axios for API.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Neon).
- **Authentication**: JWT Strategy with short-lived **Access Tokens** and long-lived **Refresh Tokens** for secure rotation.
- **Task Management**: Full CRUD, Search, status Filtering, and Batched Pagination.
- **Responsive Design**: Mobile-first architecture using Tailwind CSS.
- **Notifications**: Real-time toast notifications with Sonner.

---

## 🛠 Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- A Neon PostgreSQL connection string (Provided in .env)

### 2. Backend Setup (`/server`)
```bash
cd server
npm install
npx prisma generate
npm run dev
```
*The server runs on **http://localhost:5000***.

### 3. Frontend Setup (`/client`)
```bash
cd client
npm install
npm run dev
```
*The web app runs on **http://localhost:3000***.

---

## 🔒 Security Implementation
- **Password Hashing**: Bcryptjs with salt (10 rounds).
- **JWT Rotation**: 
  - `access_token`: 15-minute lifespan.
  - `refresh_token`: 7-day lifespan, stored in database for server-side revocation.
  - **Fronted Interceptors**: Axios automatically detects 403 error codes, calls the `/refresh` endpoint, and retries the original request seamlessly.

## 📋 API Endpoints
- `POST /auth/register` - Create new user
- `POST /auth/login` - Login & get tokens
- `POST /auth/refresh` - Swap refresh token for new access token
- `POST /auth/logout` - Revoke current refresh token
- `GET /tasks` - List tasks (supports `?search`, `?status`, `?page`, `?limit`)
- `POST /tasks` - Create task
- `GET /tasks/:id` - Fetch one task
- `PATCH /tasks/:id` - Edit task
- `DELETE /tasks/:id` - Remove task
- `PATCH /tasks/:id/toggle` - Swap between 'pending' and 'completed'

---

**Developed for Ernest Fintech Assessment.**
