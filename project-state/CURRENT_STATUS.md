# CURRENT_STATUS – Command-System / Medienverwaltung Checkpoint

Stand: 2026-05-22

## Bestätigt live

### STEP273A1 – Command-System Core Fix
- Backend-Modul `backend/modules/commands.js` läuft stabil.
- `/api/commands/status` funktioniert.
- `/api/commands/list` funktioniert.
- `/api/commands/logs` funktioniert.
- `/api/commands/history` funktioniert als Alias.
- `/api/commands/execute` führt Commands aus.
- Twitch-Chat-Hook über `twitch_presence.js` wurde live bestätigt.
- Deathcounter-Routing über `!dcount show` funktioniert.
- `lastError` ist leer.

### STEP273B2 – Commands Dashboard Tabs
- Dashboard-Bereich `Community → Commands` wurde als Tab-Struktur geplant/geliefert.
- Aufbau: Übersicht, Commands, Rechte & Cooldowns, Logs, Diagnose.
- Ziel: Keine Monster-Seite.

### STEP273C – Command Action Types
- Command-Dashboard wurde auf Action-Typen vorbereitet.
- Action-Typen:
  - `module_command`
  - `chat_message`
  - `random_text`
  - `sound_play`
  - `video_play`
  - `http_request`
  - `multi_action`
- Technische Router-Felder liegen unter „Erweitert“.

### STEP273C1 – Modul-Command-Catalog
- Backend-Route `/api/commands/catalog` läuft.
- Status zeigt `step=STEP273C1`.
- Katalog enthält Kategorien und erste Deathcounter-Actions.
- `/api/commands/status` enthält `moduleCatalog`.
- Regel dokumentiert: Neue Module müssen ihren Command-Katalog pflegen oder im zentralen Catalog ergänzt werden.

### STEP274A1C – Media Core Syntax Fix
- `backend/modules/media.js` wird vom Backend geladen.
- `/api/media/status` funktioniert.
- Status zeigt `step=STEP274A1C`.
- `schemaOk=True`.
- `/api/media/list?type=audio` funktioniert.
- `/api/media/list?type=video` funktioniert.
- Live gezählte Medien:
  - 217 Audio
  - 10 Video
  - 31 Bilder
  - 0 Animationen
  - 258 Gesamt

## Geliefert, aber noch nicht final bestätigt

### STEP273C2 – Command Catalog Expansion
- ZIP wurde geliefert: `STEP273C2_command_catalog_expansion.zip`.
- Ergänzt geplante Kategorien:
  - Deathcounter
  - Hug-System
  - Clips / Content
  - Tagebuch
  - Todo
  - System / Medien
- Wichtig: Tagebuch und Todo sind getrennte Systeme und sollen getrennt im Katalog bleiben.
- Hug/Rehug soll enthalten:
  - `!hug`
  - `!rehug`
  - `!hugstats`
  - `!hugtop`
  - `!hugtopreceived`
  - `!rehugtop`
  - `!hugon`
  - `!hugoff`
  - `!hugreload`
- Noch prüfen/anwenden, falls nicht bereits erledigt.

### STEP274B – Media Dashboard
- ZIP wurde geliefert: `STEP274B_media_dashboard.zip`.
- Geplant als zentrale Dashboard-Seite `System → Medien`.
- Funktionen:
  - Scan
  - Upload
  - Vorschau
  - Metadaten bearbeiten
  - Soft-Delete
  - Datei endgültig löschen
- Noch anwenden/testen.

## Wichtige Architekturregeln

- Bestehende Funktionalität nicht entfernen.
- Reale Repo-/Live-Dateien sind immer Single Source of Truth.
- SQLite `D:\Streaming\stramAssets\data\sqlite\app.sqlite` nur erweitern, nie überschreiben.
- Neue Medienverwaltung ist zentral für alle Module gedacht, nicht nur Commands.
- Commands sollen Medien nur referenzieren, nicht selbst Medien verwalten.
- Neue Module müssen künftig einen Command-Catalog bereitstellen oder im zentralen Katalog ergänzt werden.
- Dashboard-Seiten nicht als Monster-Seiten bauen, sondern mit Tabs/Unterbereichen.
- Icons statt Textbuttons bevorzugen, wo sinnvoll; gefährliche Aktionen mit Tooltip/Bestätigung.
