# Upgrading to v0.2.0 — EAS (OneNet Software Version report)

This release adds an "EAS" nav item to the Controller with a card that runs
`usr_autobk_version_OneNet.py` (on the agent host) on demand and lets you
download the most recent CSV result. No database schema changes are included
in this release — you can skip the Prisma migration step below.

Versions after this upgrade:
- `autobk-agent`: `VERSION` → `0.2.0` (new file — this is the first tracked
  version for that repo)
- `autobk-controller`: `VERSION` → `0.2.0`, `ui/VERSION` → `0.2.0`

Follow the steps in order. Steps 1–2 are on the **agent** host, steps 3–7 are
on the **controller** host (skip anything host-specific if both run on the
same box, which is the assumed/default deployment).

---

## 0. Back up first

```bash
# Config files (both hold secrets, both are gitignored, `git pull` won't touch them,
# but back them up anyway before touching anything)
sudo cp /opt/autobk-agent/autobk.ini /opt/autobk-agent/autobk.ini.bak
sudo cp /opt/autobk-controller/api/.env /opt/autobk-controller/api/.env.bak

# Database (no schema changes in this release, but cheap insurance)
mysqldump -u AutoBk -p AutoBk > ~/autobk-db-backup-$(date +%Y%m%d).sql
```

---

## 1. Update autobk-agent

```bash
cd /opt/autobk-agent
sudo -u autobk-agent git pull
sudo -u autobk-agent /opt/autobk-agent/venv/bin/pip install -r requirements.txt
```

No new dependencies were added, so the `pip install` above is a no-op safety
check, not a requirement.

## 2. Configure the agent's EAS output directory

Add a new `[EAS]` section to `/opt/autobk-agent/autobk.ini` (see the updated
`autobk.ini.example` for reference):

```ini
[EAS]
Directory = /opt/autobk-eas
```

Then create that directory with the same ownership as the backups directory:

```bash
sudo mkdir -p /opt/autobk-eas
sudo chown autobk-agent:autobk-agent /opt/autobk-eas
```

No service restart is needed here — `usr_autobk_version_OneNet.py` is a
manual/on-demand script, not part of the `srvc_autobk.py` daemon loop. The
Controller API will invoke the updated file directly the next time you click
"Run Scrape."

---

## 3. Update autobk-controller

```bash
cd /opt/autobk-controller
git pull

cd api
npm install

cd ../ui
composer install
```

No new npm or composer packages were actually added by this release, so both
install commands are a no-op safety check.

## 4. Update the controller's `api/.env`

Add these two new variables (see the updated `.env.example` for reference):

```ini
AGENT_PYTHON=/opt/autobk-agent/venv/bin/python3
EAS_RUN_TIMEOUT_MS=600000
```

Confirm your existing `AGENT_DIR` value is the directory that actually
contains both `autobk.ini` *and* `usr_autobk_version_OneNet.py` (i.e. the
agent checkout root, typically `/opt/autobk-agent/`) — the API now resolves
the script path from this same variable.

**`AGENT_DIR` must resolve to the exact same `autobk.ini` the agent reads**,
and that ini's `[EAS] Directory` from step 2 is where the API will look for
the CSV report. If these paths disagree, "Download Latest CSV" will 404 even
after a successful run.

## 5. Rebuild and restart the API

```bash
cd /opt/autobk-controller/api
npm run build
```

Restart however you currently run it — pick the one that matches your setup:

```bash
# systemd / plain start
sudo systemctl restart autobk-api

# PM2
pm2 restart autobk-api

# nohup (find and replace the old process)
pkill -f "node dist/server.js"
nohup npm start > autobk-api.log 2>&1 &
```

A restart is required — this is new router/module code, and Node won't pick
it up without one. The PHP UI files need no restart (interpreted per
request).

## 6. Increase the Nginx proxy timeout for `/api/`

A full OneNet scrape (50–75 devices, each requiring a couple of HTTP round
trips) can take a few minutes. Nginx's default `proxy_read_timeout` is 60
seconds, which will cut the "Run Scrape" request off before the script
finishes even though the script keeps running server-side. Edit
`/etc/nginx/sites-available/autobk` and extend the `/api/` location:

```nginx
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
```

Then reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Verify

1. Log in to the Controller as an **Administrator** and open the new **EAS**
   nav item.
2. Click **Run Scrape**. This should block (spinner) for up to a few minutes,
   then show a success toast.
3. Click **Download Latest CSV** and confirm the file has `Device Name, IP
   Address, Software Version, OS Version` columns.
4. Log in as a **non-admin** user and confirm the **Run Scrape** button is not
   shown, but **Download Latest CSV** still works if a report already exists.
5. Check `/opt/autobk-agent/autobk.log` if a scrape reports partial failures —
   per-device errors are logged there with the failing device name/IP.

If step 2 fails immediately with an error mentioning `[EAS] Directory`, you
missed step 2. If it fails with a spawn/ENOENT-type error, double check
`AGENT_PYTHON` and `AGENT_DIR` in `api/.env` point at real, existing paths on
the controller host.
