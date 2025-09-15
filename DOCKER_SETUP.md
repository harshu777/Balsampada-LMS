# Docker Setup for Tuition LMS

This guide explains how to run the Tuition LMS application using Docker.

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- At least 4GB of free RAM
- 10GB of free disk space

## Quick Start

### 1. Clone the repository and navigate to project root
```bash
cd /path/to/tution-lms
```

### 2. Create environment file
```bash
cp .env.example .env
```

### 3. Configure environment variables
Edit `.env` file and update the following required variables:
- `JWT_SECRET` - Generate a secure random string
- `JWT_REFRESH_SECRET` - Generate another secure random string
- Email configuration (MAIL_HOST, MAIL_USER, MAIL_PASS) for notifications

### 4. Build and start the application

#### Production Mode:
```bash
docker-compose up -d
```

#### Development Mode (with hot-reloading):
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### 5. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PgAdmin (dev only): http://localhost:5050
- Prisma Studio (dev only): http://localhost:5555
- Mailhog (dev only): http://localhost:8025

## Docker Services

### Core Services
1. **postgres** - PostgreSQL database (port 5432)
2. **redis** - Redis cache (port 6379)
3. **backend** - NestJS API server (port 3001)
4. **frontend** - Next.js application (port 3000)

### Development Services
5. **pgadmin** - Database management UI (port 5050)
6. **prisma-studio** - Prisma database UI (port 5555)
7. **mailhog** - Email testing tool (port 8025)

### Production Services
8. **nginx** - Reverse proxy (ports 80, 443)

## Common Docker Commands

### Start services
```bash
# Start all services
docker-compose up -d

# Start with logs
docker-compose up

# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Stop services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: Deletes all data)
docker-compose down -v
```

### View logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f backend
```

### Rebuild containers
```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild and restart
docker-compose up -d --build
```

### Database operations
```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npx prisma db seed

# Reset database (WARNING: Deletes all data)
docker-compose exec backend npx prisma migrate reset

# Open Prisma Studio
docker-compose exec backend npx prisma studio
```

### Shell access
```bash
# Access backend shell
docker-compose exec backend sh

# Access frontend shell
docker-compose exec frontend sh

# Access database
docker-compose exec postgres psql -U postgres -d tuition_lms
```

## Environment Variables

### Required Variables
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `MAIL_HOST` - SMTP server host
- `MAIL_USER` - SMTP username
- `MAIL_PASS` - SMTP password

### Optional Variables
- `NODE_ENV` - Environment (development/production)
- `DB_USER` - Database username (default: postgres)
- `DB_PASSWORD` - Database password (default: password)
- `DB_NAME` - Database name (default: tuition_lms)
- `REDIS_PORT` - Redis port (default: 6379)

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs [service-name]

# Check container status
docker-compose ps

# Rebuild containers
docker-compose down
docker-compose up --build
```

### Database connection issues
```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Port already in use
```bash
# Find process using port
lsof -i :3000  # For frontend
lsof -i :3001  # For backend
lsof -i :5432  # For postgres

# Kill process or change port in docker-compose.yml
```

### Permission issues
```bash
# Fix upload directory permissions
docker-compose exec backend chmod 755 /app/uploads

# Fix node_modules permissions
docker-compose exec backend chown -R node:node /app/node_modules
```

### Reset everything
```bash
# Stop all containers and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Fresh start
docker-compose up --build
```

## Production Deployment

### 1. Update environment variables
```bash
# Set production values in .env
NODE_ENV=production
JWT_SECRET=<strong-random-string>
JWT_REFRESH_SECRET=<another-strong-random-string>
```

### 2. Enable nginx proxy
```bash
# Start with production profile
docker-compose --profile production up -d
```

### 3. Configure SSL certificates
Place SSL certificates in `./nginx/ssl/` directory and update `nginx/nginx.conf`

### 4. Set up backups
```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres tuition_lms > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres tuition_lms < backup.sql
```

## Health Checks

All services include health checks that automatically restart unhealthy containers:
- **Backend**: http://localhost:3001/api/health
- **Frontend**: http://localhost:3000/api/health
- **Postgres**: `pg_isready` command
- **Redis**: `redis-cli ping` command

## Performance Optimization

### 1. Resource limits
Add to docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

### 2. Enable BuildKit
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

### 3. Use multi-stage builds
Already implemented in Dockerfiles to reduce image size

## Security Best Practices

1. **Never commit .env file** - Use .env.example as template
2. **Use strong secrets** - Generate random strings for JWT secrets
3. **Run as non-root** - Containers run as non-root users
4. **Keep images updated** - Regularly update base images
5. **Use secrets management** - Consider Docker Secrets for production

## Support

For issues or questions:
1. Check container logs: `docker-compose logs [service]`
2. Verify environment variables in `.env`
3. Ensure Docker and Docker Compose are up to date
4. Check available disk space and memory