#!/bin/bash
set -e

echo "🚀 Starting SkillDad Server Setup..."

# 1. Update and install basic tools
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx

# 2. Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install PM2 globally
sudo npm install -g pm2

# 4. Create directory structure
sudo mkdir -p /var/www/skilldad
sudo chown ubuntu:ubuntu /var/www/skilldad

echo "✅ Basic dependencies installed."
echo "👉 Next steps:"
echo "1. Clone the repo: git clone https://github.com/prohostix/Skilldad.git /var/www/skilldad"
echo "2. Setup .env in /var/www/skilldad/server"
echo "3. Run npm install & pm2 start"
