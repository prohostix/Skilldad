#!/bin/bash
set -e

# Configuration
PROJECT_DIR="/var/www/skilldad"
BRANCH="main"

echo "🚀 Starting SkillDad Manual Update on AWS..."

# 1. Navigate to project directory
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
else
    echo "❌ Error: Project directory $PROJECT_DIR not found."
    exit 1
fi

# 2. Pull latest changes
echo "📥 Pulling latest changes from Git (branch: $BRANCH)..."
git pull origin "$BRANCH"

# 3. Update Server Dependencies
echo "📦 Updating server dependencies..."
cd server
npm install --production

# 4. Update Client Dependencies and Build Frontend
echo "🏗️ Building frontend..."
cd ../client
npm install
npm run build

# 5. Restart Backend Services via PM2
echo "🔄 Restarting backend services..."
cd ../server

# List PM2 processes to verify
pm2 list

# Restarting the service (assuming the PM2 process name exists)
# If 'pm2 restart all' is too aggressive, you can use 'pm2 restart <app_name>'
pm2 restart all

echo "✅ Update Complete!"
echo "🌐 Verify the Admin Dashboard at: http://13.233.85.18/admin"
echo "💡 Use 'pm2 logs' to monitor for any startup issues."
