# CURRENT CHAT HANDOFF – EVS-22 Dashboard Safety View

Stand: 2026-06-13

## Step

EVS-22 – Dashboard Safety View

```text
MODULE_VERSION = 0.5.14
MODULE_BUILD   = STEP_EVS_22_DASHBOARD_SAFETY_VIEW
```

## Geändert

- `backend/modules/stream_events.js`: Version/Build auf EVS-22 angehoben. Keine Runtime-/Sendelogik geändert.
- `htdocs/dashboard/modules/stream_events.js`: neuer Tab `Sicherheit`.
- `htdocs/dashboard/modules/stream_events.css`: Styling für Safety View.
- Doku/Projektstand aktualisiert.

## Dashboard Safety View

Der neue Tab zeigt:

- TESTMODUS oder LIVE AKTIV.
- Prepared/Preview/WouldSend/Blocked-Zähler.
- Blockiergründe aus dem ChatOutput-Dispatcher.
- Dry-Run Output-Preview.
- Event-Lifecycle-Regeln.
- Archivieren nur bei `finished`.
- Löschen mit zusätzlicher DELETE-Eingabe.

## Nicht geändert

- Keine echte Twitch-Ausgabe.
- Kein Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Keine DB-Migration.

## Tests

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-22 Dashboard Safety View"
```

Danach Dashboard öffnen und Event-System → Sicherheit prüfen.
