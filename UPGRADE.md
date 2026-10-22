# Upgrading to v0.4.0 — Self-Update (check, release bundling, apply/rollback)

This release adds an "Up-to-date" / "Update → vX.Y.Z" badge on the About page (checked
against this repo's public GitHub Releases, no token needed), a `.github/workflows/release.yml`
that builds and publishes a release bundle on tag push, and an admin-only upload → apply →
rollback flow that runs as a Tail Modal job. No database schema changes are included in
this release — you can skip any Prisma migration step below.

**This upgrade is different from the usual one**: the apply/rollback mechanism needs a
release-directory + `current`-symlink layout instead of the flat `git pull`-in-place
layout this project has used until now (see README.md's "Self-Update" section for *why*:
overwriting files in place while the running process still has them loaded isn't safe).
Adopting that layout is a one-time, manual migration — steps 3–7 below. **After this
upgrade, every future release goes through the About page's upload/apply/rollback panel
instead of `git pull` on the server** (you still `git tag` + push from dev as usual — see
README.md's "Self-Update" section for that half).

Versions after this upgrade:
- `autobk-controller`: `VERSION` → `0.4.0`, `ui/VERSION` → `0.4.0`

This assumes the single-box layout from this repo's own README (`/opt/autobk-controller`,
nginx + PHP-FPM, systemd or pm2 running the API). Adjust paths if yours differs.

---

## 0. Back up first

```bash
# .env holds secrets, is gitignored, git pull won't touch it -- back it up anyway
sudo cp /opt/autobk-controller/api/.env /opt/autobk-controller/api/.env.bak

# No schema changes in this release, but cheap insurance
mysqldump -u AutoBk -p AutoBk > ~/autobk-db-backup-$(date +%Y%m%d).sql
```

## 1. Stop the API

Pick whichever matches how you currently run it:

```bash
sudo systemctl stop autobk-api
# or: pm2 stop autobk-api
# or: pkill -f "node dist/server.js"
```

A brief outage is expected for this one migration — it isn't required for ordinary
releases after this (that's the entire point of the apply/rollback flow you're installing).

## 2. Pull this release into the existing checkout

Still in-place at this point, before the directory restructure below:

```bash
cd /opt/autobk-controller
git pull

cd api
npm ci
npm run build

cd ../ui
composer install --no-dev
cd ..
```

## 3. Restructure into the releases/current layout

```bash
# Move the whole existing checkout aside, it becomes the first tracked release
sudo mkdir -p /tmp/autobk-migrate
sudo mv /opt/autobk-controller /tmp/autobk-migrate/0.4.0

# Rebuild /opt/autobk-controller as the install root (no longer the repo itself)
sudo mkdir -p /opt/autobk-controller/releases /opt/autobk-controller/shared \
              /opt/autobk-controller/var/updates/staging
sudo mv /tmp/autobk-migrate/0.4.0 /opt/autobk-controller/releases/0.4.0
```

## 4. Move `.env` into `shared/` and symlink it back

```bash
sudo mv /opt/autobk-controller/releases/0.4.0/api/.env /opt/autobk-controller/shared/.env
sudo ln -s /opt/autobk-controller/shared/.env /opt/autobk-controller/releases/0.4.0/api/.env
```

Every future release's `api/.env` is this same symlink — the real file is never duplicated
or bundled, so secrets never end up in a release tarball.

## 5. Add the new `.env` variable

```bash
echo "RELEASES_DIR=/opt/autobk-controller/releases" | sudo tee -a /opt/autobk-controller/shared/.env
```

See `.env.example` for the optional `GITHUB_TOKEN` / `CACHE_TTL_GITHUB_RELEASE` variables
too — neither is required, both only affect the About-page check's GitHub API rate limit.

## 6. Point `current` at this release

```bash
sudo ln -s /opt/autobk-controller/releases/0.4.0 /opt/autobk-controller/current
```

## 7. Install the systemd unit and update nginx

```bash
sudo cp /opt/autobk-controller/current/deploy/autobk-api.service /etc/systemd/system/autobk-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now autobk-api
```

Edit `/etc/nginx/sites-available/autobk` — the PHP `root` must follow the symlink now:

```nginx
    root /opt/autobk-controller/current/ui/web;
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

If you were running the API with pm2 or `nohup` instead of systemd, point that at
`/opt/autobk-controller/current/api/dist/server.js` the same way — the unit file above is a
reference, not a requirement.

---

## 8. Verify

1. Load the About page (any logged-in user) and confirm the version shown is `0.4.0` and
   the update badge renders ("Up-to-date", since you're now on the latest release).
2. Log in as an **Administrator** and confirm the new Self-Update panel appears below
   Version Info, with a file picker and a Rollback button.
3. Confirm `systemctl status autobk-api` shows `active (running)` with `WorkingDirectory`
   resolved through `current`.
4. `ls -la /opt/autobk-controller/current` should show it's a symlink to
   `releases/0.4.0`; `cat /opt/autobk-controller/current/api/.env` should show the contents
   of `shared/.env` (i.e. the symlink resolves correctly).
5. Leave the actual upload/apply/rollback flow for the *next* release you cut — there's
   nothing to apply yet on this one. See README.md's "Self-Update" section for that flow
   once you tag a `v0.5.0` or later.

If nginx 404s after step 7, double-check the `root` line actually points at
`current/ui/web`, not the old flat path. If systemd fails to start, check
`journalctl -u autobk-api` — the most common cause is `WorkingDirectory` not resolving
because `current` wasn't created (step 6) or points at the wrong place.
