# CURRENT STATUS

Stand: EVS-2 / Stream Events Backend Foundation
Datum: 2026-06-13
Projekt: ForrestCGN / stream-control-center

## Zweck dieses Stands

Dieser Stand führt nach EVS-1 die erste Backend-Basis für das geplante Event-System ein.

EVS-2 ist bewusst ein kleiner, sicherer Foundation-Step:

- keine Dashboard-UI
- keine Twitch-Chat-Auswertung
- kein Sound-/Video-Playback
- kein Overlay
- keine produktive Auszahlung

## Basis / Single Source of Truth

- Repo: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Live-Ziel: `D:\Streaming\stramAssets`
- Dashboard: `http://127.0.0.1:8080/dashboard`
- Produktive SQLite-Datenbank: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`

## Wichtige Arbeitsregel weiterhin gültig

- Nicht raten.
- Echte Dateien / GitHub-dev / hochgeladene Dateien als Single Source of Truth verwenden.
- Keine Apply-Scripte.
- Keine Patch-Scripte.
- Keine PowerShell-Regex-Patches.
- Keine Inline-Set-Content-Fixes.
- Keine Funktionalität entfernen.
- SQLite-Datenbank niemals ersetzen/überschreiben.
- Änderungen nur als vollständige Ersatzdateien oder ZIPs mit echten Zielpfaden liefern.

## EVS-2 umgesetzt

Neue Datei:

```text
backend/modules/stream_events.js
```

Neue Doku:

```text
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS_2_STREAM_EVENTS_BACKEND_FOUNDATION.md
```

## Stream Events Backend-Basis

Enthalten:

- Modul-Meta / Version / Build
- automatische Ladbarkeit über bestehendes `backend/server.js`-Modulmuster
- `GET /api/stream-events/status`
- `GET /api/stream-events/routes`
- `GET /api/stream-events/texts`
- Event-Entwürfe erstellen/listen/lesen/bearbeiten
- Sound und/oder Text am Event auswählbar
- Validierung der gewählten Spieltypen
- Start blockiert, wenn Event nicht valide ist
- nur ein aktives Event gleichzeitig
- Finish/Cancel
- Score-Ledger
- Ranking/Top 3
- Bus-Registrierung / Heartbeat / Status-Publishing
- erste Textvarianten via `helper_texts`

## Neue DB-Tabellen

Sanft angelegt per `database.ensureSchema` und `CREATE TABLE IF NOT EXISTS`:

```text
stream_events_events
stream_events_score_entries
stream_events_rounds
```

## Nicht geändert durch EVS-2

- Kein Dashboard-Code.
- Keine bestehende Dashboard-Navigation.
- Keine Twitch-/Streamer.bot-Flows.
- Keine bestehende Loyalty-/Gamble-/Giveaway-Logik.
- Kein Sound-System-Code.
- Kein Media-System-Code.
- Keine produktive SQLite-Datei ersetzt.
- Keine bestehenden Tabellen gelöscht oder umgebaut.

## Tests

```powershell
node -c .\backend\modules\stream_events.js
```

Nach Serverstart:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,routeCount,lastError
$s.diagnostics
```

## Nächster Schritt

EVS-3: Dashboard-Skeleton für Stream Events.

Ziel:

- Eventliste
- Event erstellen
- Sound/Text auswählen
- Validierungsstatus verständlich anzeigen
- Sound-/Text-Konfiguration über einfache Dialogstruktur vorbereiten

Noch nicht:

- Chat-Auswertung
- Playback
- Overlay
