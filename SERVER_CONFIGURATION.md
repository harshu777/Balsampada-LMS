# Server Configuration Requirements for Tuition LMS

## System Requirements

### Required Software
1. **Node.js**: v20.0.0 or higher (Currently using v24.6.0)
2. **npm**: v9.0.0 or higher (Currently using v11.5.1)
3. **PostgreSQL**: v14.0 or higher (Currently using v14.19)
4. **Git**: For version control

## Database Setup

### PostgreSQL Configuration
1. **Database Name**: `tuition_lms`
2. **Connection String**: `postgresql://[username]@localhost:5432/tuition_lms?schema=public`
3. **Default Port**: 5432

### Database Creation
```bash
# Create database
createdb tuition_lms

# Run Prisma migrations
cd backend
npx prisma migrate dev
npx prisma db seed  # Optional: Seed with sample data
```

## Backend Server Configuration

### Environment Variables (backend/.env)
```env
# Database
DATABASE_URL="postgresql://[username]@localhost:5432/tuition_lms?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-key-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Server Configuration
PORT=3001
NODE_ENV=development
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760  # 10MB

# Email Configuration (Zoho Mail)
MAIL_HOST=smtp.zoho.in
MAIL_PORT=587
MAIL_USER=your-email@yourdomain.com
MAIL_PASSWORD=your-password
MAIL_FROM=your-email@yourdomain.com
FRONTEND_URL=http://localhost:3000
```

### Backend Port
- **Default Port**: 3001
- **API Base URL**: http://localhost:3001/api

### Key Backend Dependencies
- NestJS Framework v11
- Prisma ORM v6.15
- Passport JWT for authentication
- Nodemailer for email services
- Socket.io for real-time features
- Multer for file uploads

## Frontend Server Configuration

### Frontend Port
- **Default Port**: 3000
- **URL**: http://localhost:3000

### Key Frontend Dependencies
- Next.js v15.5.2
- React v19.1.0
- TailwindCSS v3.4
- Axios for API calls
- Socket.io-client for real-time features

## Installation Steps

### 1. Clone Repository
```bash
git clone [repository-url]
cd tution-lms
```

### 2. Backend Setup
```bash
cd backend
npm install

# Setup database
createdb tuition_lms

# Configure environment
cp .env.example .env  # Edit with your configurations

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run start:dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start development server
npm run dev
```

## Production Configuration

### Backend Production
```bash
# Build
npm run build

# Start production server
npm run start:prod
```

### Frontend Production
```bash
# Build
npm run build

# Start production server
npm run start
```

### Production Environment Variables
- Change `NODE_ENV` to `production`
- Use strong, unique JWT secrets
- Configure proper SMTP credentials
- Set appropriate CORS origins
- Use HTTPS in production

## Email Service Configuration

### Zoho Mail Setup (Free Tier)
1. Sign up for Zoho Mail (free for up to 5 users)
2. Verify your domain
3. Create an email account
4. Enable SMTP access
5. Use app-specific password if 2FA is enabled

### SMTP Settings
- **Host**: smtp.zoho.in (India) or smtp.zoho.com (US)
- **Port**: 587 (TLS) or 465 (SSL)
- **Security**: STARTTLS/TLS

## File Upload Configuration

### Upload Directory
- Default: `./uploads` in backend directory
- Maximum file size: 10MB (configurable)
- Supported formats: PDF, JPG, PNG, DOCX

### Directory Structure
```
backend/
├── uploads/
│   ├── documents/
│   ├── profiles/
│   └── assignments/
```

## Monitoring & Logs

### Development
- Backend logs: Console output with NestJS logger
- Frontend logs: Browser console
- Database queries: Prisma query logs

### Production
- Configure proper logging service (Winston, etc.)
- Set up error tracking (Sentry, etc.)
- Monitor server performance

## Security Considerations

1. **Authentication**: JWT-based with refresh tokens
2. **Password Security**: Bcrypt hashing
3. **File Upload Security**: Type validation, size limits
4. **Rate Limiting**: Configured with @nestjs/throttler
5. **CORS**: Properly configured for production domains
6. **Environment Variables**: Never commit .env files
7. **Database Security**: Use connection pooling in production

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env
   - Verify database exists

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check firewall settings for SMTP ports
   - Enable app-specific password if 2FA is on

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify MAX_FILE_SIZE setting
   - Ensure upload directory exists

4. **Port Already in Use**
   - Change PORT in .env
   - Kill existing process on port

## Performance Optimization

1. **Database**: Add indexes for frequently queried fields
2. **Caching**: Implement Redis for session/cache
3. **CDN**: Use CDN for static assets
4. **Image Optimization**: Compress uploaded images
5. **API Rate Limiting**: Configure appropriate limits

## Backup Strategy

1. **Database Backups**: Daily automated PostgreSQL dumps
2. **File Backups**: Regular backup of uploads directory
3. **Code Repository**: Regular Git commits and backups

## Support & Maintenance

- Keep dependencies updated
- Regular security audits
- Monitor error logs
- Database maintenance and optimization
- Regular backups