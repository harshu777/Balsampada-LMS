#!/bin/bash

#############################################
# Balsampada LMS - Installation Wizard
# Author: Harshal Baviskar
# Version: 1.0
# Description: Automated installation script
#############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration variables
APP_NAME="Balsampada LMS"
APP_DIR="/opt/balsampada"
DB_NAME="balsampada_db"
DB_USER="balsampada_user"
GITHUB_REPO="https://github.com/harshu777/Balsampada-LMS.git"
NODE_VERSION="20"

# Functions
print_banner() {
    clear
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════╗"
    echo "║                                                    ║"
    echo "║           BALSAMPADA LMS INSTALLATION WIZARD      ║"
    echo "║                                                    ║"
    echo "║         Tuition Management System Setup           ║"
    echo "║                                                    ║"
    echo "╚════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
    fi
}

# Get user input
get_user_input() {
    print_step "Configuration Setup"
    
    # Get server IP
    SERVER_IP=$(curl -s ifconfig.me)
    echo -e "${WHITE}Detected Server IP: ${GREEN}$SERVER_IP${NC}"
    read -p "Is this correct? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your server IP: " SERVER_IP
    fi
    
    # Database password
    echo
    read -sp "Enter database password (press Enter for auto-generated): " DB_PASSWORD
    echo
    if [ -z "$DB_PASSWORD" ]; then
        DB_PASSWORD=$(openssl rand -base64 32)
        echo -e "${GREEN}Generated password: $DB_PASSWORD${NC}"
    fi
    
    # JWT Secret
    read -sp "Enter JWT secret (press Enter for auto-generated): " JWT_SECRET
    echo
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 48)
        echo -e "${GREEN}Generated JWT secret${NC}"
    fi
    
    # Admin credentials
    echo
    read -p "Enter admin email [admin@tuitionlms.com]: " ADMIN_EMAIL
    ADMIN_EMAIL=${ADMIN_EMAIL:-admin@tuitionlms.com}
    
    read -sp "Enter admin password [Admin@123456]: " ADMIN_PASSWORD
    ADMIN_PASSWORD=${ADMIN_PASSWORD:-Admin@123456}
    echo
    
    # Installation type
    echo
    echo "Select installation type:"
    echo "1) Full installation (Node.js + PostgreSQL + Application)"
    echo "2) Application only (PostgreSQL already installed)"
    echo "3) Docker installation (Recommended)"
    read -p "Enter choice [1-3]: " INSTALL_TYPE
}

# Install system dependencies
install_dependencies() {
    print_step "Installing System Dependencies"
    
    apt-get update
    apt-get upgrade -y
    
    apt-get install -y \
        curl \
        wget \
        git \
        build-essential \
        nginx \
        ufw \
        software-properties-common \
        ca-certificates \
        gnupg \
        lsb-release \
        openssl
    
    print_success "System dependencies installed"
}

# Install Node.js
install_nodejs() {
    print_step "Installing Node.js v${NODE_VERSION}"
    
    if command -v node &> /dev/null; then
        print_info "Node.js is already installed: $(node --version)"
    else
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
        apt-get install -y nodejs
        print_success "Node.js installed: $(node --version)"
    fi
    
    # Install PM2
    npm install -g pm2
    print_success "PM2 installed"
}

# Install PostgreSQL
install_postgresql() {
    print_step "Installing PostgreSQL"
    
    if command -v psql &> /dev/null; then
        print_info "PostgreSQL is already installed"
    else
        sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
        wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
        apt-get update
        apt-get install -y postgresql-15 postgresql-client-15
        
        systemctl start postgresql
        systemctl enable postgresql
        print_success "PostgreSQL installed"
    fi
    
    # Create database and user
    print_info "Setting up database"
    sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
EOF
    
    print_success "Database created: $DB_NAME"
}

# Install Docker
install_docker() {
    print_step "Installing Docker and Docker Compose"
    
    if command -v docker &> /dev/null; then
        print_info "Docker is already installed"
    else
        curl -fsSL https://get.docker.com | sh
        systemctl start docker
        systemctl enable docker
        print_success "Docker installed"
    fi
    
    if command -v docker-compose &> /dev/null; then
        print_info "Docker Compose is already installed"
    else
        curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose installed"
    fi
}

