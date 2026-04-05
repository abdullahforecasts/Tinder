# PurrMatch Backend API

A REST API for cat matchmaking platform built with Node.js, Express, and PostgreSQL.

## Prerequisites

- Node.js v18 or higher
- PostgreSQL 16
- npm

## Setup Instructions

### 1. Database Setup
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE purrmatch;
\q

# Load schema
sudo -u postgres psql -d purrmatch -f "Phase 01/schema.sql"

# Load seed data
sudo -u postgres psql -d purrmatch -f "Phase 01/seed.sql"
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Copy environment variables
cp .env.example .env

# Edit .env and set your PostgreSQL password
nano .env

# Install dependencies
npm install
```

### 3. Configure Environment

Edit `backend/.env` file:
```env
PORT=4000
NODE_ENV=development
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=purrmatch
PG_USER=postgres
PG_PASSWORD=your_postgres_password
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=1h
```

## Running the Server
```bash
cd backend
npm run dev
```

Server will start at `http://localhost:4000`

## Testing the API

### Health Check
```bash
curl http://localhost:4000/api/health
```

### Register User
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","full_name":"Test User","role":"owner"}'
```

### Using Protected Endpoints
```bash
# Save your token from registration/login response
export TOKEN="your_jwt_token_here"

# Access protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/v1/cats/feed?swiper_cat_id=1"
```

## API Documentation

See `swagger.yaml` for complete API specification.

## Project Structure
```
backend/
├── src/
│   ├── app.js              # Express application setup
│   ├── server.js           # Server entry point
│   ├── db.js               # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.js         # JWT authentication & RBAC
│   └── routes/
│       ├── auth.js         # Registration & login
│       ├── cats.js         # Cat feed, swipes, matches
│       ├── meetings.js     # Meeting scheduling & cancellation
│       └── admin.js        # Admin-only venue management
├── .env.example            # Environment variables template
├── package.json            # Dependencies
└── package-lock.json       # Locked dependencies
```

## Available Endpoints

- `GET /api/health` - Health check
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login existing user
- `GET /api/v1/cats/feed` - Get swipeable cats (auth required)
- `POST /api/v1/cats/swipe` - Record swipe (auth required)
- `GET /api/v1/cats/matches` - Get matches (auth required)
- `POST /api/v1/meetings` - Schedule meeting (auth required)
- `POST /api/v1/meetings/:id/cancel` - Cancel meeting (auth required)
- `GET /api/v1/admin/venues` - List venues (admin only)
- `POST /api/v1/admin/venues` - Create venue (admin only)

## User Roles

- `owner` - Cat owner
- `breeder` - Cat breeder
- `shelter` - Animal shelter
- `admin` - Administrator with venue management access

## Troubleshooting

**Server won't start:**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database exists: `sudo -u postgres psql -l`
- Check .env password matches PostgreSQL password

**Authentication errors:**
- Token expired - register/login again for fresh token
- Missing token - include `Authorization: Bearer <token>` header

**Database errors:**
- Connection refused - verify PostgreSQL is running
- Permission denied - check PG_USER and PG_PASSWORD in .env

## Development

The backend uses:
- Express.js for HTTP routing
- PostgreSQL with pg driver
- JWT for authentication
- bcrypt for password hashing
- Helmet for security headers
- Morgan for request logging