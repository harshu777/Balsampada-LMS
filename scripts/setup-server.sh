#!/bin/bash

# Tuition LMS - Automated Server Setup Script
# This script automates the initial server setup for production deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration variables
DOMAIN=""
EMAIL=""
DEPLOY_USER="deploy"
APP_DIR="/opt/tuition-lms"
BACKUP_DIR="/backup/tuition-lms"

# Function to print colored output
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root"
        exit 1
    fi
}

# Function to get user input
get_user_input() {
    read -p "Enter your domain name (e.g., example.com): " DOMAIN
    read -p "Enter your email address for SSL certificates: " EMAIL
    read -p "Enter SMTP host (default: smtp.gmail.com): " SMTP_HOST
    SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}
    read -p "Enter SMTP port (default: 587): " SMTP_PORT
    SMTP_PORT=${SMTP_PORT:-587}
    read -p "Enter SMTP username: " SMTP_USER
    read -s -p "Enter SMTP password: " SMTP_PASS
    echo
}

# Step 1: System Update and Essential Packages
setup_system() {
    print_message "Updating system packages..."
    apt update && apt upgrade -y
    
    print_message "Installing essential packages..."
    apt install -y \
        curl \
        wget \
        git \
        vim \
        ufw \
        fail2ban \
        software-properties-common \
        htop \
        net-tools \
        unzip \
        build-essential
}

# Step 2: Setup Firewall
setup_firewall() {
    print_message "Configuring firewall..."
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow http
    ufw allow https
    ufw --force enable
    print_message "Firewall configured successfully"
}

# Step 3: Create Deploy User
create_deploy_user() {
    print_message "Creating deploy user..."
    if id "$DEPLOY_USER" &>/dev/null; then
        print_warning "User $DEPLOY_USER already exists"
    else
        adduser --disabled-password --gecos "" $DEPLOY_USER
        usermod -aG sudo $DEPLOY_USER
        print_message "Deploy user created successfully"
    fi
}

# Step 4: Install Docker and Docker Compose
install_docker() {
    print_message "Installing Docker..."
    if command -v docker &> /dev/null; then
        print_warning "Docker is already installed"
    else
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
        usermod -aG docker $DEPLOY_USER
        print_message "Docker installed successfully"
    fi
    
    print_message "Installing Docker Compose..."
    if command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose is already installed"
    else
        curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        print_message "Docker Compose installed successfully"
    fi
}

# Step 5: Install Nginx and Certbot
install_nginx() {
    print_message "Installing Nginx..."
    apt install -y nginx certbot python3-certbot-nginx
    systemctl enable nginx
    print_message "Nginx installed successfully"
}

# Step 6: Setup Application Directory
setup_application() {
    print_message "Setting up application directory..."
    mkdir -p $APP_DIR
    chown -R $DEPLOY_USER:$DEPLOY_USER $APP_DIR
    
    print_message "Please clone your repository manually:"
    echo "  su - $DEPLOY_USER"
    echo "  cd $APP_DIR"
    echo "  git clone <your-repository-url> ."
}

# Step 7: Generate Environment File
generate_env_file() {
    print_message "Generating environment file..."
    
    # Generate secure secrets
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    DB_PASSWORD=$(openssl rand -base64 24)
    
    cat > $APP_DIR/.env << EOF
# Database Configuration
DB_USER=postgres
DB_PASSWORD=$DB_PASSWORD
DB_NAME=tuition_lms_prod
DB_PORT=5432

# Redis Configuration
REDIS_PORT=6379

# Application Environment
NODE_ENV=production

# JWT Secrets
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# Email Configuration
MAIL_HOST=$SMTP_HOST
MAIL_PORT=$SMTP_PORT
MAIL_USER=$SMTP_USER
MAIL_PASS=$SMTP_PASS
MAIL_FROM=noreply@$DOMAIN

# Application URLs
APP_URL=https://$DOMAIN
BACKEND_URL=https://$DOMAIN
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_APP_URL=https://$DOMAIN
EOF
    
    chown $DEPLOY_USER:$DEPLOY_USER $APP_DIR/.env
    chmod 600 $APP_DIR/.env
    print_message "Environment file generated"
}