# Clone repository
clone_repository() {
    print_step "Cloning Repository"
    
    if [ -d "$APP_DIR" ]; then
        print_warning "Directory $APP_DIR exists. Backing up..."
        mv $APP_DIR ${APP_DIR}_backup_$(date +%Y%m%d_%H%M%S)
    fi
    
    mkdir -p $APP_DIR
    git clone $GITHUB_REPO $APP_DIR
    cd $APP_DIR
    
    print_success "Repository cloned"
}

# Setup backend
setup_backend() {
    print_step "Setting up Backend"
    
    cd $APP_DIR/backend
    
    # Install dependencies
    print_info "Installing dependencies..."
    npm install
    
    # Create .env file
    cat > .env <<EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=${JWT_SECRET}_refresh
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@balsampada.com
FRONTEND_URL=http://$SERVER_IP:3000
CORS_ORIGINS=http://$SERVER_IP:3000,http://$SERVER_IP
EOF
    
    # Run Prisma migrations
    print_info "Running database migrations..."
    npx prisma generate
    npx prisma migrate deploy
    
    # Build backend
    print_info "Building backend..."
    npm run build
    
    # Start with PM2
    pm2 delete balsampada-backend 2>/dev/null || true
    pm2 start dist/main.js --name balsampada-backend
    pm2 save
    
    print_success "Backend setup complete"
}

# Setup frontend
setup_frontend() {
    print_step "Setting up Frontend"
    
    cd $APP_DIR/frontend
    
    # Install dependencies
    print_info "Installing dependencies..."
    npm install
    
    # Create .env.local file
    cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=http://$SERVER_IP:3001/api
NEXT_PUBLIC_BACKEND_URL=http://$SERVER_IP:3001
EOF
    
    # Build frontend
    print_info "Building frontend (this may take a few minutes)..."
    npm run build
    
    # Start with PM2
    pm2 delete balsampada-frontend 2>/dev/null || true
    pm2 start npm --name balsampada-frontend -- start
    pm2 save
    
    print_success "Frontend setup complete"
}

