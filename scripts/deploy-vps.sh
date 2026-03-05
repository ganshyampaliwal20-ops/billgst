#!/bin/bash

# --- VPS DEPLOYMENT SCRIPT FOR BILLGST ---
# This script sets up Node.js, PM2, and WhatsApp dependencies on Ubuntu.

echo "--- STARTING VPS SETUP FOR BILLGST ---"

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (v20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install PM2 (Process Manager)
sudo npm install -g pm2

# 4. Install Chromium and Dependencies for WhatsApp (Puppeteer)
sudo apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget libgbm-dev

# 5. Install Git (if not present)
sudo apt install -y git

echo "--- SYSTEM DEPENDENCIES INSTALLED ---"

# Note: The user should clone their repository and run 'npm install' manually.
# Then they can use PM2 to start everything.

echo "To start your application 24/7, use these commands in your project folder:"
echo "1. npm install"
echo "2. npm run build"
echo "3. pm2 start npm --name 'billgst-app' -- start"
echo "4. pm2 start scripts/whatsapp-service.js --name 'billgst-whatsapp'"
echo "5. pm2 save"
echo "6. pm2 startup"

echo "--- SETUP COMPLETE ---"
