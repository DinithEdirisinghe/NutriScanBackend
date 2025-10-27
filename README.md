# NutriScore AI Backend

RESTful API for NutriScore AI - Handles authentication, user profiles, OCR processing, and deterministic health scoring.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or use Docker)
- npm or yarn

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start PostgreSQL (using Docker):**

   ```bash
   docker-compose up -d postgres
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📡 API Endpoints

### Health Check

- `GET /health` - Check if API is running

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Profile (Protected)

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update health metrics

### Scanning (Coming in Phase 3)

- `POST /api/scan` - Analyze nutrition label

## 🗄️ Database Schema

### User Table

- `id` - UUID (Primary Key)
- `email` - Unique email
- `password` - Bcrypt hashed
- `blood_sugar_mg_dl` - Blood glucose level
- `ldl_cholesterol_mg_dl` - LDL cholesterol
- `weight_kg` - Weight in kilograms
- `height_cm` - Height in centimeters
- `created_at` - Timestamp
- `updated_at` - Timestamp

## 📦 Project Structure

```
backend/
├── src/
│   ├── config/          # Database and configuration
│   ├── entities/        # TypeORM entities
│   ├── controllers/     # Route handlers
│   ├── routes/          # Express routes
│   ├── middleware/      # Auth and validation
│   ├── services/        # Business logic (Phase 3)
│   └── index.ts         # Entry point
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 🧪 Testing with cURL

**Register:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get Profile:**

```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 Next Steps (Phase 2 & 3)

- [ ] Implement OCR service (Google Vision API)
- [ ] Create deterministic scoring engine
- [ ] Add `/api/scan` endpoint
- [ ] Integrate OpenAI for interpretive advice
