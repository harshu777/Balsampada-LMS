# Balsampada - Tuition Management System

A comprehensive Learning Management System for managing tuition classes with separate modules for Students, Teachers, and Administrators.

## Features

- **Multi-role Authentication**: Student, Teacher, and Admin portals
- **Class Management**: Schedule and manage online/offline classes
- **Assignment & Test Management**: Create, submit, and grade assignments
- **Attendance Tracking**: Digital attendance system
- **Payment Integration**: Fee management and payment tracking
- **Real-time Notifications**: Socket.IO based notifications
- **Document Management**: Upload and manage educational materials

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: NestJS, Prisma ORM, PostgreSQL
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Deployment**: Docker, Docker Compose

## Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### Using Docker Hub Images

1. Create a `docker-compose.yml` file:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_DB: tution_lms
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    image: harsh1106/balsampada-backend:latest
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres123@postgres:5432/tution_lms?schema=public
      JWT_SECRET: your-jwt-secret-min-32-chars
      JWT_REFRESH_SECRET: your-refresh-secret-min-32-chars
      PORT: 3001
    depends_on:
      - postgres
    ports:
      - "3001:3001"
    restart: unless-stopped

  frontend:
    image: harsh1106/balsampada-frontend:latest
    environment:
      NEXT_PUBLIC_API_URL: https://localhost:3001/api
      NEXT_PUBLIC_BACKEND_URL: https://localhost:3001
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  postgres_data:
```

2. Start the application:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: https://localhost:3000
- Backend API: https://localhost:3001

## Default Credentials

- **Admin**: admin@tuitionlms.com / Admin@123456

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT secret key
- `JWT_REFRESH_SECRET`: JWT refresh token secret
- `EMAIL_HOST`: SMTP host for emails
- `EMAIL_USER`: Email username
- `EMAIL_PASSWORD`: Email password

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_BACKEND_URL`: Backend base URL

## Development Setup

1. Clone the repository
2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

3. Set up environment variables (copy .env.example to .env)

4. Run development servers:
```bash
# Backend
npm run start:dev

# Frontend
npm run dev
```

## Docker Images

- Frontend: `harsh1106/balsampada-frontend`
- Backend: `harsh1106/balsampada-backend`

## License