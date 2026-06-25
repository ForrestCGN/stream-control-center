# CHANGELOG

## RDAP31B_ADMIN_NOTE_WRITE_BACKEND_DISABLED_UI_LIVE_CONFIRMED_DOCS - 2026-06-25

- RDAP31 Live-Deploy dokumentiert.
- Service-Status dokumentiert: active/running.
- `/api/remote/routes` RDAP31-Status dokumentiert.
- Sicherheitstest ohne Confirm dokumentiert:
  - HTTP 400
  - `confirm_write_required`
  - keine Writes
- Sicherheitstest mit Body-Confirm ohne Session dokumentiert:
  - HTTP 401
  - `not_logged_in_or_session_invalid`
  - keine Writes
- DB-Gegencheck dokumentiert:
  - `note_count = 1`
  - nur RDAP29-Testnotiz vorhanden
- Befund dokumentiert:
  - `confirmWrite=true` per Query wurde nicht erkannt
  - `confirmWrite` im JSON-Body funktioniert
- Naechster Step: RDAP32 Audit-/Lock-Write echte Grundlage.