# Setup Nginx
setup_nginx() {
    print_step "Configuring Nginx"
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/balsampada <<EOF
server {
    listen 80;
    server_name $SERVER_IP;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/balsampada /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    nginx -t
    systemctl reload nginx
    
    print_success "Nginx configured"
}

# Setup firewall
setup_firewall() {
    print_step "Configuring Firewall"
    
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp
    ufw allow 3001/tcp
    ufw --force enable
    
    print_success "Firewall configured"
}

# Docker installation
docker_installation() {
    print_step "Docker Installation"
    
    install_docker
    
    cd $APP_DIR
    
    # Create docker-compose.yml
    cat > docker-compose.yml <<EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: balsampada-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: $DB_PASSWORD
      POSTGRES_DB: $DB_NAME
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    image: harsh1106/balsampada-backend:latest
    container_name: balsampada-backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:$DB_PASSWORD@postgres:5432/$DB_NAME?schema=public
      JWT_SECRET: $JWT_SECRET
      JWT_REFRESH_SECRET: ${JWT_SECRET}_refresh
      FRONTEND_URL: http://$SERVER_IP:3000
      CORS_ORIGINS: http://$SERVER_IP:3000
      PORT: 3001
    depends_on:
      - postgres
    ports:
      - "3001:3001"
    restart: unless-stopped
    command: >
      sh -c "
        sleep 10 &&
        npx prisma migrate deploy &&
        npm run start:prod
      "

  frontend:
    image: harsh1106/balsampada-frontend:latest
    container_name: balsampada-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://$SERVER_IP:3001/api
      NEXT_PUBLIC_BACKEND_URL: http://$SERVER_IP:3001
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  postgres_data:
EOF
    
    # Pull and start containers
    docker-compose pull
    docker-compose up -d
    
    print_success "Docker containers started"
}

# Create admin user
create_admin_user() {
    print_step "Creating Admin User"
    
    cd $APP_DIR/backend
    
    # Hash password using Node.js
    HASHED_PASSWORD=$(node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('$ADMIN_PASSWORD', 10));")
    
    # Create admin user via SQL
    PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME <<EOF
INSERT INTO "User" (
    id,
    email,
    password,
    "firstName",
    "lastName",
    role,
    status,
    "emailVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    '$ADMIN_EMAIL',
    '$HASHED_PASSWORD',
    'Admin',
    'User',
    'ADMIN',
    'ACTIVE',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;
EOF
    
    print_success "Admin user created"
}

# Display summary
display_summary() {
    print_step "Installation Complete!"
    
    echo -e "\n${GREEN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           INSTALLATION SUCCESSFUL!                 ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
    
    echo -e "\n${WHITE}Access your application:${NC}"
    echo -e "  ${CYAN}Frontend:${NC} http://$SERVER_IP"
    echo -e "  ${CYAN}Backend API:${NC} http://$SERVER_IP:3001"
    echo -e "  ${CYAN}Direct Frontend:${NC} http://$SERVER_IP:3000"
    
    echo -e "\n${WHITE}Admin Credentials:${NC}"
    echo -e "  ${CYAN}Email:${NC} $ADMIN_EMAIL"
    echo -e "  ${CYAN}Password:${NC} $ADMIN_PASSWORD"
    
    echo -e "\n${WHITE}Database Credentials:${NC}"
    echo -e "  ${CYAN}Database:${NC} $DB_NAME"
    echo -e "  ${CYAN}Username:${NC} $DB_USER"
    echo -e "  ${CYAN}Password:${NC} $DB_PASSWORD"
    
    echo -e "\n${WHITE}Useful Commands:${NC}"
    echo -e "  ${CYAN}Check status:${NC} pm2 list"
    echo -e "  ${CYAN}View logs:${NC} pm2 logs"
    echo -e "  ${CYAN}Restart app:${NC} pm2 restart all"
    
    if [ "$INSTALL_TYPE" == "3" ]; then
        echo -e "  ${CYAN}Docker status:${NC} docker-compose ps"
        echo -e "  ${CYAN}Docker logs:${NC} docker-compose logs -f"
    fi
    
    echo -e "\n${YELLOW}⚠ IMPORTANT:${NC}"
    echo -e "  1. Change default passwords in production"
    echo -e "  2. Configure email settings in .env file"
    echo -e "  3. Set up SSL certificate for HTTPS"
    echo -e "  4. Regular backup your database"
    
    # Save credentials to file
    cat > $APP_DIR/credentials.txt <<EOF
Balsampada LMS - Installation Details
=====================================
Date: $(date)
Server IP: $SERVER_IP

Admin Credentials:
  Email: $ADMIN_EMAIL
  Password: $ADMIN_PASSWORD

Database:
  Name: $DB_NAME
  User: $DB_USER
  Password: $DB_PASSWORD

URLs:
  Frontend: http://$SERVER_IP
  Backend: http://$SERVER_IP:3001
EOF
    
    chmod 600 $APP_DIR/credentials.txt
    echo -e "\n${GREEN}Credentials saved to: $APP_DIR/credentials.txt${NC}"
}

# Error handler
handle_error() {
    print_error "Installation failed at step: $1"
    echo "Check logs for details"
    exit 1
}

# Main installation flow
main() {
    print_banner
    check_root
    get_user_input
    
    case $INSTALL_TYPE in
        1)
            print_info "Starting full installation..."
            install_dependencies || handle_error "dependencies"
            install_nodejs || handle_error "nodejs"
            install_postgresql || handle_error "postgresql"
            clone_repository || handle_error "clone"
            setup_backend || handle_error "backend"
            setup_frontend || handle_error "frontend"
            setup_nginx || handle_error "nginx"
            setup_firewall || handle_error "firewall"
            create_admin_user || handle_error "admin"
            ;;
        2)
            print_info "Starting application-only installation..."
            install_dependencies || handle_error "dependencies"
            install_nodejs || handle_error "nodejs"
            clone_repository || handle_error "clone"
            setup_backend || handle_error "backend"
            setup_frontend || handle_error "frontend"
            setup_nginx || handle_error "nginx"
            setup_firewall || handle_error "firewall"
            create_admin_user || handle_error "admin"
            ;;
        3)
            print_info "Starting Docker installation..."
            install_dependencies || handle_error "dependencies"
            docker_installation || handle_error "docker"
            setup_firewall || handle_error "firewall"
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
    
    display_summary
}

# Cleanup function
cleanup() {
    print_warning "Installation interrupted. Cleaning up..."
    # Add cleanup logic if needed
}

# Set trap for cleanup on exit
trap cleanup EXIT INT TERM

# Run main installation
main

# Remove trap on successful completion
trap - EXIT INT TERM