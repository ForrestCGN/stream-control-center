# Changelog

## 2026-05-03

### STEP012 - Zentrale Hug/Rehug Command-Route

- `backend/modules/hug_command.js` ergänzt.
- Neue Route:
  - `POST /api/hug/command`
  - `GET /api/hug/command` fuer einfache Tests
- Zweck: Streamer.bot muss künftig keine C#-URL-Bau-Scripte mehr ausführen.
- Streamer.bot sendet nur noch Command, Actor-Daten und Inputs an Node.
- Node entscheidet intern:
  - `!hug top`
  - `!hug top received`
  - `!hug top rehug`
  - `!hug reload`
  - `!hug all`
  - `!hug on/off`
  - `!hug stats [user]`
  - `!hug @user`
  - `!rehug @user`

### STEP011 - Hug-Output-Modus sicher umschaltbar

- `backend/modules/hug_output_mode.js` ergänzt.
- Neue Routen:
  - `GET /api/hug/db/output-mode`
  - `POST /api/hug/db/output-mode`
- Erlaubte Modi:
  - `streamerbot`
  - `central`
- Zweck: Hug/Rehug kontrolliert von Streamer.bot-Ausgabe auf zentrale Heimleitung-/Bot-Ausgabe umstellen.

### STEP010 - DB-backed Hug/Rehug API Bridge vorbereitet

- `backend/modules/hug_00_api_db.js` ergänzt.
- Bestehende Streamer.bot-GET-Routen werden vorgeschaltet weiter bedient:
  - `GET /api/hug/cmd`
  - `GET /api/hug/statscmd`
  - `GET /api/hug/top`
  - `GET /api/hug/reload`
- Hug-/Rehug-Texte, Response-Texte und Top-Titel werden aus SQLite gelesen:
  - `hug_types`
  - `hug_texts`
  - `hug_settings`
- Zentrale Chat-Ausgabe über `helper_chat_output.js` wird unterstützt.
- Das alte `backend/modules/hug_system.js` wurde nicht entfernt und nicht überschrieben.
- Neue Diagnose-Routen:
  - `GET /api/hug/db/status`
  - `GET /api/dashboard/community/hug/status`

### STEP009 - Hug-Text-Store in SQLite vorbereitet

- `backend/modules/hug_text_store.js` ergänzt.
- Neue Tabellen werden migrationssicher angelegt:
  - `hug_settings`
  - `hug_types`
  - `hug_texts`
- Bestehende Statistik-Tabellen bleiben unverändert:
  - `hug_users`
  - `hug_pair_stats`
  - `hug_pending_rehugs`
- Erstimport aus `config/messages/hug.json` in SQLite, aber nur wenn DB-Typen/Texte noch leer sind.
- Neue Diagnose-Routen:
  - `GET /api/hug/text-store/status`
  - `GET /api/dashboard/community/hug/text-store/status`
  - `POST /api/hug/text-store/reload`
- Bestehende Hug-/Rehug-Kommandos und Routen wurden nicht verändert.

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
