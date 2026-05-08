# CHANGELOG Append – STEP201.9 Hug/Rehug

## 2026-05-08

- Added STEP201 diagnostic endpoints for Hug/Rehug under `/api/hug`.
- Added non-destructive `POST /api/hug/reload` without chat output.
- Kept existing `GET /api/hug/reload` command behavior unchanged.
- Kept `/api/rehug`, `/api/hug-system` and `/api/hugs` intentionally unregistered as module prefixes.
