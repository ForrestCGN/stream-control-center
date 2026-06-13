# CURRENT CHAT HANDOFF – EVS-13 User Statistics Filter

Stand: 2026-06-13

## Step
EVS-13 – User Statistics Filter / User Detail Report

## Ziel
Im Statistik-Tab des Event-Systems soll nach User gefiltert werden können. Für einen ausgewählten User werden Event-, Text- und spätere Sound-Statistiken sichtbar: wann, wie, wo, welches Wort, welche Lösung, welche Punkte und später welcher Song/Sound.

## Geändert
- `backend/modules/stream_events.js`
  - Version auf `0.4.6`
  - Build auf `STEP_EVS_13_USER_STATISTICS_FILTER`
  - neue User-Statistik-Reports
  - keine direkte Twitch-Chat-Ausgabe
  - keine DB-Änderung an bestehender Struktur
- `htdocs/dashboard/modules/stream_events.js`
  - Statistik-Tab mit User-Dropdown
  - Userliste laden/aktualisieren
  - User-Detailreport anzeigen
  - Bereiche: Zusammenfassung, Wörter, Satzlösungen, Sound vorbereitet, Timeline
- `htdocs/dashboard/modules/stream_events.css`
  - Styles für User-Filter und User-Detailreport

## Neue Routen
- `GET /api/stream-events/statistics/users?eventUid=<eventUid>`
- `GET /api/stream-events/statistics/user/:login?eventUid=<eventUid>`

## Wichtige Regeln
- Bestehende Runtime bleibt unverändert.
- User-Statistik liest nur bestehende Tabellen:
  - `stream_events_score_entries`
  - `stream_events_text_word_hits`
  - `stream_events_text_phrase_solves`
  - `stream_events_events`
- Sound-Bereich ist vorbereitet und zeigt später Sound-bezogene Score-Einträge an.
- Keine neue Bus-Struktur.
- Keine direkte Twitch-Ausgabe.

## Tests
Syntaxcheck:

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
```

API-Test:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/statistics/users
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/statistics/user/testuser
```

Dashboard:

```text
http://127.0.0.1:8080/dashboard
Event-System -> Statistik -> Userliste laden -> User auswählen
```
