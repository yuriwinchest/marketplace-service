# Security Audit Notes (Local Ops + Secrets)

## What Was Found

- There were local ops scripts containing real credentials (DB password, JWT secret, VPS password prompts).
  - Examples include: `setup_env_remote*.sh`, `update_env_remote.ps1`, and similar helper scripts.
- A Supabase key example was present in `CHANGELOG_SUPABASE_MIGRATION.md` and has been sanitized to `...`.

## What Was Changed

- Added ignore rules so local ops/deploy scripts do not get committed:
  - `deploy.ps1` and other `setup_*` / `fix_*` / `update_env_remote.ps1` helpers are now ignored.
- Added safe templates:
  - `deploy.example.ps1` (no secrets, env-var driven)
  - `backend/.env.example`, `frontend/.env.example`

## Required Operational Rules (Do This)

- Never commit secrets to git:
  - `.env` files and local deploy scripts must remain untracked.
- Store production secrets only on the server:
  - `/opt/servicoja/backend/.env` should be owned by root and permission `600`.
- Use `SUPABASE_SERVICE_ROLE_KEY` only in backend (server-side).
  - Never expose it to the frontend.

## If Anything Was Ever Committed

Git history can still contain old secrets even after you delete them.
If you suspect a secret was committed at any time:

1. Rotate the secret (DB password, Supabase JWT/API keys, etc.).
2. Rewrite history (ex.: `git filter-repo` / BFG) if necessary.

