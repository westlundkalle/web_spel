#!/bin/bash
set -e

# Redirect output for logging and troubleshooting
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
echo "=== Starting Automated Web Spel Server Provisioning ==="

# 1. Update system packages
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y python3 python3-pip python3-venv git nginx curl

# 2. Clone application repository from GitHub
APP_DIR="/opt/web_spel"
echo "Cloning application from ${repo_url} into $APP_DIR..."
rm -rf "$APP_DIR"
git clone "${repo_url}" "$APP_DIR"

# 3. Create Python virtual environment and install dependencies
cd "$APP_DIR"
python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

# 4. Generate .env file
echo "Configuring environment variables..."
cat << 'EOF' > "$APP_DIR/.env"
OPENAI_API_KEY=${openai_api_key}
OPENAI_MODEL=gpt-4o-mini
PORT=5000
FLASK_ENV=production
EOF

# Ensure proper permissions
chown -R ubuntu:ubuntu "$APP_DIR"

# 5. Create Systemd Service for Gunicorn / Flask
echo "Configuring Systemd service..."
cat << 'EOF' > /etc/systemd/system/web_spel.service
[Unit]
Description=Cyber Survivor Arcade Gunicorn Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/web_spel
Environment="PATH=/opt/web_spel/venv/bin"
EnvironmentFile=/opt/web_spel/.env
ExecStart=/opt/web_spel/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable web_spel.service
systemctl restart web_spel.service

# 6. Configure Nginx Reverse Proxy
echo "Configuring Nginx reverse proxy on port 80..."
cat << 'EOF' > /etc/nginx/sites-available/web_spel
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /static/ {
        alias /opt/web_spel/static/;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# Replace default Nginx site and restart
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/web_spel /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

echo "=== Deployment Completed Successfully ==="
