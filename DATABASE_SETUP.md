# Database Setup Guide for Tuition LMS

## Current Status
- **Database Schema**: ✅ Created (Prisma schema with 15+ models)
- **Database Server**: ❌ Not installed
- **Database**: ❌ Not created
- **Tables**: ❌ Not created

## Setup Instructions

### Option 1: Using Docker (Recommended)

1. **Start PostgreSQL with Docker Compose:**
   ```bash
   docker-compose up -d
   ```
   This will:
   - Start PostgreSQL on port 5432
   - Create database named `tuition_lms`
   - Start pgAdmin on port 5050 (http://localhost:5050)
   - pgAdmin login: admin@tuitionlms.com / admin123

2. **Run Prisma Migrations:**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```
   This will create all tables based on the schema.

3. **Seed the Database (Optional):**
   ```bash
   npx prisma db seed
   ```

### Option 2: Local PostgreSQL Installation

1. **Install PostgreSQL:**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql
   sudo systemctl start postgresql

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database:**
   ```bash
   createdb tuition_lms
   ```

3. **Run Prisma Migrations:**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

### Option 3: Using Cloud Database

You can use a cloud PostgreSQL service like:
- **Supabase** (Free tier available)
- **Neon** (Free tier available)
- **Railway** (Free trial)
- **Render** (Free tier available)

1. Create an account and database
2. Get the connection string
3. Update `/backend/.env`:
   ```
   DATABASE_URL="your-cloud-database-url"
   ```
4. Run migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

## Database Schema Overview

The database includes the following main tables:

### Core Tables:
- **users** - Store user accounts (Admin, Teacher, Student)
- **classes** - Class/grade levels
- **subjects** - Subject information
- **payments** - Payment records and approvals
- **documents** - Uploaded documents

### Relationship Tables:
- **teacher_subjects** - Teacher-Subject assignments
- **student_enrollments** - Student-Subject enrollments
- **assignments** - Class assignments
- **student_assignments** - Assignment submissions
- **tests** - Tests/exams
- **student_tests** - Test attempts
- **attendance** - Attendance records
- **live_sessions** - Online class sessions
- **materials** - Study materials
- **notifications** - System notifications

## Verify Database Setup

After setup, verify the database:

1. **Check Prisma connection:**
   ```bash
   cd backend
   npx prisma db pull
   ```

2. **Open Prisma Studio:**
   ```bash
   npx prisma studio
   ```
   This opens a web interface at http://localhost:5555

3. **Test the application:**
   ```bash
   # Backend
   cd backend
   npm run start:dev

   # Frontend (in new terminal)
   cd frontend
   npm run dev
   ```

## Connection Details

**Default PostgreSQL Connection:**
- Host: localhost
- Port: 5432
- Database: tuition_lms
- Username: postgres
- Password: password

## Troubleshooting

### Connection Refused Error
- Ensure PostgreSQL is running
- Check if port 5432 is available
- Verify credentials in .env file

### Migration Errors
- Drop and recreate database: `dropdb tuition_lms && createdb tuition_lms`
- Reset Prisma: `npx prisma migrate reset`

### Docker Issues
- Check Docker is running: `docker ps`
- View logs: `docker-compose logs postgres`
- Restart containers: `docker-compose restart`

## Next Steps

1. Choose your setup method (Docker recommended)
2. Run the database setup commands
3. Run Prisma migrations
4. Start the application
5. Create an admin user for initial access