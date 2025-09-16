#!/bin/bash

# Tuition LMS Production Deployment Script
# Author: Harshal Baviskar
# Domain: balsampada.com

set -e  # Exit on error

echo "========================================="
echo "Tuition LMS Production Deployment Script"
echo "========================================="

# Configuration
DOCKER_USERNAME="harsh1106"
FRONTEND_IMAGE="$DOCKER_USERNAME/tution-lms-frontend:latest"
BACKEND_IMAGE="$DOCKER_USERNAME/tution-lms-backend:latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   echo "This script is running with root privileges"
else
   echo "This script requires root privileges. Please run with sudo."
   exit 1
fi

# Step 1: Update system
print_info "Updating system packages..."
apt-get update && apt-get upgrade -y
print_success "System updated"

# Step 2: Install Docker if not installed
if ! command -v docker &> /dev/null; then
    print_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    print_success "Docker installed"
else
    print_success "Docker is already installed"
fi

# Step 3: Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    print_info "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed"
else
    print_success "Docker Compose is already installed"
fi

# Step 4: Create application directory
APP_DIR="/opt/tution-lms"
print_info "Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR
cd $APP_DIR
print_success "Application directory created"

# Step 5: Pull Docker images
print_info "Pulling Docker images from Docker Hub..."
docker pull $FRONTEND_IMAGE
docker pull $BACKEND_IMAGE
docker pull postgres:15-alpine
docker pull nginx:alpine
print_success "Docker images pulled"

# Step 6: Create necessary directories
print_info "Creating necessary directories..."
mkdir -p ssl
mkdir -p data/postgres
mkdir -p logs
print_success "Directories created"

# Step 7: Check for configuration files
if [ ! -f ".env.production" ]; then
    print_error "Production environment file not found!"
    print_info "Creating template .env.production file..."
    cat > .env.production << 'EOF'
# Database Configuration
DB_USER=postgres
DB_PASSWORD=CHANGE_THIS_PASSWORD
DB_NAME=tution_lms

# JWT Configuration
JWT_SECRET=CHANGE_THIS_SECRET_MIN_32_CHARS
JWT_REFRESH_SECRET=CHANGE_THIS_REFRESH_SECRET_MIN_32_CHARS

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="Balsampada <noreply@balsampada.com>"

# URLs
FRONTEND_URL=https://balsampada.com
NEXT_PUBLIC_API_URL=https://api.balsampada.com/api
NEXT_PUBLIC_BACKEND_URL=https://api.balsampada.com
CORS_ORIGINS=https://balsampada.com,https://www.balsampada.com
EOF
    print_error "Please edit .env.production with your actual values before continuing!"
    exit 1
fi

# Step 8: Check for SSL certificates
if [ ! -f "ssl/balsampada.com.crt" ] || [ ! -f "ssl/balsampada.com.key" ]; then
    print_error "SSL certificates not found!"
    print_info "You can obtain SSL certificates using Let's Encrypt:"
    echo "  1. Install certbot: apt-get install certbot"
    echo "  2. Generate certificates: certbot certonly --standalone -d balsampada.com -d www.balsampada.com -d api.balsampada.com"
    echo "  3. Copy certificates to $APP_DIR/ssl/"
    exit 1
fi

# Step 9: Stop existing containers if any
print_info "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
print_success "Existing containers stopped"

# Step 10: Start application
print_info "Starting application..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
print_info "Waiting for services to be healthy..."
sleep 10

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_success "Application started successfully!"
    
    echo ""
    echo "========================================="
    echo "Deployment Complete!"
    echo "========================================="
    echo ""
    echo "Your application is now running at:"
    echo "  Frontend: https://balsampada.com"
    echo "  Backend API: https://api.balsampada.com"
    echo ""
    echo "To view logs:"
    echo "  docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo "To stop the application:"
    echo "  docker-compose -f docker-compose.prod.yml down"
    echo ""
else
    print_error "Failed to start application. Check logs with:"
    echo "  docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

# Step 11: Setup firewall (optional)
print_info "Setting up firewall rules..."
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable
print_success "Firewall configured"

# Step 12: Setup automatic startup
print_info "Configuring automatic startup..."
cat > /etc/systemd/system/tution-lms.service << EOF
[Unit]
Description=Tuition LMS Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable tution-lms.service
print_success "Automatic startup configured"

print_success "Deployment complete!"