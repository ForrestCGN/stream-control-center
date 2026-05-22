# CURRENT_STATUS

## STEP273A – Command-System Core

Der erste Backend-Kern für ein zentrales Command-System ist vorbereitet.

### Status

- Neues Modul `backend/modules/commands.js` vorhanden.
- Neue API-Routen unter `/api/commands/*` vorhanden.
- Sanfte DB-Erweiterung über `command_definitions` und `command_execution_log` vorbereitet.
- Seed-Commands für Deathcounter V2 vorhanden:
  - `!rip`
  - `!tode`
  - `!dcount`
- Commands können per API trocken getestet oder ausgeführt werden.
- `twitch_presence.js` bleibt der geplante zentrale Twitch-Chat-Eingang.
- Für den Hook in `twitch_presence.js` liegt ein idempotentes Node-Tool unter `tools/easy/STEP273A_APPLY_TWITCH_PRESENCE_COMMAND_HOOK.cjs` bei.

### Wichtig

Nach dem Entpacken muss einmal ausgeführt werden:

```bat
node tools\easy\STEP273A_APPLY_TWITCH_PRESENCE_COMMAND_HOOK.cjs
```

Danach Backend neu starten.

### Bewusst nicht enthalten

- Kein Dashboard-Ausbau.
- Keine zweite Twitch-IRC-Verbindung.
- Kein Umbau bestehender Module.
- Keine Entfernung bestehender Streamer.bot-Endpunkte.

## Vorheriger Stand – STEP272J – Sound-Pegel Stable-Doku

Der Sound-Pegel-/Lautstärke-Workflow ist als stabiler Zwischenstand dokumentiert.

- Sound-System-Defaults: 80 %
- Upload-Default: 80 %
- Max Playback Volume: 100 %
- Playback-Korrektur: für Einpegelung deaktiviert
- Scan läuft wieder nach STEP272I5
- Backup-/Promote-Workflow vorhanden
- Dashboard-Dropdown für Boost-Kopien vorhanden
- Usage-Check vorhanden
- Scan-Excludes für Test-/Backup-/Generated-Dateien vorhanden
