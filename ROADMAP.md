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
