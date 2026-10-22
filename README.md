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
sudo chmod -R 755 /opt/autobk-controller
sudo chmod -R 644 /opt/autobk-controller/ui/web
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
npx prisma generate
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

Background:
```bash
nohup npm start > autobk-api.log 2>&1 &
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

## 11. Self-Update

The About page shows an "Up-to-date" / "Update → vX.Y.Z" badge for any logged-in user,
checked against this repo's [GitHub Releases](https://github.com/ds2600/autobk-controller/releases)
(no token needed — the repo is public; see `GITHUB_TOKEN` in `.env.example` if you want a
higher API rate limit). Administrators additionally get an upload/apply/rollback panel.

**This is opt-in.** Out of the box, only the check/badge works — a fresh `git clone` install
following steps 1–10 above runs fine with no further setup, and ignoring the self-update
panel entirely is a supported way to run this project. The upload/apply/rollback flow only
works once you've adopted the release-directory layout below, because applying an update
in place while the same process is still running it is not safe.

### Directory layout the apply/rollback jobs assume

```
/opt/autobk-controller/
  releases/
    0.3.0/            # a previous release, kept for rollback
    0.4.0/
      api/
        .env -> ../../../shared/.env   # symlinked, never duplicated
        dist/
        node_modules/                  # npm ci runs fresh per release
        prisma/
      ui/
        vendor/                        # composer install runs fresh per release
        web/
        src/
      certs -> ../../shared/certs      # symlinked too, if nginx serves TLS from inside
                                        # the release tree -- optional, skipped if absent
  shared/
    .env                               # the one real api/.env — holds secrets, never
                                        # part of a release bundle or source control
    certs/                             # TLS certs, same reasoning as .env -- server-
                                        # specific, never part of a release bundle
  current -> releases/0.4.0            # the running service follows this symlink
  var/
    updates/
      staging/                         # uploaded bundles are extracted here before apply
```

`RELEASES_DIR` in `api/.env` points at `releases/`; `shared/`, `current`, and
`var/updates/staging/` are derived as siblings of it (see `api/src/modules/updates/updates.service.ts`).

### One-time migration to this layout

If you're running from a plain `git clone` (the default install above), moving to the
symlink layout is a manual, one-time step — see `UPGRADE.md` for the exact commands for
the version that introduced this. The short version: move your existing checkout into
`releases/<current version>/`, move `api/.env` into `shared/.env` and symlink it back,
create the `current` symlink pointing at that release dir, and point your process
supervisor at `current` instead of the old fixed path — a reference systemd unit is at
`deploy/autobk-api.service`.

### Using it day to day

1. Bump `VERSION` and `ui/VERSION` together, commit, then `git tag vX.Y.Z && git push origin vX.Y.Z`.
2. `.github/workflows/release.yml` builds a combined `autobk-controller-vX.Y.Z.tar.gz` +
   `.sha256` and publishes them as a GitHub Release on that tag — see the workflow file
   for exactly what's bundled.
3. On the server: download the `.tar.gz` from that release page, upload it in the About
   page's admin panel (checksum is verified against the published release automatically),
   then click **Apply Update**. The Tail Modal shows live progress (`npm ci`, `composer
   install`, `prisma migrate deploy`, then the symlink swap); the API process exits itself
   at the end so systemd/pm2 brings it back up on the new release.
4. If something's wrong after an apply, click **Rollback** — it repoints `current` back to
   the previous release directory and restarts the same way. No database migration is
   reversed (this project's schema changes are additive-only, so old code against a newer
   schema is expected to be safe).

---

## Additional Notes

### Seeding the database
```bash
npm run db:seed -- --create-admin-user # Create an admin user based on .env ADMIN_EMAIL and ADMIN_PASSWORD
npm run db:seed -- --devices=X # Create X test devices
npm run db:seed -- --seed-test-data # Seed test data for devices
```

---
