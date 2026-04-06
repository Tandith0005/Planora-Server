# Planora Backend

## Project Description
Backend API for Planora — a modern event management platform where users can create, discover, and participate in public and private events with secure payment integration.

## Live URLs
- **Github Frontend** : [https://github.com/Tandith0005/Planora-Server](https://github.com/Tandith0005/Planora)
- **Frontend**: https://level-2-assignment-5-637q.onrender.com
- **Backend API**: https://level-2-assignment-5-server.onrender.com

## Database Schema (ERD)

![Planora ERD](erd/planora-erd.png)

*(Created with draw.io)*

## Live URLs
- **Backend API**: https://level-2-assignment-5-server.onrender.com
- **Frontend**: https://level-2-assignment-5-637q.onrender.com

## Features
- User authentication with JWT + Refresh Token
- Email verification
- Event CRUD operations (Public & Private)
- Event participation system (Free + Paid)
- Stripe payment integration with webhook
- Role-based access (User & Admin)
- Soft delete for users
- Notifications system

## Technologies Used
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Stripe Payment Gateway
- Zod Validation
- bcrypt + Nodemailer

## Setup Instructions

### Prerequisites
- Node.js (v20+)
- PostgreSQL database
- Stripe account

### Installation

1. Clone the repository
   ```bash
   git clone <backend-repo-url>
   cd backend
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file and set environment variables based on the `.env.example` file
4. Run Prisma migrations
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
5. Start the server
   ```bash
   npm run dev
   ```

### API Endpoints
 - Authentication: /api/auth
 - Event: /api/v1/events
 - Payment: /api/v1/payments
