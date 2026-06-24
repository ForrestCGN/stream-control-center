# CHANGELOG - stream-control-center

## 2026-06-24 - RDAP AUTH1 Twitch Login gated vorbereitet

Status: ZIP-Step vorbereitet

Inhalt:

- Twitch OAuth Start/Callback gated vorbereitet
- OAuth State per HMAC/HttpOnly-Cookie
- Session-Cookie vorbereitet
- User/Identity/Session Writes nur bei aktiven Env-Gates
- `/api/remote/auth/me` erkennt echte Session
- UI zeigt Loginstatus und Login/Logout
- Ohne Secrets/Flags bleibt Start/Callback HTTP 403

Keine Änderung:

- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Migration
- keine Secrets
