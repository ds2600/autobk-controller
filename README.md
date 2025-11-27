# AutoBk Controller

---

## 1. System Prep

### 1.1 Update and install base packages

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install -y \
    git curl build-essential \
    python3 python3-venv python3-pip \
    nginx \
    mariadb-server mariadb-client
```

If you prefer Apache instead of Nginx:

```bash
sudo apt install -y apache2 libapache2-mod-proxy-html libxml2-dev
```

---

## 2. Install Node.js (LTS)

Install Node.js LTS (e.g. 20.x):

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify:

```bash
node -v
npm -v
```

---

## 3. Database Setup (MariaDB/MySQL)

Log into MariaDB:

```bash
sudo mysql
```

Create database and user:

```sql
CREATE DATABASE autobk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'autobk'@'localhost' IDENTIFIED BY 'YOUR_STRONG_DB_PASSWORD';
GRANT ALL PRIVILEGES ON autobk.* TO 'autobk'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 4. Clone AutoBk Controller

```bash
sudo mkdir -p /opt/autobk-controller
sudo chown "$USER":"$USER" /opt/autobk-controller
cd /opt/autobk-controller

git clone https://github.com/ds2600/autobk-controller.git .
cd api
npm install 

cd ../ui
composer install
```

---

## 5. Configure Environment (.env)

Create `.env` and modify as appropriate:

```bash
cd /opt/autobk-controller/api/
cp .env.example .env
```

---

## 6. Prisma Migrations & Seed

```bash
cd /opt/autobk-controller/api
npx prisma migrate deploy
npm run db:seed -- --create-admin-user
```

---

## 7. Run AutoBk Controller API

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

PM2:

```bash
pm2 start dist/server.js --name autobk-api
pm2 save
pm2 startup
```

---

## 8. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/autobk`:

```nginx
server {
    listen 80;
    server_name autobk.example.com;
    
    root /opt/autobk-controller/ui/web;   
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/run/php-fpm/www.sock;  # or 127.0.0.1:9000
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/autobk /etc/nginx/sites-enabled/autobk
sudo nginx -t
sudo systemctl restart nginx
```

---

## 9. Daily Report Cron

Run manually:

```bash
npm run job:send-last24-report
```

Add cron:

```cron
0 7 * * * cd /opt/autobk-controller/api && npm run job:send-last24-report >> /var/log/autobk-report-cron.log 2>&1
```

---

## 10. Install AutoBk Agent

```bash
cd /opt/autobk
git clone repo_url
cd agent

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

## Additional Notes

### Seeding the database
```bash
npm run db:seed -- --create-admin-user # Create an admin user based on .env ADMIN_EMAIL and ADMIN_PASSWORD
npm run db:seed -- --devices=X # Create X test devices
npm run db:seed -- --seed-test-data # Seed test data for devices
```

---
