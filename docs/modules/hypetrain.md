# HypeTrain-Modul

Stand: 2026-06-21  
Marker: `STEP_HT2_1_HYPETRAIN_BACKEND_DB_STATUS_PREVIEW`  
Modul: `hypetrain`  
Version: `0.1.0`

## Ziel

Dieses Modul ist der erste saubere Backend-Step fuer das neue HypeTrain-System im `stream-control-center`.

Es ersetzt in HT2.1 noch keine produktive HypeTrain-Logik aus `twitch_events`, sondern ergaenzt ein eigenes Fachmodul fuer:

- DB-basierte Config-Vorbereitung
- DB-basierte HypeTrain-Runs
- DB-basierte Beitrags-/Runtime-Erfassung
- Status-/Statistik-Routen
- Discord-/Tagebuch-Textvorschau
- Textvarianten-Vorbereitung
- spaetere Dashboard-Tabs

## Wichtige Regel

`twitch_events` bleibt EventSub-Quelle.  
`hypetrain` baut kein eigenes EventSub-System.

Die Eventdaten kommen ueber den bestehenden Communication-Bus:

```text
twitch.hypetrain.started
twitch.hypetrain.progress
twitch.hypetrain.ended
twitch.hypetrain.record_broken
twitch.cheer.received
twitch.sub.received
twitch.resub.received
twitch.subgift.received
twitch.giftbomb.received
twitch.raid.received
```

## Datenschutz / Top-Unterstuetzer

Standard:

```text
includeTopContributors = false
includeContributorNames = false
```

Discord-/Tagebuch-Vorschauen zeigen standardmaessig keine Namen und keine Top-Unterstuetzer-Ranglisten.

Stattdessen werden nur aggregierte Werte genutzt:

```text
Bits
Subs
Resubs
GiftSubs
HypeTrain-Punkte
Level
Rekordinfo
Raid-Kontext
Dauer
```

## DB-Schema

Das Modul nutzt die zentrale DB-Schicht `backend/core/database.js` und deren Dialekt-Helper, damit die Tabellen spaeter besser fuer SQLite, MySQL und MariaDB migrierbar bleiben.

Tabellen:

```text
hypetrain_runs
hypetrain_contributions
hypetrain_runtime_events
```

Settings laufen ueber:

```text
hypetrain_settings
```

Textvarianten laufen ueber das vorhandene System:

```text
module_text_variants
module_name = hypetrain
```

## API-Routen

```text
GET  /api/hypetrain/status
GET  /api/hypetrain/config
POST /api/hypetrain/config
GET  /api/hypetrain/texts
POST /api/hypetrain/texts
GET  /api/hypetrain/stats
GET  /api/hypetrain/preview
POST /api/hypetrain/preview
POST /api/hypetrain/test/synthetic?confirm=1
GET  /api/hypetrain/routes
```

## Preview-Beispiele

Normal ohne Rekord:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/preview?level=2&points=2500&bits=1500&subs=1&resubs=1&giftSubs=1" |
  ConvertTo-Json -Depth 8
```

Raid + Rekord:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/preview?raid=1&record=1&level=5&points=9600&bits=3500&subs=3&giftSubs=4" |
  ConvertTo-Json -Depth 8
```

Synthetischer DB-Test ohne produktives Senden:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/hypetrain/test/synthetic?confirm=1" `
  -ContentType "application/json" `
  -Body '{"raid":true,"record":true,"level":5,"points":9600,"bits":3500,"subs":3,"giftSubs":4}' |
  ConvertTo-Json -Depth 10
```

## Was HT2.1 nicht macht

```text
Kein produktives Discord-Posting
Kein produktives Tagebuch-Posting
Kein Rekord-Sound-Umbau
Kein Dashboard-Tab
Kein Entfernen alter HypeTrain-Logik aus twitch_events
Kein neues EventSub-System
Keine produktive DB ersetzen
Keine Funktionalität entfernen
```

## Naechster sinnvoller Step

```text
STEP_HT2_2_HYPETRAIN_DASHBOARD_TABS
```

Ziel:

```text
Dashboard-Modul mit Tabs:
Übersicht | Config | Texte | Statistik | Tests
```
