# CURRENT_SYSTEM_STATUS

## STEP273A – Command-System Core

Stand: 2026-05-22

Der erste Core für ein zentrales Chat-Command-System ist vorbereitet.

### Aktueller bestätigter Stand

- Neues Backend-Modul `backend/modules/commands.js`.
- Neue API-Routen unter `/api/commands/*`.
- Sanfte DB-Erweiterung:
  - `command_definitions`
  - `command_execution_log`
- Default-Seed-Commands:
  - `!rip` → Deathcounter V2
  - `!tode` → Deathcounter V2
  - `!dcount` → Deathcounter V2, Permission `mod`
- Trockentest über `/api/commands/test`.
- Ausführung über `/api/commands/execute`.
- `twitch_presence.js` bleibt der zentrale Twitch-IRC-Eingang.
- Ein idempotentes Hook-Tool ergänzt den `PRIVMSG`-Weiterleiter zu `commands.handleChatMessage(...)`.

### Wichtiger Ablauf nach Entpacken

```bat
node tools\easy\STEP273A_APPLY_TWITCH_PRESENCE_COMMAND_HOOK.cjs
node --check backend\modules\commands.js
node --check backend\modules\twitch_presence.js
```

Danach Backend neu starten.

### Bewusst nicht geändert

- Kein Dashboard-Modul in diesem STEP.
- Kein Umbau von Deathcounter V2.
- Kein Entfernen bestehender Streamer.bot-kompatibler APIs.
- Keine zweite Twitch-IRC-Verbindung.
- Keine Secrets.
- Keine direkte DB-Ersetzung.

### Tests

```bat
curl "http://127.0.0.1:8080/api/commands/status"
curl "http://127.0.0.1:8080/api/commands/list"
curl "http://127.0.0.1:8080/api/commands/test?message=!rip%20@ForrestCGN&user=forrestcgn"
curl "http://127.0.0.1:8080/api/commands/test?message=!dcount%20show&user=forrestcgn&role=mod"
```

### Offene Restpunkte

- Dashboard-Ausbau folgt in STEP273B.
- Weitere Module wie Hug, Clip, TTS und SoundAlerts sind noch nicht angebunden.
- Command-Antworttexte sind noch nicht als eigener Textvarianten-Bereich umgesetzt.
- Rollen-/Rechte-System ist erstmal simpel und muss später mit der Dashboard-Userverwaltung gekoppelt werden.

## Vorheriger stabiler Stand – STEP272J – Sound-Pegel Stable-Doku

Der Sound-Pegel-/Lautstärke-Workflow ist als stabiler Zwischenstand dokumentiert.

- Sound-System-Defaults stehen auf 80 %.
- Upload-Default steht auf 80 %.
- Max Playback Volume steht auf 100 %.
- Playback-Korrektur war für das Einpegeln deaktiviert.
- Sound-Pegel-Scan funktioniert nach STEP272I5 wieder.
- Boost-Kopien liegen testweise unter `htdocs/assets/sounds/normalized/<originalpfad>`.
- Produktive Übernahme ersetzt das Original nur nach Backup.
- Backups liegen unter `htdocs/assets/sounds/_backup_loudness/<timestamp>/<originalpfad>`.
