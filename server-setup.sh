#!/bin/bash

# Tuition LMS Server Setup Script
# For fresh Ubuntu/Debian server
# Run this script as root or with sudo

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

echo "========================================="
echo "Tuition LMS Server Setup"
echo "========================================="
echo ""

# Step 1: Update system
print_info "Step 1: Updating system packages..."
apt-get update && apt-get upgrade -y
print_success "System updated"

# Step 2: Install essential packages
print_info "Step 2: Installing essential packages..."
apt-get install -y curl wget git nano ufw software-properties-common apt-transport-https ca-certificates gnupg lsb-release
print_success "Essential packages installed"

# Step 3: Install Docker
print_info "Step 3: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    print_success "Docker installed"
else
    print_success "Docker already installed"
fi

# Step 4: Install Docker Compose
print_info "Step 4: Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed"
else
    print_success "Docker Compose already installed"
fi

# Step 5: Create application directory
print_info "Step 5: Creating application directory..."
APP_DIR="/opt/tution-lms"
mkdir -p $APP_DIR
cd $APP_DIR
print_success "Application directory created at $APP_DIR"

# Step 6: Create docker-compose.yml
print_info "Step 6: Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: tution-lms-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_DB: tution_lms
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - tution-lms-network
    restart: unless-stopped

  backend:
    image: harsh1106/tution-lms-backend:latest
    container_name: tution-lms-backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres123@postgres:5432/tution_lms?schema=public
      JWT_SECRET: your-super-secret-jwt-key-change-this-in-production
      JWT_REFRESH_SECRET: your-super-secret-refresh-key-change-this
      EMAIL_HOST: smtp.gmail.com
      EMAIL_PORT: 587
      EMAIL_USER: your-email@gmail.com
      EMAIL_PASSWORD: your-app-password
      EMAIL_FROM: noreply@yourdomain.com
      FRONTEND_URL: http://YOUR_SERVER_IP:3000
      CORS_ORIGINS: http://YOUR_SERVER_IP:3000
      PORT: 3001
    depends_on:
      - postgres
    ports:
      - "3001:3001"
    networks:
      - tution-lms-network
    restart: unless-stopped
    command: >
      sh -c "
        npx prisma migrate deploy &&
        npm run start:prod
      "

  frontend:
    image: harsh1106/tution-lms-frontend:latest
    container_name: tution-lms-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://YOUR_SERVER_IP:3001/api
      NEXT_PUBLIC_BACKEND_URL: http://YOUR_SERVER_IP:3001
    ports:
      - "3000:3000"
    networks:
      - tution-lms-network
    restart: unless-stopped

networks:
  tution-lms-network:
    driver: bridge

volumes:
  postgres_data:
EOF
print_success "docker-compose.yml created"

# Step 7: Get server IP
print_info "Step 7: Detecting server IP..."
SERVER_IP=$(curl -s ifconfig.me)
print_success "Server IP detected: $SERVER_IP"

# Step 8: Update docker-compose.yml with actual IP
print_info "Step 8: Updating configuration with server IP..."
sed -i "s/YOUR_SERVER_IP/$SERVER_IP/g" docker-compose.yml
print_success "Configuration updated with IP: $SERVER_IP"

# Step 9: Configure firewall
print_info "Step 9: Configuring firewall..."
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 3000/tcp # Frontend
ufw allow 3001/tcp # Backend
ufw --force enable
print_success "Firewall configured"

# Step 10: Pull Docker images
print_info "Step 10: Pulling Docker images..."
docker pull harsh1106/tution-lms-frontend:latest
docker pull harsh1106/tution-lms-backend:latest
docker pull postgres:15-alpine
print_success "Docker images pulled"

# Step 11: Start the application
print_info "Step 11: Starting the application..."
docker-compose up -d

# Wait for services to start
print_info "Waiting for services to start (30 seconds)..."
sleep 30

# Step 12: Check status
print_info "Step 12: Checking application status..."
if docker-compose ps | grep -q "Up"; then
    print_success "All services are running!"
    
    echo ""
    echo "========================================="
    echo "✅ SETUP COMPLETE!"
    echo "========================================="
    echo ""
    echo "Your application is now accessible at:"
    echo ""
    echo "  📱 Frontend: http://$SERVER_IP:3000"
    echo "  🔧 Backend API: http://$SERVER_IP:3001"
    echo "  📊 API Docs: http://$SERVER_IP:3001/api"
    echo ""
    echo "Default Admin Credentials:"
    echo "  Email: admin@tuitionlms.com"
    echo "  Password: Admin@123456"
    echo ""
    echo "⚠️  IMPORTANT NEXT STEPS:"
    echo "1. Change the default admin password immediately"
    echo "2. Update JWT secrets in docker-compose.yml"
    echo "3. Configure email settings for notifications"
    echo "4. Set up a domain name and SSL certificates"
    echo ""
    echo "Useful Commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop app: docker-compose down"
    echo "  Restart app: docker-compose restart"
    echo "  View status: docker-compose ps"
    echo ""
else
    print_error "Some services failed to start. Check logs with:"
    echo "  docker-compose logs"
fi

# Create a helper script
print_info "Creating helper script..."
cat > /usr/local/bin/tution-lms << 'EOF'
#!/bin/bash

APP_DIR="/opt/tution-lms"
cd $APP_DIR

case "$1" in
    status)
        docker-compose ps
        ;;
    logs)
        docker-compose logs -f ${2}
        ;;
    restart)
        docker-compose restart ${2}
        ;;
    stop)
        docker-compose down
        ;;
    start)
        docker-compose up -d
        ;;
    update)
        docker-compose pull
        docker-compose up -d
        ;;
    *)
        echo "Usage: tution-lms {status|logs|restart|stop|start|update} [service]"
        echo ""
        echo "Examples:"
        echo "  tution-lms status        - Show status of all services"
        echo "  tution-lms logs          - Show logs of all services"
        echo "  tution-lms logs backend  - Show logs of backend service"
        echo "  tution-lms restart       - Restart all services"
        echo "  tution-lms stop          - Stop all services"
        echo "  tution-lms start         - Start all services"
        echo "  tution-lms update        - Update and restart all services"
        ;;
esac
EOF

chmod +x /usr/local/bin/tution-lms
print_success "Helper script created: tution-lms"

echo ""
echo "You can now use 'tution-lms' command to manage your application"
echo ""