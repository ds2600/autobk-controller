# Roadmap

Ideas and planned work that aren't scheduled yet. Not a commitment or a
sequence — just a backlog of things worth doing.

## Developer-pushed announcements

Let the project maintainer (not a per-install admin) push a message that
shows up in every deployed Controller instance — e.g. "update your PHP
version" or "autobk-agent 0.3.0 is out, here's why you should upgrade."

Shape of it, following the pattern several self-hosted tools use (WordPress
core's admin notices, Discourse, GitLab's update-check banner):

- Publish a small JSON manifest in the `autobk-controller` GitHub repo (e.g.
  `announcements.json`, fetched via `raw.githubusercontent.com`) containing
  the current active announcement(s) — message, severity, maybe an id/expiry
  so dismissed ones don't reappear.
- Controller polls that URL on an interval (cron job, cached with a TTL —
  Redis if enabled, in-memory/DB fallback otherwise) rather than fetching it
  per page load.
- Render whatever's active in the shared chrome (`ui/src/components/navbar.php`
  / `head.php`) so it shows everywhere without per-page wiring.
- Maintainer edits the JSON file and pushes — no auth or backend needed on
  the publishing side.

Open questions / tradeoffs to settle before building:
- Requires outbound internet access from the controller host to GitHub —
  need to confirm that's acceptable for all expected deployments (not fully
  air-gapped).
- Per-user dismiss/ack tracking (vs. a single global "is this active"
  banner) adds a join table or localStorage flag — worth deferring until
  there's a concrete need for it.

## Dependency updates: safe batch

Bundle the minor/patch-only npm and composer bumps that stay within their
current major version — same contract, no app code changes expected.

- npm (`api/`): `@types/nodemailer`, `cookie`, `cors`, `express`, `ioredis`,
  `jsonwebtoken`, `nodemailer`, `tsx`, `uuid`, `yaml`, `@types/node` — all
  patch/minor bumps within the currently-declared semver range.
- `npm install` to materialize `multer` and `tar`, which are already
  declared correctly in `package.json` but missing from `node_modules` as
  of this writing — not a version change, just a broken install.
- composer (`ui/`): `vlucas/phpdotenv` 5.6 → 5.7 (minor, no major
  available).

**Version:** one patch release once landed and tested (next one after
0.5.1, i.e. 0.5.2).

## Dependency updates: major-version migrations

Each of these is its own major-version jump with real behavior-change
risk — handle one at a time, not as a single bulk update. Roughly in order
of urgency/risk:

1. **Prisma (`prisma` + `@prisma/client`)** — both are pinned as the
   literal string `"latest"` in `package.json` rather than a semver range,
   which is already a live risk (floats to whatever's newest on every
   fresh install, no review). The CLI's current "latest" dist-tag is an
   unreleased release candidate (8.0.0-rc.27), one major ahead of the
   client's stable latest (7.10.1) — fix the pinning *and* settle on a
   matching stable major for both before touching anything else here.
2. **ini** (6 → 7) — single call site (`constants.ts`), but it's the
   agent's `autobk.ini` parse that happens at module-import time; if
   parsing behavior shifted at all, the whole API fails to start.
3. **cookie** (1 → 2) — only `cookie.parse()` is used, in the JWT-cookie
   auth path (`auth.ts`).
4. **express** (4 → 5) — async middleware error-handling changed; touches
   every router/controller.
5. **pino + pino-http** (9→10 / 10→11) — paired, move together; logging
   config/transport API has changed.
6. **helmet** (7 → 8) — confirm no code relies on old default header
   values.
7. **nodemailer** (7 → 10) — three majors in one jump; used for admin-seed
   email and the daily report job, can't verify actual sending without
   live SMTP.
8. **typescript** (5 → 7, skips 6 entirely) — compiler major, likely
   surfaces new strictness errors across the whole codebase.
9. **uuid** (13 → 14) — only used as `import { v4 as uuid }` in
   `requestId.ts`; probably low-risk but majors here have dropped older
   Node versions too, confirm against the project's actual Node version.
10. **zod** (3 → 4) — real API rewrite; every module's `*.schemas.ts` uses
    it, so this is a validation-layer-wide migration, not a dependency
    bump. Biggest-effort item here; may deserve its own project rather
    than living in this list.
11. **firebase/php-jwt** (6 → 7, composer) — used directly in
    `ui/src/bootstrap.php` (`JWT::decode()` / `Key`) to authenticate every
    PHP page. Most security-sensitive item on this list — isolate and
    test the login path thoroughly before it ships.

Also found along the way:
- `check-disk-space` is unused (`diskusage` is the package actually doing
  disk-usage reporting) — candidate to remove rather than update.
- `@types/express` and the Node-26-era `@types/node` major should only
  move in lockstep with the real runtime major they track (Express 5,
  Node 26) — bumping types alone is worse than not bumping.

**Version:** each migration lands as its own patch release once tested
(0.5.3, 0.5.4, ... in whatever order they're tackled) rather than bundling
several majors into one release — keeps each one bisectable if something
breaks in production.
