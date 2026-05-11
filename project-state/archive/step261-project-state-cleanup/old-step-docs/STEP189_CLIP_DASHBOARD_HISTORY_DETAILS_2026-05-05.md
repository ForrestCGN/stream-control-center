# STEP189 - Clip Dashboard History Details

Stand: 2026-05-05

## Ziel

Clip-Dashboard erweitert die History-Ansicht um eine Detailansicht pro Clip-Verarbeitung.

## Betroffene Dateien

- `htdocs/dashboard/modules/clips.js`
- `htdocs/dashboard/modules/clips.css`

## Backend/DB

Keine Backend-Änderung.
Keine DB-Änderung.
Keine direkten Datei- oder DB-Zugriffe im Dashboard.

## Genutzte API

- `GET /api/clip/history?limit=50`

Optional später:
- `GET /api/clip/job/:jobId`, wenn eine Detail-Route pro Job aktiv genutzt werden soll.

## Neue Dashboard-Funktionen

- History-Zeilen sind auswählbar.
- Detailkarte zeigt:
  - Status
  - Discord-Status
  - OBS-Replay-Status
  - lokale Replay-Datei
  - Twitch Clip-ID/URL/Edit-URL
  - Job-ID
  - Fehlergrund
  - Streamtitel/Game/TriggerUser
- Repost/Retry-Buttons werden vorbereitet, bleiben aber disabled, solange keine Backend-Route existiert.

## Bewusst nicht umgesetzt

- Kein Repost
- Kein Retry
- Kein Löschen von History-Einträgen
- Kein Backend-Write

Diese Aktionen bekommen erst Backend-Routen und Rechteprüfung.
