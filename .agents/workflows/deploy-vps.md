---
description: Deploy the BillGST application and WhatsApp Bot to a Hostinger VPS (Ubuntu 22.04/24.04).
---

# VPS Deployment Workflow

1. Login to your Hostinger VPS via SSH:
```bash
ssh root@your_vps_ip
```

2. Clone your repository:
```bash
git clone YOUR_REPO_URL
cd YOUR_REPO_NAME
```

3. Run the deployment setup script (This installs Node.js, PM2, and Chrome libs for WhatsApp):
```bash
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh
```

4. Set up your environment variables (Crucial for Database & Auth):
```bash
nano .env
# Copy your local .env content here and press Ctrl+O, Enter, Ctrl+X
```

5. Install and Build the application:
```bash
npm install
npm run build
```

6. Start both the App and the WhatsApp Bot 24/7 with PM2:
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
# Copy and run the command 'pm2 startup' gives you to enable autostart on reboot.
```

7. Verify the bot is running:
```bash
pm2 list
pm2 logs bill-whatsapp
```

8. Go to your settings page and scan the QR code now. It will stay connected forever!
