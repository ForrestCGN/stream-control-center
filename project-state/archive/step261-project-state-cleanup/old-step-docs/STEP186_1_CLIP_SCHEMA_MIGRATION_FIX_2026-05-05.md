# STEP186.1 - Clip Schema Migration Fix

Stand: 2026-05-05

## Ziel

Korrektur der Clip-History-Schema-Migration aus STEP186.

## Problem

Nach STEP186 meldete `/api/clip/status` im Datenbankblock:

```text
no such column: job_id
```

Ursache: Der Index `idx_clip_history_job_id` wurde angelegt, bevor die neue Spalte `job_id` bei bestehenden `clip_history`-Tabellen garantiert vorhanden war.

## Änderung

Betroffene Datei:

- `backend/modules/clips.js`

Anpassung:

- `clip_history` wird weiterhin per `CREATE TABLE IF NOT EXISTS` sanft vorbereitet.
- Neue Spalten werden zuerst per `ALTER TABLE ... ADD COLUMN` angelegt.
- Erst danach werden die Indizes erstellt.
- Die Schema-Version wird danach auf `2` gesetzt.
- Keine bestehenden Clip-Daten werden gelöscht.
- Keine bestehende Route wird entfernt.

## Nicht geändert

- Kein Umbau am Twitch-Flow.
- Kein Umbau an OBS.
- Kein Dashboard-Umbau.
- Kein lokales Datei-Rename-Handling; das bleibt fuer STEP187 geplant.

## Tests

Nach Deploy pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=5" | ConvertTo-Json -Depth 30
```

Erwartung:

- `database.ok = true`
- `schemaVersion = 2`
- keine Fehlermeldung `no such column: job_id`

## Hinweis OBS

Wenn `obsReplay.replayBufferActive = false`, blockiert `/api/clip/create` bewusst mit `obs_replay_buffer_not_active`. Fuer den echten Clip-Flow muss der OBS Replay Buffer aktiv sein, damit der lokale 60-Sekunden-Clip erzeugt werden kann.