# Step 8: Configure Nginx
configure_nginx() {
    print_message "Configuring Nginx..."
    
    cat > /etc/nginx/sites-available/tuition-lms << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

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

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads {
        proxy_pass http://localhost:3001/uploads;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/tuition-lms /etc/nginx/sites-enabled/
    nginx -t
    systemctl reload nginx
    print_message "Nginx configured successfully"
}

# Step 9: Setup Backup Directory and Script
setup_backups() {
    print_message "Setting up backup system..."
    mkdir -p $BACKUP_DIR
    chown -R $DEPLOY_USER:$DEPLOY_USER /backup
    
    cat > $APP_DIR/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/tuition-lms"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP="$BACKUP_DIR/db_backup_$DATE.sql"
FILES_BACKUP="$BACKUP_DIR/files_backup_$DATE.tar.gz"

mkdir -p $BACKUP_DIR

# Backup database
cd /opt/tuition-lms
docker-compose exec -T postgres pg_dump -U postgres tuition_lms_prod > $DB_BACKUP
gzip $DB_BACKUP

# Backup uploaded files
tar -czf $FILES_BACKUP /opt/tuition-lms/backend/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    chmod +x $APP_DIR/backup.sh
    chown $DEPLOY_USER:$DEPLOY_USER $APP_DIR/backup.sh
    
    # Add cron job for daily backups
    (crontab -u $DEPLOY_USER -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup.sh >> /var/log/tuition-lms-backup.log 2>&1") | crontab -u $DEPLOY_USER -
    
    print_message "Backup system configured"
}

# Step 10: Create Systemd Service
create_systemd_service() {
    print_message "Creating systemd service..."
    
    cat > /etc/systemd/system/tuition-lms.service << EOF
[Unit]
Description=Tuition LMS Docker Application
Requires=docker.service
After=docker.service network.target

[Service]
Type=oneshot
RemainAfterExit=yes
User=$DEPLOY_USER
Group=$DEPLOY_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable tuition-lms.service
    print_message "Systemd service created"
}

# Step 11: Setup Fail2ban
setup_fail2ban() {
    print_message "Configuring Fail2ban..."
    
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
filter = nginx-noproxy
logpath = /var/log/nginx/error.log
maxretry = 2
EOF
    
    systemctl restart fail2ban
    print_message "Fail2ban configured"
}

# Step 12: Setup Swap (if needed)
setup_swap() {
    print_message "Checking swap..."
    if [ $(swapon -s | wc -l) -eq 1 ]; then
        print_message "Setting up 4GB swap file..."
        fallocate -l 4G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        print_message "Swap configured"
    else
        print_warning "Swap already configured"
    fi
}

# Step 13: Install monitoring
setup_monitoring() {
    print_message "Installing monitoring tools..."
    
    # Install Netdata for real-time monitoring
    if ! command -v netdata &> /dev/null; then
        bash <(curl -Ss https://my-netdata.io/kickstart.sh) --dont-wait
    fi
    
    print_message "Monitoring tools installed"
}

# Main execution
main() {
    check_root
    
    echo "========================================="
    echo "   Tuition LMS Server Setup Script"
    echo "========================================="
    echo
    
    get_user_input
    
    print_message "Starting server setup..."
    
    setup_system
    setup_firewall
    create_deploy_user
    install_docker
    install_nginx
    setup_application
    generate_env_file
    configure_nginx
    setup_backups
    create_systemd_service
    setup_fail2ban
    setup_swap
    setup_monitoring
    
    echo
    echo "========================================="
    echo "   Setup Complete!"
    echo "========================================="
    echo
    print_message "Next steps:"
    echo "1. Clone your repository to $APP_DIR"
    echo "2. Build and start Docker containers:"
    echo "   cd $APP_DIR"
    echo "   docker-compose build"
    echo "   docker-compose up -d"
    echo "3. Run database migrations:"
    echo "   docker-compose exec backend npx prisma migrate deploy"
    echo "4. Setup SSL certificate:"
    echo "   certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive"
    echo "5. Access your application at https://$DOMAIN"
    echo
    print_warning "Important: Save the database password from .env file!"
    echo
}

# Run main function
main "$@"