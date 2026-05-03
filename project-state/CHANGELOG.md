# Changelog

## 2026-05-03

### STEP008 - Zentrale Chat-Ausgabe vorbereitet

- `backend/modules/helpers/helper_chat_output.js` ergänzt.
- `backend/modules/chat_output.js` ergänzt.
- `config/chat_output.json` ergänzt.
- Neue Diagnose-/Test-Routen:
  - `GET /api/chat-output/status`
  - `POST /api/chat-output/send`
  - `POST /api/chat-output/reload`
- Ziel: zentrale Chat-Ausgabe für Backend-Module vorbereiten, bevorzugt über Bot/Heimleitung, optional Fallback auf Streamer-Account und Streamer.bot-Fallback.
- Bestehende Hug-/Rehug-Kommandos und Routen wurden nicht verändert.

## 2026-05-01

### Repository bootstrap

- Repository `ForrestCGN/stream-control-center` eingerichtet.
- Branch `dev` angelegt.
- `.gitignore` angelegt, damit Secrets, SQLite-Dateien, Logs, ZIPs und lokale Backups nicht versehentlich committet werden.
- Projektstatus-Dateien vorbereitet.

### Lokaler Chat-/ZIP-Stand vor Repo-Bootstrap

- STEP005: Userinfo im Stream-Desk funktioniert.
- STEP006: Admin > Configs und ENV-/Secrets-Strategie vorbereitet.
- STEP007: Stream-Desk QuickScenes / Config-UI vorbereitet.
