#!/bin/bash

# Quick Deployment Script for Tuition LMS
# Run this after initial server setup to deploy/update the application

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
APP_DIR="/opt/tuition-lms"
REPO_URL=""
BRANCH="main"

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as deploy user or root
check_user() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root, switching to deploy user..."
        su - deploy -c "bash $0 $@"
        exit 0
    fi
}

# Deploy new version
deploy() {
    print_message "Starting deployment..."
    
    cd $APP_DIR
    
    # Pull latest code
    print_message "Pulling latest code from $BRANCH branch..."
    git fetch origin
    git reset --hard origin/$BRANCH
    
    # Build Docker images
    print_message "Building Docker images..."
    docker-compose build
    
    # Stop current containers
    print_message "Stopping current containers..."
    docker-compose down
    
    # Start new containers
    print_message "Starting new containers..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_message "Waiting for services to be ready..."
    sleep 10
    
    # Run migrations
    print_message "Running database migrations..."
    docker-compose exec -T backend npx prisma migrate deploy
    
    # Check health
    print_message "Checking application health..."
    curl -f http://localhost:3001/api/health || print_error "Backend health check failed"
    curl -f http://localhost:3000 || print_error "Frontend health check failed"
    
    print_message "Deployment completed successfully!"
}

# Rollback to previous version
rollback() {
    print_message "Starting rollback..."
    
    cd $APP_DIR
    
    # Get previous commit
    PREV_COMMIT=$(git rev-parse HEAD~1)
    
    print_message "Rolling back to commit: $PREV_COMMIT"
    git reset --hard $PREV_COMMIT
    
    # Rebuild and restart
    docker-compose build
    docker-compose down
    docker-compose up -d
    
    print_message "Rollback completed!"
}

# View logs
view_logs() {
    cd $APP_DIR
    docker-compose logs -f --tail=100 $1
}

# Backup database
backup_db() {
    print_message "Creating database backup..."
    
    cd $APP_DIR
    BACKUP_DIR="/backup/tuition-lms"
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/manual_backup_$DATE.sql"
    
    mkdir -p $BACKUP_DIR
    docker-compose exec -T postgres pg_dump -U postgres tuition_lms_prod > $BACKUP_FILE
    gzip $BACKUP_FILE
    
    print_message "Backup saved to: $BACKUP_FILE.gz"
}

# Restore database
restore_db() {
    if [ -z "$1" ]; then
        print_error "Please provide backup file path"
        exit 1
    fi
    
    print_warning "This will replace the current database. Are you sure? (yes/no)"
    read -r CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        print_message "Restore cancelled"
        exit 0
    fi
    
    print_message "Restoring database from: $1"
    
    cd $APP_DIR
    
    if [[ $1 == *.gz ]]; then
        gunzip -c $1 | docker-compose exec -T postgres psql -U postgres tuition_lms_prod
    else
        docker-compose exec -T postgres psql -U postgres tuition_lms_prod < $1
    fi
    
    print_message "Database restored successfully!"
}

# Clean up Docker
cleanup() {
    print_message "Cleaning up Docker..."
    
    docker system prune -a -f --volumes
    
    print_message "Cleanup completed!"
}

# Show status
status() {
    cd $APP_DIR
    
    echo "================================="
    echo "   Application Status"
    echo "================================="
    
    docker-compose ps
    
    echo
    echo "Git Status:"
    git status -s
    git log --oneline -n 1
    
    echo
    echo "Disk Usage:"
    df -h /
    docker system df
}

# Main menu
show_menu() {
    echo "================================="
    echo "   Tuition LMS Deployment Tool"
    echo "================================="
    echo "1) Deploy latest version"
    echo "2) Rollback to previous version"
    echo "3) View logs"
    echo "4) Backup database"
    echo "5) Restore database"
    echo "6) Show status"
    echo "7) Clean up Docker"
    echo "8) Exit"
    echo "================================="
    read -p "Select option: " choice
    
    case $choice in
        1)
            deploy
            ;;
        2)
            rollback
            ;;
        3)
            read -p "Enter service name (backend/frontend/postgres/redis): " service
            view_logs $service
            ;;
        4)
            backup_db
            ;;
        5)
            read -p "Enter backup file path: " backup_file
            restore_db $backup_file
            ;;
        6)
            status
            ;;
        7)
            cleanup
            ;;
        8)
            exit 0
            ;;
        *)
            print_error "Invalid option"
            show_menu
            ;;
    esac
}

# Parse command line arguments
case "$1" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    logs)
        view_logs $2
        ;;
    backup)
        backup_db
        ;;
    restore)
        restore_db $2
        ;;
    status)
        status
        ;;
    cleanup)
        cleanup
        ;;
    *)
        show_menu
        ;;
esac