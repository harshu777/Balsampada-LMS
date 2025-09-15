# Production Server Deployment Guide for Tuition LMS

## Server Requirements

### Minimum Hardware Requirements
- **CPU**: 2 vCPUs (4 vCPUs recommended)
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 50GB SSD minimum
- **Bandwidth**: 100 Mbps minimum
- **OS**: Ubuntu 22.04 LTS or Debian 11

### Required Ports
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- 3001 (Backend API - optional, can be proxied)
- 5432 (PostgreSQL - only if external access needed)

## Step-by-Step Deployment Guide

### Step 1: Initial Server Setup

```bash
# 1.1 Update system packages
sudo apt update && sudo apt upgrade -y

# 1.2 Install essential packages
sudo apt install -y curl wget git vim ufw fail2ban software-properties-common

# 1.3 Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable

# 1.4 Create a non-root user (if not already created)
sudo adduser deploy
sudo usermod -aG sudo deploy

# 1.5 Setup SSH key authentication (from your local machine)
# Run this on your LOCAL machine:
# ssh-copy-id deploy@your-server-ip

# 1.6 Disable root login and password authentication
sudo vim /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### Step 2: Install Docker and Docker Compose

```bash
# 2.1 Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2.2 Add user to docker group
sudo usermod -aG docker $USER

# 2.3 Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 2.4 Verify installations
docker --version
docker-compose --version

# 2.5 Logout and login again for group changes to take effect
exit
# Then SSH back in
```

### Step 3: Setup Domain and SSL

```bash
# 3.1 Point your domain to server IP
# Go to your domain registrar and create an A record:
# Type: A
# Name: @ (or subdomain)
# Value: your-server-ip
# TTL: 3600

# 3.2 Install Certbot for Let's Encrypt SSL
sudo apt install -y certbot python3-certbot-nginx

# 3.3 We'll configure SSL after deploying the application
```

### Step 4: Clone and Configure Application

```bash
# 4.1 Create application directory
sudo mkdir -p /opt/tuition-lms
sudo chown -R $USER:$USER /opt/tuition-lms
cd /opt/tuition-lms

# 4.2 Clone your repository
git clone https://github.com/your-username/tution-lms.git .
# OR if using SSH:
# git clone git@github.com:your-username/tution-lms.git .

# 4.3 Create production environment file
cp .env.example .env

# 4.4 Generate secure secrets
echo "Generating secure secrets..."
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 24)

# 4.5 Update .env file
cat > .env << EOF
# Database Configuration
DB_USER=postgres
DB_PASSWORD=$DB_PASSWORD
DB_NAME=tuition_lms_prod
DB_PORT=5432

# Redis Configuration  
REDIS_PORT=6379

# Application Environment
NODE_ENV=production

# JWT Secrets (Generated automatically)
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# Email Configuration (Update with your SMTP details)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-specific-password
MAIL_FROM=noreply@yourdomain.com

# Application URLs (Update with your domain)
APP_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional Services
# STRIPE_SECRET_KEY=
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
EOF

echo "Please edit /opt/tuition-lms/.env and update email settings and domain URLs"
```

### Step 5: Build and Deploy Application

```bash
# 5.1 Build Docker images
cd /opt/tuition-lms
docker-compose build

# 5.2 Start the application
docker-compose up -d

# 5.3 Check if services are running
docker-compose ps

# 5.4 View logs
docker-compose logs -f

# 5.5 Run database migrations
docker-compose exec backend npx prisma migrate deploy

# 5.6 Seed initial data (optional)
docker-compose exec backend npx prisma db seed
```

### Step 6: Configure Nginx and SSL

```bash
# 6.1 Install Nginx (if not using Docker nginx)
sudo apt install -y nginx

# 6.2 Create Nginx configuration
sudo tee /etc/nginx/sites-available/tuition-lms << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 6.3 Enable the site
sudo ln -s /etc/nginx/sites-available/tuition-lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 6.4 Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 6.5 Setup auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Step 7: Setup Monitoring and Backups

```bash
# 7.1 Install monitoring tools
sudo apt install -y htop netdata

# 7.2 Create backup directory
sudo mkdir -p /backup/tuition-lms
sudo chown -R $USER:$USER /backup

# 7.3 Create backup script
cat > /opt/tuition-lms/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/tuition-lms"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP="$BACKUP_DIR/db_backup_$DATE.sql"
FILES_BACKUP="$BACKUP_DIR/files_backup_$DATE.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U postgres tuition_lms_prod > $DB_BACKUP
gzip $DB_BACKUP

# Backup uploaded files
tar -czf $FILES_BACKUP /opt/tuition-lms/backend/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/tuition-lms/backup.sh

# 7.4 Setup cron job for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/tuition-lms/backup.sh >> /var/log/tuition-lms-backup.log 2>&1") | crontab -
```

### Step 8: Setup System Services

```bash
# 8.1 Create systemd service for auto-start
sudo tee /etc/systemd/system/tuition-lms.service << 'EOF'
[Unit]
Description=Tuition LMS Docker Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/tuition-lms
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# 8.2 Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable tuition-lms.service
sudo systemctl start tuition-lms.service
```

### Step 9: Security Hardening

```bash
# 9.1 Setup Fail2ban for SSH protection
sudo tee /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

sudo systemctl restart fail2ban

# 9.2 Setup automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# 9.3 Configure log rotation
sudo tee /etc/logrotate.d/tuition-lms << 'EOF'
/opt/tuition-lms/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 640 deploy deploy
    sharedscripts
    postrotate
        docker-compose -f /opt/tuition-lms/docker-compose.yml kill -s USR1 nginx
    endscript
}
EOF
```

### Step 10: Performance Optimization

```bash
# 10.1 Configure swap (if needed)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 10.2 Optimize Docker
sudo tee /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

sudo systemctl restart docker
```

## Post-Deployment Checklist

- [ ] Domain is pointing to server IP
- [ ] SSL certificate is installed and working
- [ ] Application is accessible via HTTPS
- [ ] Email notifications are working
- [ ] Database backups are scheduled
- [ ] Monitoring is setup
- [ ] Firewall is configured
- [ ] SSH is secured
- [ ] Auto-updates are enabled
- [ ] Log rotation is configured

## Maintenance Commands

```bash
# View application logs
cd /opt/tuition-lms
docker-compose logs -f

# Restart services
docker-compose restart

# Update application
git pull origin main
docker-compose build
docker-compose up -d

# Database backup
docker-compose exec postgres pg_dump -U postgres tuition_lms_prod > backup.sql

# Database restore
docker-compose exec -T postgres psql -U postgres tuition_lms_prod < backup.sql

# Check disk usage
df -h
docker system df

# Clean up Docker
docker system prune -a -f

# Monitor resources
htop
docker stats
```

## Troubleshooting

### Application not accessible
```bash
# Check if containers are running
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check nginx
sudo nginx -t
sudo systemctl status nginx
```

### Database connection issues
```bash
# Check postgres container
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -d tuition_lms_prod
```

### High memory usage
```bash
# Check memory usage
free -h
docker stats

# Restart containers
docker-compose restart

# Clear cache
sync && echo 3 | sudo tee /proc/sys/vm/drop_caches
```

## Support Information

For production issues:
1. Check logs: `docker-compose logs [service]`
2. Monitor resources: `htop` and `docker stats`
3. Review nginx logs: `/var/log/nginx/error.log`
4. Check disk space: `df -h`

Remember to regularly:
- Update system packages
- Backup your database
- Monitor server resources
- Review security logs
- Update Docker images